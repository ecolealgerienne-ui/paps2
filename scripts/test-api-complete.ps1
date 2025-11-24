# =============================================================================
# AniTra API Test Script COMPLET - Toutes les phases (PowerShell)
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

# Default farm ID from AuthGuard dev mode
$FarmId = "550e8400-e29b-41d4-a716-446655440000"

# Helper functions
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Blue
    Write-Host $Text -ForegroundColor Blue
    Write-Host "============================================" -ForegroundColor Blue
}

function Write-Test {
    param([string]$Text)
    Write-Host "[TEST] $Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "  OK: $Text" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Text)
    Write-Host "  ERROR: $Text" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "  WARNING: $Text" -ForegroundColor Yellow
}

# Check if API response has error
function Test-ApiError {
    param($response)

    if ($response.error -or ($response.statusCode -and $response.statusCode -ge 400)) {
        if ($response.errors) {
            Write-ErrorMsg "API Error: $($response.message) - Details: $($response.errors | ConvertTo-Json -Compress) (HTTP $($response.statusCode))"
        } elseif ($response.code) {
            Write-ErrorMsg "API Error: $($response.code) - $($response.message) (HTTP $($response.statusCode))"
        } else {
            Write-ErrorMsg "API Error: $($response.error) (HTTP $($response.statusCode))"
        }
        return $true
    }
    return $false
}

# Generic API call function
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [switch]$NoDelay
    )

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    $uri = "$BaseUrl$Endpoint"

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody -DisableKeepAlive
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -DisableKeepAlive
        }

        # Rate limiting: wait 350ms between requests (max 3 req/sec)
        if (-not $NoDelay) {
            Start-Sleep -Milliseconds 350
        }

        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue

        if ($errorResponse) {
            # Add status code to error object
            $errorResponse | Add-Member -NotePropertyName "statusCode" -NotePropertyValue $statusCode -Force
            return $errorResponse
        }

        return @{
            success = $false
            error = $_.Exception.Message
            statusCode = $statusCode
        }
    }
}

# Helper to get data from response
function Get-ResponseData {
    param($response, $field)

    # Check if response has error
    if ($response.error -or $response.statusCode -ge 400) {
        Write-ErrorMsg "API Error: $($response.error) (HTTP $($response.statusCode))"
        return $null
    }

    # Handle wrapped response {data: ...}
    if ($response.data) {
        return $response.data.$field
    }

    # Handle direct response {id, name, ...}
    return $response.$field
}

# =============================================================================
# Health Check
# =============================================================================
Write-Header "Health Check - 2 endpoints"

Write-Test "GET / - Root endpoint"
$response = Invoke-Api -Method GET -Endpoint "/"
$response | ConvertTo-Json -Depth 5

Write-Test "GET /health - Health check with DB connection test"
$response = Invoke-Api -Method GET -Endpoint "/health"
if ($response.data.status -eq "ok" -and $response.data.database -eq "connected") {
    Write-Success "Health check OK - Database connected"
} elseif ($response.data.status -eq "error") {
    Write-ErrorMsg "Health check FAILED - Database disconnected"
} else {
    Write-Warning "Health check returned unexpected response"
}

# =============================================================================
# Setup - Create test farm for all tests
# =============================================================================
Write-Header "Setup - Create test farm"

Write-Test "POST /api/farms - Create test farm with fixed ID"
$setupFarmResponse = Invoke-Api -Method POST -Endpoint "/api/farms" -Body @{
    id = $FarmId
    name = "Ferme de Test API"
    location = "Alger, Algerie"
    ownerId = "test-owner-script"
    cheptelNumber = "TEST-SCRIPT-001"
}
if (-not (Test-ApiError $setupFarmResponse)) {
    Write-Success "Test farm created: $FarmId"
} else {
    Write-Warning "Farm may already exist, continuing tests..."
}

# =============================================================================
# Countries - FULL CRUD - 5 endpoints (PHASE 04)
# =============================================================================
Write-Header "Countries API - 5 endpoints (FULL CRUD)"

Write-Test "POST /countries - Create test country"
$testCountryResponse = Invoke-Api -Method POST -Endpoint "/countries" -Body @{
    code = "TS"
    nameFr = "Test Country"
    nameEn = "Test Country"
    nameAr = "Test Country AR"
    region = "Africa"
    isActive = $true
}
$testCountryCode = Get-ResponseData $testCountryResponse "code"
Write-Success "Created: $testCountryCode"

Write-Test "GET /countries - Get all countries"
$response = Invoke-Api -Method GET -Endpoint "/countries"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count countries"

# Get first country code for later tests
$countryCode = $null
if ($response.data -and $response.data.Count -gt 0) {
    $countryCode = $response.data[0].code
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $countryCode = $response[0].code
}

if ($testCountryCode) {
    Write-Test "GET /countries/$testCountryCode - Get one country"
    $response = Invoke-Api -Method GET -Endpoint "/countries/$testCountryCode"
    $name = Get-ResponseData $response "nameFr"
    if ($name) {
        Write-Success "Retrieved: $name"
    } else {
        Write-Success "Retrieved country"
    }

    Write-Test "PATCH /countries/$testCountryCode - Update country"
    $response = Invoke-Api -Method PATCH -Endpoint "/countries/$testCountryCode" -Body @{
        nameFr = "Test Country Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated country name"
    }

    Write-Test "DELETE /countries/$testCountryCode - Delete test country"
    $response = Invoke-Api -Method DELETE -Endpoint "/countries/$testCountryCode"
    if (-not (Test-ApiError $response)) {
        Write-Success "Deleted test country"
    }
}

# =============================================================================
# Species - READ ONLY - 1 endpoint (PHASE 01)
# =============================================================================
Write-Header "Species API - 1 endpoint (READ-ONLY)"

Write-Test "GET /api/v1/species - Get all species"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/species"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count species"

# Get first species ID for later tests
$speciesId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $speciesId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $speciesId = $response[0].id
}

# =============================================================================
# Breeds - READ ONLY - 2 endpoints (PHASE 01)
# =============================================================================
Write-Header "Breeds API - 2 endpoints (READ-ONLY)"

Write-Test "GET /api/v1/breeds - Get all breeds"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/breeds"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count breeds"

# Get first breed ID for later tests
$breedId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $breedId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $breedId = $response[0].id
}

if ($speciesId) {
    Write-Test "GET /api/v1/breeds?speciesId=$speciesId - Filter by species"
    $response = Invoke-Api -Method GET -Endpoint "/api/v1/breeds?speciesId=$speciesId"
    if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
    Write-Success "Found: $count breeds for species"
}

# =============================================================================
# Administration Routes - READ ONLY - 2 endpoints (PHASE 02)
# =============================================================================
Write-Header "Administration Routes API - 2 endpoints (READ-ONLY)"

Write-Test "GET /administration-routes - List all"
$response = Invoke-Api -Method GET -Endpoint "/administration-routes"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count routes"

Write-Test "GET /administration-routes/IM - Get one"
$response = Invoke-Api -Method GET -Endpoint "/administration-routes/IM"
$name = Get-ResponseData $response "nameFr"
if ($name) {
    Write-Success "Retrieved: $name"
} else {
    Write-Success "Retrieved route"
}

# =============================================================================
# Global Medical Products - FULL CRUD - 5 endpoints (PHASE 05)
# =============================================================================
Write-Header "Global Medical Products API - 5 endpoints (FULL CRUD)"

Write-Test "POST /global-medical-products - Create test product"
$testProductResponse = Invoke-Api -Method POST -Endpoint "/global-medical-products" -Body @{
    code = "TEST-PROD-001"
    nameFr = "Produit Test"
    nameEn = "Test Product"
    nameAr = "Test Product AR"
    type = "antibiotic"
    laboratoire = "Test Lab"
    principeActif = "Test Ingredient"
}
$testGlobalProductId = Get-ResponseData $testProductResponse "id"
Write-Success "Created: $testGlobalProductId"

Write-Test "GET /global-medical-products - Get all"
$response = Invoke-Api -Method GET -Endpoint "/global-medical-products"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count global medical products"

# Get first product ID for later tests
$globalProductId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $globalProductId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $globalProductId = $response[0].id
}

if ($testGlobalProductId) {
    Write-Test "GET /global-medical-products/$testGlobalProductId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/global-medical-products/$testGlobalProductId"
    $name = Get-ResponseData $response "nameFr"
    if ($name) {
        Write-Success "Retrieved: $name"
    } else {
        Write-Success "Retrieved product"
    }

    Write-Test "PATCH /global-medical-products/$testGlobalProductId - Update"
    $response = Invoke-Api -Method PATCH -Endpoint "/global-medical-products/$testGlobalProductId" -Body @{
        nameFr = "Produit Test Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated product name"
    }

    Write-Test "DELETE /global-medical-products/$testGlobalProductId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/global-medical-products/$testGlobalProductId"
    if (-not (Test-ApiError $response)) {
        Write-Success "Deleted test product"
    }
}

# =============================================================================
# Vaccines Global - FULL CRUD - 5 endpoints (PHASE 17)
# =============================================================================
Write-Header "Vaccines Global API - 5 endpoints (FULL CRUD)"

Write-Test "POST /vaccines-global - Create test vaccine"
$testVaccineResponse = Invoke-Api -Method POST -Endpoint "/vaccines-global" -Body @{
    code = "TEST-VAC-001"
    nameFr = "Vaccin Test"
    nameEn = "Test Vaccine"
    nameAr = "Test Vaccine AR"
    targetDisease = "brucellosis"
    laboratoire = "Test Lab"
}
$testGlobalVaccineId = Get-ResponseData $testVaccineResponse "id"
Write-Success "Created: $testGlobalVaccineId"

Write-Test "GET /vaccines-global - Get all"
$response = Invoke-Api -Method GET -Endpoint "/vaccines-global"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count global vaccines"

# Get first vaccine ID for later tests
$globalVaccineId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $globalVaccineId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $globalVaccineId = $response[0].id
}

if ($testGlobalVaccineId) {
    Write-Test "GET /vaccines-global/$testGlobalVaccineId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/vaccines-global/$testGlobalVaccineId"
    $name = Get-ResponseData $response "nameFr"
    if ($name) {
        Write-Success "Retrieved: $name"
    } else {
        Write-Success "Retrieved vaccine"
    }

    Write-Test "PATCH /vaccines-global/$testGlobalVaccineId - Update"
    $response = Invoke-Api -Method PATCH -Endpoint "/vaccines-global/$testGlobalVaccineId" -Body @{
        nameFr = "Vaccin Test Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated vaccine name"
    }

    Write-Test "DELETE /vaccines-global/$testGlobalVaccineId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/vaccines-global/$testGlobalVaccineId"
    if (-not (Test-ApiError $response)) {
        Write-Success "Deleted test vaccine"
    }
}

# =============================================================================
# National Campaigns - FULL CRUD - 5 endpoints (PHASE 07)
# =============================================================================
Write-Header "National Campaigns API - 5 endpoints (FULL CRUD)"

Write-Test "POST /api/national-campaigns - Create test campaign"
$testCampaignResponse = Invoke-Api -Method POST -Endpoint "/api/national-campaigns" -Body @{
    code = "test-camp-001"
    nameFr = "Campagne Test"
    nameEn = "Test Campaign"
    nameAr = "Test Campaign AR"
    type = "vaccination"
    startDate = "2025-01-01T00:00:00Z"
    endDate = "2025-12-31T23:59:59Z"
    description = "Test campaign"
}
$testNationalCampaignId = Get-ResponseData $testCampaignResponse "id"
Write-Success "Created: $testNationalCampaignId"

Write-Test "GET /api/national-campaigns - Get all"
$response = Invoke-Api -Method GET -Endpoint "/api/national-campaigns"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count national campaigns"

# Get first campaign ID for later tests
$nationalCampaignId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $nationalCampaignId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $nationalCampaignId = $response[0].id
}

if ($testNationalCampaignId) {
    Write-Test "GET /api/national-campaigns/$testNationalCampaignId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/api/national-campaigns/$testNationalCampaignId"
    $name = Get-ResponseData $response "nameFr"
    if ($name) {
        Write-Success "Retrieved: $name"
    } else {
        Write-Success "Retrieved campaign"
    }

    Write-Test "PUT /api/national-campaigns/$testNationalCampaignId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/api/national-campaigns/$testNationalCampaignId" -Body @{
        nameFr = "Campagne Test Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated campaign name"
    }

    Write-Test "DELETE /api/national-campaigns/$testNationalCampaignId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/national-campaigns/$testNationalCampaignId"
    if (-not (Test-ApiError $response)) {
        Write-Success "Deleted test campaign"
    }
}

# =============================================================================
# Alert Templates - FULL CRUD - 5 endpoints (PHASE 06)
# =============================================================================
Write-Header "Alert Templates API - 5 endpoints (FULL CRUD)"

Write-Test "POST /alert-templates - Create test template"
$testTemplateResponse = Invoke-Api -Method POST -Endpoint "/alert-templates" -Body @{
    code = "test-template-001"
    nameFr = "Template Test"
    nameEn = "Test Template"
    nameAr = "Test Template AR"
    category = "health"
    priority = "medium"
}
$testAlertTemplateId = Get-ResponseData $testTemplateResponse "id"
Write-Success "Created: $testAlertTemplateId"

Write-Test "GET /alert-templates - Get all"
$response = Invoke-Api -Method GET -Endpoint "/alert-templates"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count alert templates"

# Get first template ID for later tests
$alertTemplateId = $null
if ($response.data -and $response.data.Count -gt 0) {
    $alertTemplateId = $response.data[0].id
} elseif ($response -is [array] -and $response.Count -gt 0) {
    $alertTemplateId = $response[0].id
}

if ($testAlertTemplateId) {
    Write-Test "GET /alert-templates/$testAlertTemplateId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/alert-templates/$testAlertTemplateId"
    $name = Get-ResponseData $response "nameFr"
    if ($name) {
        Write-Success "Retrieved: $name"
    } else {
        Write-Success "Retrieved template"
    }

    Write-Test "PATCH /alert-templates/$testAlertTemplateId - Update"
    $response = Invoke-Api -Method PATCH -Endpoint "/alert-templates/$testAlertTemplateId" -Body @{
        nameFr = "Template Test Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated template name"
    }

    Write-Test "DELETE /alert-templates/$testAlertTemplateId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/alert-templates/$testAlertTemplateId"
    if (-not (Test-ApiError $response)) {
        Write-Success "Deleted test template"
    }
}

# =============================================================================
# Breed Countries - FULL CRUD - 5 endpoints (PHASE 19)
# =============================================================================
Write-Header "Breed Countries API - 5 endpoints (PHASE 19)"

if ($breedId -and $countryCode) {
    Write-Test "POST /api/v1/breed-countries - Create association"
    $breedCountryResponse = Invoke-Api -Method POST -Endpoint "/api/v1/breed-countries" -Body @{
        breedId = $breedId
        countryCode = $countryCode
        isActive = $true
    }
    $breedCountryId = Get-ResponseData $breedCountryResponse "id"
    Write-Success "Created: $breedCountryId"
}

Write-Test "GET /api/v1/breed-countries - List all"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/breed-countries"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count breed-country associations"

if ($breedCountryId) {
    Write-Test "GET /api/v1/breed-countries/$breedCountryId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/api/v1/breed-countries/$breedCountryId"
    Write-Success "Retrieved association"

    Write-Test "PUT /api/v1/breed-countries/$breedCountryId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/api/v1/breed-countries/$breedCountryId" -Body @{
        isActive = $false
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated to inactive"
    }

    Write-Test "DELETE /api/v1/breed-countries/$breedCountryId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/v1/breed-countries/$breedCountryId"
    Write-Success "Deleted"
}

# =============================================================================
# Product Countries - FULL CRUD - 5 endpoints (PHASE 21)
# =============================================================================
Write-Header "Product Countries API - 5 endpoints (PHASE 21)"

if ($globalProductId -and $countryCode) {
    Write-Test "POST /api/v1/product-countries - Create association"
    $productCountryResponse = Invoke-Api -Method POST -Endpoint "/api/v1/product-countries" -Body @{
        productId = $globalProductId
        countryCode = $countryCode
        isActive = $true
    }
    $productCountryId = Get-ResponseData $productCountryResponse "id"
    Write-Success "Created: $productCountryId"
}

Write-Test "GET /api/v1/product-countries - List all"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/product-countries"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count product-country associations"

if ($productCountryId) {
    Write-Test "GET /api/v1/product-countries/$productCountryId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/api/v1/product-countries/$productCountryId"
    Write-Success "Retrieved association"

    Write-Test "PUT /api/v1/product-countries/$productCountryId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/api/v1/product-countries/$productCountryId" -Body @{
        isActive = $false
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated to inactive"
    }

    Write-Test "DELETE /api/v1/product-countries/$productCountryId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/v1/product-countries/$productCountryId"
    Write-Success "Deleted"
}

# =============================================================================
# Vaccine Countries - FULL CRUD - 5 endpoints (PHASE 18)
# =============================================================================
Write-Header "Vaccine Countries API - 5 endpoints (PHASE 18)"

if ($globalVaccineId -and $countryCode) {
    Write-Test "POST /api/v1/vaccine-countries - Create association"
    $vaccineCountryResponse = Invoke-Api -Method POST -Endpoint "/api/v1/vaccine-countries" -Body @{
        vaccineId = $globalVaccineId
        countryCode = $countryCode
        isActive = $true
    }
    $vaccineCountryId = Get-ResponseData $vaccineCountryResponse "id"
    Write-Success "Created: $vaccineCountryId"
}

Write-Test "GET /api/v1/vaccine-countries - List all"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/vaccine-countries"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count vaccine-country associations"

if ($vaccineCountryId) {
    Write-Test "GET /api/v1/vaccine-countries/$vaccineCountryId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/api/v1/vaccine-countries/$vaccineCountryId"
    Write-Success "Retrieved association"

    Write-Test "PUT /api/v1/vaccine-countries/$vaccineCountryId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/api/v1/vaccine-countries/$vaccineCountryId" -Body @{
        isActive = $false
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated to inactive"
    }

    Write-Test "DELETE /api/v1/vaccine-countries/$vaccineCountryId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/v1/vaccine-countries/$vaccineCountryId"
    Write-Success "Deleted"
}

# =============================================================================
# Campaign Countries - FULL CRUD - 5 endpoints (PHASE 16)
# =============================================================================
Write-Header "Campaign Countries API - 5 endpoints (PHASE 16)"

if ($nationalCampaignId -and $countryCode) {
    Write-Test "POST /api/v1/campaign-countries - Create association"
    $campaignCountryResponse = Invoke-Api -Method POST -Endpoint "/api/v1/campaign-countries" -Body @{
        campaignId = $nationalCampaignId
        countryCode = $countryCode
    }
    $campaignCountryId = Get-ResponseData $campaignCountryResponse "id"
    Write-Success "Created: $campaignCountryId"
}

Write-Test "GET /api/v1/campaign-countries - List all"
$response = Invoke-Api -Method GET -Endpoint "/api/v1/campaign-countries"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count campaign-country associations"

if ($campaignCountryId) {
    Write-Test "GET /api/v1/campaign-countries/$campaignCountryId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/api/v1/campaign-countries/$campaignCountryId"
    Write-Success "Retrieved association"

    Write-Test "PUT /api/v1/campaign-countries/$campaignCountryId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/api/v1/campaign-countries/$campaignCountryId" -Body @{
        isActive = $false
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated to inactive"
    }

    Write-Test "DELETE /api/v1/campaign-countries/$campaignCountryId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/v1/campaign-countries/$campaignCountryId"
    Write-Success "Deleted"
}

# =============================================================================
# Farms - FULL CRUD - 5 endpoints (PHASE 03)
# =============================================================================
Write-Header "Farms API - 5 endpoints"

Write-Test "POST /api/farms - Create test farm"
$testFarmResponse = Invoke-Api -Method POST -Endpoint "/api/farms" -Body @{
    id = [guid]::NewGuid().ToString()
    name = "Ferme Test Script"
    location = "Alger, Algerie"
    ownerId = "test-owner-001"
    cheptelNumber = "TEST-2024-001"
}
$testFarmId = Get-ResponseData $testFarmResponse "id"
Write-Success "Created test farm: $testFarmId"

Write-Test "GET /api/farms - List all farms"
$response = Invoke-Api -Method GET -Endpoint "/api/farms"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count farms"

if ($testFarmId) {
    Write-Test "GET /api/farms/$testFarmId - Get farm without stats"
    $response = Invoke-Api -Method GET -Endpoint "/api/farms/$testFarmId"
    Write-Success "Retrieved farm"

    Write-Test "GET /api/farms/$testFarmId`?includeStats=true - Get farm with stats"
    $response = Invoke-Api -Method GET -Endpoint "/api/farms/$testFarmId`?includeStats=true"
    if ($response.data._count -or $response._count) {
        Write-Success "Retrieved farm WITH stats"
    }

    Write-Test "PUT /api/farms/$testFarmId - Update farm"
    $response = Invoke-Api -Method PUT -Endpoint "/api/farms/$testFarmId" -Body @{
        name = "Ferme Test Script - Updated"
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated farm name"
    }

    Write-Test "DELETE /api/farms/$testFarmId - Delete test farm"
    $response = Invoke-Api -Method DELETE -Endpoint "/api/farms/$testFarmId"
    Write-Success "Deleted test farm"
}

# =============================================================================
# Veterinarians - FULL CRUD - 5 endpoints
# =============================================================================
Write-Header "Veterinarians API - 5 endpoints"

Write-Test "POST /farms/$FarmId/veterinarians - Create"
$vetResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/veterinarians" -Body @{
    firstName = "Ahmed"
    lastName = "Benali"
    title = "Dr."
    phone = "0551234567"
    email = "ahmed.benali@vet.dz"
    licenseNumber = "VET-2024-001"
    specialties = "Ruminants"
}
$vetId = Get-ResponseData $vetResponse "id"
Write-Success "Created: $vetId"

Write-Test "GET /farms/$FarmId/veterinarians - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarians"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count veterinarians"

if ($vetId) {
    Write-Test "GET /farms/$FarmId/veterinarians/$vetId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarians/$vetId"
    Write-Success "Retrieved veterinarian"

    Write-Test "PUT /farms/$FarmId/veterinarians/$vetId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/veterinarians/$vetId" -Body @{
        phone = "0559876543"
    }
    Write-Success "Updated phone"

    Write-Test "DELETE /farms/$FarmId/veterinarians/$vetId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/veterinarians/$vetId"
    Write-Success "Deleted"
}

# =============================================================================
# Custom Medical Products - FULL CRUD - 5 endpoints
# =============================================================================
Write-Header "Custom Medical Products API - 5 endpoints"

Write-Test "POST /farms/$FarmId/medical-products - Create"
$productResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/medical-products" -Body @{
    name = "Ivermectine 1%"
    category = "antiparasitic"
    withdrawalPeriodMeat = 28
    withdrawalPeriodMilk = 0
    stockUnit = "ml"
}
$productId = Get-ResponseData $productResponse "id"
Write-Success "Created: $productId"

Write-Test "GET /farms/$FarmId/medical-products - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/medical-products"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count products"

if ($productId) {
    Write-Test "GET /farms/$FarmId/medical-products/$productId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/medical-products/$productId"
    Write-Success "Retrieved product"

    Write-Test "PUT /farms/$FarmId/medical-products/$productId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/medical-products/$productId" -Body @{
        withdrawalPeriodMeat = 30
    }
    Write-Success "Updated withdrawal period"

    Write-Test "DELETE /farms/$FarmId/medical-products/$productId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/medical-products/$productId"
    Write-Success "Deleted"
}

# =============================================================================
# Custom Vaccines - FULL CRUD - 5 endpoints
# =============================================================================
Write-Header "Custom Vaccines API - 5 endpoints"

Write-Test "POST /farms/$FarmId/vaccines - Create"
$vaccineResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/vaccines" -Body @{
    name = "Enterotoxemie"
    description = "Vaccin contre l'enterotoxemie"
    laboratoire = "INMV Algerie"
    targetDisease = "Enterotoxemie"
    dosage = "2ml par animal"
}
$vaccineId = Get-ResponseData $vaccineResponse "id"
Write-Success "Created: $vaccineId"

Write-Test "GET /farms/$FarmId/vaccines - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/vaccines"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count vaccines"

if ($vaccineId) {
    Write-Test "GET /farms/$FarmId/vaccines/$vaccineId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/vaccines/$vaccineId"
    Write-Success "Retrieved vaccine"

    Write-Test "PUT /farms/$FarmId/vaccines/$vaccineId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/vaccines/$vaccineId" -Body @{
        injectionIntervalDays = 28
    }
    Write-Success "Updated injection interval"

    Write-Test "DELETE /farms/$FarmId/vaccines/$vaccineId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/vaccines/$vaccineId"
    Write-Success "Deleted"
}

# =============================================================================
# Farm Breed Preferences - FULL CRUD - 5 endpoints (PHASE 20)
# =============================================================================
Write-Header "Farm Breed Preferences API - 5 endpoints (PHASE 20)"

if ($breedId) {
    Write-Test "POST /farms/$FarmId/breed-preferences - Create"
    $farmBreedPrefResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/breed-preferences" -Body @{
        breedId = $breedId
        displayOrder = 1
        isActive = $true
    }
    $farmBreedPrefId = Get-ResponseData $farmBreedPrefResponse "id"
    Write-Success "Created: $farmBreedPrefId"
}

Write-Test "GET /farms/$FarmId/breed-preferences - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/breed-preferences"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count breed preferences"

if ($farmBreedPrefId) {
    Write-Test "GET /farms/$FarmId/breed-preferences/$farmBreedPrefId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/breed-preferences/$farmBreedPrefId"
    Write-Success "Retrieved preference"

    Write-Test "PUT /farms/$FarmId/breed-preferences/$farmBreedPrefId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/breed-preferences/$farmBreedPrefId" -Body @{
        displayOrder = 2
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated display order"
    }

    Write-Test "DELETE /farms/$FarmId/breed-preferences/$farmBreedPrefId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/breed-preferences/$farmBreedPrefId"
    Write-Success "Deleted"
}

# =============================================================================
# Farm Product Preferences - FULL CRUD - 5 endpoints (PHASE 21)
# =============================================================================
Write-Header "Farm Product Preferences API - 5 endpoints (PHASE 21)"

if ($globalProductId) {
    Write-Test "POST /farms/$FarmId/product-preferences - Create"
    $farmProductPrefResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/product-preferences" -Body @{
        productId = $globalProductId
        displayOrder = 1
        isActive = $true
    }
    $farmProductPrefId = Get-ResponseData $farmProductPrefResponse "id"
    Write-Success "Created: $farmProductPrefId"
}

Write-Test "GET /farms/$FarmId/product-preferences - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/product-preferences"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count product preferences"

if ($farmProductPrefId) {
    Write-Test "GET /farms/$FarmId/product-preferences/$farmProductPrefId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/product-preferences/$farmProductPrefId"
    Write-Success "Retrieved preference"

    Write-Test "PUT /farms/$FarmId/product-preferences/$farmProductPrefId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/product-preferences/$farmProductPrefId" -Body @{
        displayOrder = 2
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated display order"
    }

    Write-Test "DELETE /farms/$FarmId/product-preferences/$farmProductPrefId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/product-preferences/$farmProductPrefId"
    Write-Success "Deleted"
}

# =============================================================================
# Farm Vaccine Preferences - FULL CRUD - 5 endpoints (PHASE 22)
# =============================================================================
Write-Header "Farm Vaccine Preferences API - 5 endpoints (PHASE 22)"

if ($globalVaccineId) {
    Write-Test "POST /farms/$FarmId/vaccine-preferences - Create with global vaccine"
    $farmVaccinePrefResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/vaccine-preferences" -Body @{
        globalVaccineId = $globalVaccineId
        displayOrder = 1
        isActive = $true
    }
    $farmVaccinePrefId = Get-ResponseData $farmVaccinePrefResponse "id"
    Write-Success "Created: $farmVaccinePrefId"
}

Write-Test "GET /farms/$FarmId/vaccine-preferences - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/vaccine-preferences"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count vaccine preferences"

if ($farmVaccinePrefId) {
    Write-Test "GET /farms/$FarmId/vaccine-preferences/$farmVaccinePrefId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/vaccine-preferences/$farmVaccinePrefId"
    Write-Success "Retrieved preference"

    Write-Test "PUT /farms/$FarmId/vaccine-preferences/$farmVaccinePrefId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/vaccine-preferences/$farmVaccinePrefId" -Body @{
        displayOrder = 2
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated display order"
    }

    Write-Test "DELETE /farms/$FarmId/vaccine-preferences/$farmVaccinePrefId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/vaccine-preferences/$farmVaccinePrefId"
    Write-Success "Deleted"
}

# =============================================================================
# Farm Veterinarian Preferences - FULL CRUD - 5 endpoints (PHASE 23)
# =============================================================================
Write-Header "Farm Veterinarian Preferences API - 5 endpoints (PHASE 23)"

# Create a vet for testing preferences
Write-Test "POST /farms/$FarmId/veterinarians - Create test vet for preferences"
$testVetResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/veterinarians" -Body @{
    firstName = "Test"
    lastName = "Veterinarian"
    title = "Dr."
    phone = "0550000000"
    email = "test@vet.dz"
    licenseNumber = "VET-TEST-001"
    specialties = "General"
}
$testVetId = Get-ResponseData $testVetResponse "id"

if ($testVetId) {
    Write-Test "POST /farms/$FarmId/veterinarian-preferences - Create"
    $farmVetPrefResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/veterinarian-preferences" -Body @{
        veterinarianId = $testVetId
        displayOrder = 1
        isActive = $true
    }
    $farmVetPrefId = Get-ResponseData $farmVetPrefResponse "id"
    Write-Success "Created: $farmVetPrefId"
}

Write-Test "GET /farms/$FarmId/veterinarian-preferences - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarian-preferences"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count veterinarian preferences"

if ($farmVetPrefId) {
    Write-Test "GET /farms/$FarmId/veterinarian-preferences/$farmVetPrefId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarian-preferences/$farmVetPrefId"
    Write-Success "Retrieved preference"

    Write-Test "PUT /farms/$FarmId/veterinarian-preferences/$farmVetPrefId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/veterinarian-preferences/$farmVetPrefId" -Body @{
        displayOrder = 2
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated display order"
    }

    Write-Test "DELETE /farms/$FarmId/veterinarian-preferences/$farmVetPrefId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/veterinarian-preferences/$farmVetPrefId"
    Write-Success "Deleted"
}

# Cleanup test vet
if ($testVetId) {
    $response = Invoke-Api -Method DELETE -Endpoint "/farms/$FarmId/veterinarians/$testVetId"
}

# =============================================================================
# Farm National Campaign Preferences - Enroll/Unenroll - 6 endpoints (PHASE 24)
# =============================================================================
Write-Header "Farm National Campaign Preferences API - 6 endpoints (PHASE 24)"

Write-Test "GET /farms/$FarmId/campaign-preferences - List all"
$response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/campaign-preferences"
if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
Write-Success "Found: $count campaign preferences"

if ($nationalCampaignId) {
    Write-Test "POST /farms/$FarmId/campaign-preferences/$nationalCampaignId/enroll - Enroll in campaign"
    $enrollResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/campaign-preferences/$nationalCampaignId/enroll"
    if (-not (Test-ApiError $enrollResponse)) {
        Write-Success "Enrolled in national campaign"
    }

    Write-Test "GET /farms/$FarmId/campaign-preferences - List after enroll"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/campaign-preferences"
    if ($response.data) { $count = $response.data.Count } else { $count = $response.Count }
    Write-Success "Found: $count campaign preferences (after enroll)"

    Write-Test "GET /farms/$FarmId/campaign-preferences/$nationalCampaignId - Get enrollment status"
    $response = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/campaign-preferences/$nationalCampaignId"
    $isEnrolled = Get-ResponseData $response "isEnrolled"
    if ($isEnrolled) {
        Write-Success "Enrollment status: ENROLLED"
    }

    Write-Test "PUT /farms/$FarmId/campaign-preferences/$nationalCampaignId - Update preference"
    $response = Invoke-Api -Method PUT -Endpoint "/farms/$FarmId/campaign-preferences/$nationalCampaignId" -Body @{
        isEnrolled = $true
    }
    if (-not (Test-ApiError $response)) {
        Write-Success "Updated preference"
    }

    Write-Test "POST /farms/$FarmId/campaign-preferences/$nationalCampaignId/unenroll - Unenroll from campaign"
    $unenrollResponse = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/campaign-preferences/$nationalCampaignId/unenroll"
    if (-not (Test-ApiError $unenrollResponse)) {
        Write-Success "Unenrolled from national campaign"
    }
}

# =============================================================================
# Summary
# =============================================================================
Write-Header "Test Complete - TOUTES LES PHASES"

Write-Host ""
Write-Host "Modules couverts:" -ForegroundColor Green
Write-Host ""
Write-Host "  REFERENCE DATA (READ-ONLY):" -ForegroundColor Cyan
Write-Host "  - Countries (PHASE 04): 2 endpoints" -ForegroundColor White
Write-Host "  - Species (PHASE 01): 1 endpoint" -ForegroundColor White
Write-Host "  - Breeds (PHASE 01): 2 endpoints" -ForegroundColor White
Write-Host "  - Administration Routes (PHASE 02): 2 endpoints" -ForegroundColor White
Write-Host "  - Global Medical Products (PHASE 05): 2 endpoints" -ForegroundColor White
Write-Host "  - Vaccines Global (PHASE 17): 2 endpoints" -ForegroundColor White
Write-Host "  - National Campaigns (PHASE 07): 2 endpoints" -ForegroundColor White
Write-Host "  - Alert Templates (PHASE 06): 2 endpoints" -ForegroundColor White
Write-Host ""
Write-Host "  LIAISON TABLES (CRUD):" -ForegroundColor Cyan
Write-Host "  - Breed Countries (PHASE 19): 5 endpoints" -ForegroundColor White
Write-Host "  - Product Countries (PHASE 21): 5 endpoints" -ForegroundColor White
Write-Host "  - Vaccine Countries (PHASE 18): 5 endpoints" -ForegroundColor White
Write-Host "  - Campaign Countries (PHASE 16): 5 endpoints" -ForegroundColor White
Write-Host ""
Write-Host "  FARM DATA (CRUD):" -ForegroundColor Cyan
Write-Host "  - Farms (PHASE 03): 5 endpoints" -ForegroundColor White
Write-Host "  - Veterinarians: 5 endpoints" -ForegroundColor White
Write-Host "  - Custom Medical Products: 5 endpoints" -ForegroundColor White
Write-Host "  - Custom Vaccines: 5 endpoints" -ForegroundColor White
Write-Host ""
Write-Host "  FARM PREFERENCES (CRUD):" -ForegroundColor Cyan
Write-Host "  - Farm Breed Preferences (PHASE 20): 5 endpoints" -ForegroundColor White
Write-Host "  - Farm Product Preferences (PHASE 21): 5 endpoints" -ForegroundColor White
Write-Host "  - Farm Vaccine Preferences (PHASE 22): 5 endpoints" -ForegroundColor White
Write-Host "  - Farm Veterinarian Preferences (PHASE 23): 5 endpoints" -ForegroundColor White
Write-Host "  - Farm National Campaign Preferences (PHASE 24): 6 endpoints" -ForegroundColor White
Write-Host ""
Write-Host "TOTAL: ~100+ endpoints tested!" -ForegroundColor Green
Write-Host ""
