# =============================================================================
# AniTra API Test Script (PowerShell)
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
    Write-Host "► $Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor Red
}

# Generic API call function
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    $uri = "$BaseUrl$Endpoint"

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    } catch {
        return $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    }
}

# =============================================================================
# Health Check
# =============================================================================
Write-Header "Health Check"

Write-Test "GET /"
try {
    $response = Invoke-RestMethod -Uri $BaseUrl -Method GET
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# =============================================================================
# Veterinarians (Reference Table)
# =============================================================================
Write-Header "Veterinarians API"

Write-Test "POST /veterinarians - Create"
$vetResponse = Invoke-Api -Method POST -Endpoint "/veterinarians" -Body @{
    name = "Dr. Ahmed Benali"
    phone = "0551234567"
    email = "ahmed.benali@vet.dz"
    licenseNumber = "VET-2024-001"
    specialization = "Ruminants"
}
$vetResponse | ConvertTo-Json -Depth 5
$vetId = if ($vetResponse.data) { $vetResponse.data.id } else { $vetResponse.id }

Write-Test "GET /veterinarians - List all"
$response = Invoke-Api -Method GET -Endpoint "/veterinarians"
$response | ConvertTo-Json -Depth 5

if ($vetId) {
    Write-Test "GET /veterinarians/$vetId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/veterinarians/$vetId"
    $response | ConvertTo-Json -Depth 5

    Write-Test "PUT /veterinarians/$vetId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/veterinarians/$vetId" -Body @{
        phone = "0559876543"
    }
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Medical Products (Reference Table)
# =============================================================================
Write-Header "Medical Products API"

Write-Test "POST /medical-products - Create"
$productResponse = Invoke-Api -Method POST -Endpoint "/medical-products" -Body @{
    name = "Ivermectine 1%"
    activeSubstance = "Ivermectine"
    manufacturer = "MSD Animal Health"
    withdrawalPeriodMeat = 28
    withdrawalPeriodMilk = 0
    dosageUnit = "ml"
}
$productResponse | ConvertTo-Json -Depth 5
$productId = if ($productResponse.data) { $productResponse.data.id } else { $productResponse.id }

Write-Test "GET /medical-products - List all"
$response = Invoke-Api -Method GET -Endpoint "/medical-products"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Vaccines (Reference Table)
# =============================================================================
Write-Header "Vaccines API"

Write-Test "POST /vaccines - Create"
$vaccineResponse = Invoke-Api -Method POST -Endpoint "/vaccines" -Body @{
    name = "Enterotoxemie"
    disease = "Enterotoxemie"
    manufacturer = "INMV Algerie"
    dosagePerAnimal = 2
    dosageUnit = "ml"
    boosterRequired = $true
    boosterIntervalDays = 21
}
$vaccineResponse | ConvertTo-Json -Depth 5
$vaccineId = if ($vaccineResponse.data) { $vaccineResponse.data.id } else { $vaccineResponse.id }

Write-Test "GET /vaccines - List all"
$response = Invoke-Api -Method GET -Endpoint "/vaccines"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Administration Routes (Reference Table)
# =============================================================================
Write-Header "Administration Routes API"

Write-Test "POST /administration-routes - Create IM"
$response = Invoke-Api -Method POST -Endpoint "/administration-routes" -Body @{
    id = "IM"
    nameFr = "Intramusculaire"
    nameEn = "Intramuscular"
    nameAr = "عضلي"
    displayOrder = 1
}
$response | ConvertTo-Json -Depth 5

Write-Test "POST /administration-routes - Create SC"
$response = Invoke-Api -Method POST -Endpoint "/administration-routes" -Body @{
    id = "SC"
    nameFr = "Sous-cutanee"
    nameEn = "Subcutaneous"
    nameAr = "تحت الجلد"
    displayOrder = 2
}
$response | ConvertTo-Json -Depth 5

Write-Test "GET /administration-routes - List all"
$response = Invoke-Api -Method GET -Endpoint "/administration-routes"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Animals API
# =============================================================================
Write-Header "Animals API"

Write-Test "POST /animals - Create"
$animalResponse = Invoke-Api -Method POST -Endpoint "/animals" -Body @{
    identifier = "OV-2024-001"
    name = "Bella"
    speciesId = "sheep"
    breedId = "ouled-djellal"
    sex = "female"
    birthDate = "2023-01-15"
    status = "active"
    farmId = $FarmId
}
$animalResponse | ConvertTo-Json -Depth 5
$animalId = if ($animalResponse.data) { $animalResponse.data.id } else { $animalResponse.id }

Write-Test "GET /animals - List all"
$response = Invoke-Api -Method GET -Endpoint "/animals?farmId=$FarmId"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Lots API
# =============================================================================
Write-Header "Lots API"

Write-Test "POST /lots - Create"
$lotResponse = Invoke-Api -Method POST -Endpoint "/lots" -Body @{
    name = "Lot Engraissement 2024"
    lotType = "fattening"
    farmId = $FarmId
}
$lotResponse | ConvertTo-Json -Depth 5
$lotId = if ($lotResponse.data) { $lotResponse.data.id } else { $lotResponse.id }

if ($lotId -and $animalId) {
    Write-Test "POST /lots/$lotId/animals - Add animal"
    $response = Invoke-Api -Method POST -Endpoint "/lots/$lotId/animals" -Body @{
        animalIds = @($animalId)
    }
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Weights API
# =============================================================================
Write-Header "Weights API"

if ($animalId) {
    Write-Test "POST /weights - Create weight record"
    $response = Invoke-Api -Method POST -Endpoint "/weights" -Body @{
        animalId = $animalId
        weight = 45.5
        measurementDate = "2024-01-15"
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5

    Write-Test "POST /weights - Create second weight"
    $response = Invoke-Api -Method POST -Endpoint "/weights" -Body @{
        animalId = $animalId
        weight = 52.3
        measurementDate = "2024-02-15"
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5

    Write-Test "GET /weights - List with daily gain"
    $response = Invoke-Api -Method GET -Endpoint "/weights?farmId=$FarmId&animalId=$animalId"
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Treatments API
# =============================================================================
Write-Header "Treatments API"

if ($animalId) {
    Write-Test "POST /treatments - Create"
    $response = Invoke-Api -Method POST -Endpoint "/treatments" -Body @{
        animalId = $animalId
        treatmentDate = "2024-01-20"
        reason = "Parasitisme interne"
        diagnosis = "Strongylose digestive"
        dosage = 5
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Vaccinations API
# =============================================================================
Write-Header "Vaccinations API"

if ($animalId) {
    Write-Test "POST /vaccinations - Create"
    $response = Invoke-Api -Method POST -Endpoint "/vaccinations" -Body @{
        animalId = $animalId
        vaccinationDate = "2024-01-25"
        nextDueDate = "2024-07-25"
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Movements API
# =============================================================================
Write-Header "Movements API"

if ($animalId) {
    Write-Test "POST /movements - Create entry"
    $response = Invoke-Api -Method POST -Endpoint "/movements" -Body @{
        animalId = $animalId
        movementType = "entry"
        movementDate = "2024-01-01"
        origin = "Marche Djelfa"
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5

    Write-Test "GET /movements/statistics - Stats"
    $response = Invoke-Api -Method GET -Endpoint "/movements/statistics?farmId=$FarmId"
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Breedings API
# =============================================================================
Write-Header "Breedings API"

if ($animalId) {
    Write-Test "POST /breedings - Create"
    $response = Invoke-Api -Method POST -Endpoint "/breedings" -Body @{
        femaleId = $animalId
        breedingDate = "2024-02-01"
        method = "natural"
        farmId = $FarmId
    }
    $response | ConvertTo-Json -Depth 5

    Write-Test "GET /breedings/upcoming - Upcoming due dates"
    $response = Invoke-Api -Method GET -Endpoint "/breedings/upcoming?farmId=$FarmId"
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Campaigns API
# =============================================================================
Write-Header "Campaigns API"

Write-Test "POST /campaigns - Create vaccination campaign"
$campaignResponse = Invoke-Api -Method POST -Endpoint "/campaigns" -Body @{
    name = "Campagne Enterotoxemie 2024"
    campaignType = "vaccination"
    startDate = "2024-03-01"
    endDate = "2024-03-15"
    targetCount = 100
    farmId = $FarmId
}
$campaignResponse | ConvertTo-Json -Depth 5
$campaignId = if ($campaignResponse.data) { $campaignResponse.data.id } else { $campaignResponse.id }

if ($campaignId) {
    Write-Test "GET /campaigns/$campaignId/progress - Progress"
    $response = Invoke-Api -Method GET -Endpoint "/campaigns/$campaignId/progress"
    $response | ConvertTo-Json -Depth 5
}

# =============================================================================
# Documents API
# =============================================================================
Write-Header "Documents API"

Write-Test "POST /documents - Create health certificate"
$response = Invoke-Api -Method POST -Endpoint "/documents" -Body @{
    documentType = "health_certificate"
    documentNumber = "CERT-2024-001"
    issueDate = "2024-01-15"
    expiryDate = "2024-07-15"
    issuingAuthority = "DSA Djelfa"
    farmId = $FarmId
}
$response | ConvertTo-Json -Depth 5

Write-Test "GET /documents/expiring - Expiring soon"
$response = Invoke-Api -Method GET -Endpoint "/documents/expiring?farmId=$FarmId&days=180"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Rate Limiting Test
# =============================================================================
Write-Header "Rate Limiting Test"

Write-Test "Testing rate limit (5 rapid requests)..."
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-Api -Method GET -Endpoint "/veterinarians"
        if ($response.success -eq $false) {
            Write-Error "Request $i : Rate limited"
        } else {
            Write-Success "Request $i : OK"
        }
    } catch {
        Write-Error "Request $i : Error"
    }
}

# =============================================================================
# Sync API
# =============================================================================
Write-Header "Sync API"

Write-Test "GET /sync/changes - Get changes since timestamp"
$response = Invoke-Api -Method GET -Endpoint "/sync/changes?farmId=$FarmId&since=2024-01-01T00:00:00Z"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Summary
# =============================================================================
Write-Header "Test Complete"

Write-Host ""
Write-Host "Created resources:"
if ($vetId) { Write-Host "  - Veterinarian: $vetId" }
if ($productId) { Write-Host "  - Medical Product: $productId" }
if ($vaccineId) { Write-Host "  - Vaccine: $vaccineId" }
if ($animalId) { Write-Host "  - Animal: $animalId" }
if ($lotId) { Write-Host "  - Lot: $lotId" }
if ($campaignId) { Write-Host "  - Campaign: $campaignId" }
Write-Host ""
Write-Host "To delete test data, use DELETE endpoints with the IDs above."
Write-Host ""
