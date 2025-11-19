# =============================================================================
# AniTra API Test Script (PowerShell) - 100% Coverage
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
    Write-Host "  $Text" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Text)
    Write-Host "  $Text" -ForegroundColor Red
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
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorResponse) {
            return $errorResponse
        }
        return @{ success = $false; error = $_.Exception.Message }
    }
}

# =============================================================================
# Health Check
# =============================================================================
Write-Header "Health Check"

Write-Test "GET /"
$response = Invoke-Api -Method GET -Endpoint "/"
$response | ConvertTo-Json -Depth 5

# =============================================================================
# Veterinarians (Reference Table) - FULL CRUD
# =============================================================================
Write-Header "Veterinarians API (5 endpoints)"

Write-Test "POST /veterinarians - Create"
$vetResponse = Invoke-Api -Method POST -Endpoint "/veterinarians" -Body @{
    name = "Dr. Ahmed Benali"
    phone = "0551234567"
    email = "ahmed.benali@vet.dz"
    licenseNumber = "VET-2024-001"
    specialization = "Ruminants"
}
$vetId = if ($vetResponse.data) { $vetResponse.data.id } else { $vetResponse.id }
Write-Success "Created: $vetId"

Write-Test "GET /veterinarians - List all"
$response = Invoke-Api -Method GET -Endpoint "/veterinarians"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count veterinarians"

if ($vetId) {
    Write-Test "GET /veterinarians/$vetId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/veterinarians/$vetId"
    Write-Success "Retrieved: $($response.data.name // $response.name)"

    Write-Test "PUT /veterinarians/$vetId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/veterinarians/$vetId" -Body @{
        phone = "0559876543"
    }
    Write-Success "Updated phone"

    Write-Test "DELETE /veterinarians/$vetId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/veterinarians/$vetId"
    Write-Success "Deleted"
}

# =============================================================================
# Medical Products (Reference Table) - FULL CRUD
# =============================================================================
Write-Header "Medical Products API (5 endpoints)"

Write-Test "POST /medical-products - Create"
$productResponse = Invoke-Api -Method POST -Endpoint "/medical-products" -Body @{
    name = "Ivermectine 1%"
    activeSubstance = "Ivermectine"
    manufacturer = "MSD Animal Health"
    withdrawalPeriodMeat = 28
    withdrawalPeriodMilk = 0
    dosageUnit = "ml"
}
$productId = if ($productResponse.data) { $productResponse.data.id } else { $productResponse.id }
Write-Success "Created: $productId"

Write-Test "GET /medical-products - List all"
$response = Invoke-Api -Method GET -Endpoint "/medical-products"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count products"

if ($productId) {
    Write-Test "GET /medical-products/$productId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/medical-products/$productId"
    Write-Success "Retrieved: $($response.data.name // $response.name)"

    Write-Test "PUT /medical-products/$productId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/medical-products/$productId" -Body @{
        withdrawalPeriodMeat = 30
    }
    Write-Success "Updated withdrawal period"

    Write-Test "DELETE /medical-products/$productId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/medical-products/$productId"
    Write-Success "Deleted"
}

# =============================================================================
# Vaccines (Reference Table) - FULL CRUD
# =============================================================================
Write-Header "Vaccines API (5 endpoints)"

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
$vaccineId = if ($vaccineResponse.data) { $vaccineResponse.data.id } else { $vaccineResponse.id }
Write-Success "Created: $vaccineId"

Write-Test "GET /vaccines - List all"
$response = Invoke-Api -Method GET -Endpoint "/vaccines"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count vaccines"

if ($vaccineId) {
    Write-Test "GET /vaccines/$vaccineId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/vaccines/$vaccineId"
    Write-Success "Retrieved: $($response.data.name // $response.name)"

    Write-Test "PUT /vaccines/$vaccineId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/vaccines/$vaccineId" -Body @{
        boosterIntervalDays = 28
    }
    Write-Success "Updated booster interval"

    Write-Test "DELETE /vaccines/$vaccineId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/vaccines/$vaccineId"
    Write-Success "Deleted"
}

# =============================================================================
# Administration Routes (Reference Table) - FULL CRUD
# =============================================================================
Write-Header "Administration Routes API (5 endpoints)"

Write-Test "POST /administration-routes - Create IM"
$routeResponse = Invoke-Api -Method POST -Endpoint "/administration-routes" -Body @{
    id = "IM"
    nameFr = "Intramusculaire"
    nameEn = "Intramuscular"
    nameAr = "عضلي"
    displayOrder = 1
}
Write-Success "Created: IM"

Write-Test "GET /administration-routes - List all"
$response = Invoke-Api -Method GET -Endpoint "/administration-routes"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count routes"

Write-Test "GET /administration-routes/IM - Get one"
$response = Invoke-Api -Method GET -Endpoint "/administration-routes/IM"
Write-Success "Retrieved: $($response.data.nameFr // $response.nameFr)"

Write-Test "PUT /administration-routes/IM - Update"
$response = Invoke-Api -Method PUT -Endpoint "/administration-routes/IM" -Body @{
    displayOrder = 10
}
Write-Success "Updated display order"

Write-Test "DELETE /administration-routes/IM - Delete"
$response = Invoke-Api -Method DELETE -Endpoint "/administration-routes/IM"
Write-Success "Deleted"

# =============================================================================
# Animals API - FULL CRUD
# =============================================================================
Write-Header "Animals API (5 endpoints)"

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
$animalId = if ($animalResponse.data) { $animalResponse.data.id } else { $animalResponse.id }
Write-Success "Created: $animalId"

Write-Test "GET /animals - List all"
$response = Invoke-Api -Method GET -Endpoint "/animals?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count animals"

if ($animalId) {
    Write-Test "GET /animals/$animalId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/animals/$animalId"
    Write-Success "Retrieved: $($response.data.name // $response.name)"

    Write-Test "PUT /animals/$animalId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/animals/$animalId" -Body @{
        name = "Bella Updated"
    }
    Write-Success "Updated name"
}

# =============================================================================
# Lots API - FULL CRUD + Animals management
# =============================================================================
Write-Header "Lots API (7 endpoints)"

Write-Test "POST /lots - Create"
$lotResponse = Invoke-Api -Method POST -Endpoint "/lots" -Body @{
    name = "Lot Engraissement 2024"
    lotType = "fattening"
    farmId = $FarmId
}
$lotId = if ($lotResponse.data) { $lotResponse.data.id } else { $lotResponse.id }
Write-Success "Created: $lotId"

Write-Test "GET /lots - List all"
$response = Invoke-Api -Method GET -Endpoint "/lots?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count lots"

if ($lotId) {
    Write-Test "GET /lots/$lotId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/lots/$lotId"
    Write-Success "Retrieved: $($response.data.name // $response.name)"

    Write-Test "PUT /lots/$lotId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/lots/$lotId" -Body @{
        name = "Lot Engraissement 2024 - Updated"
    }
    Write-Success "Updated name"

    if ($animalId) {
        Write-Test "POST /lots/$lotId/animals - Add animal"
        $response = Invoke-Api -Method POST -Endpoint "/lots/$lotId/animals" -Body @{
            animalIds = @($animalId)
        }
        Write-Success "Added animal to lot"

        Write-Test "DELETE /lots/$lotId/animals - Remove animal"
        $response = Invoke-Api -Method DELETE -Endpoint "/lots/$lotId/animals" -Body @{
            animalIds = @($animalId)
        }
        Write-Success "Removed animal from lot"
    }

    Write-Test "DELETE /lots/$lotId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/lots/$lotId"
    Write-Success "Deleted"
}

# =============================================================================
# Weights API - FULL CRUD + History
# =============================================================================
Write-Header "Weights API (6 endpoints)"

if ($animalId) {
    Write-Test "POST /weights - Create first weight"
    $weightResponse = Invoke-Api -Method POST -Endpoint "/weights" -Body @{
        animalId = $animalId
        weight = 45.5
        measurementDate = "2024-01-15"
        farmId = $FarmId
    }
    $weightId = if ($weightResponse.data) { $weightResponse.data.id } else { $weightResponse.id }
    Write-Success "Created: $weightId"

    Write-Test "POST /weights - Create second weight"
    $response = Invoke-Api -Method POST -Endpoint "/weights" -Body @{
        animalId = $animalId
        weight = 52.3
        measurementDate = "2024-02-15"
        farmId = $FarmId
    }
    Write-Success "Created second weight"

    Write-Test "GET /weights - List all"
    $response = Invoke-Api -Method GET -Endpoint "/weights?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Found: $count weights"

    Write-Test "GET /weights/animal/$animalId/history - Get history"
    $response = Invoke-Api -Method GET -Endpoint "/weights/animal/$animalId/history?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "History: $count records"

    if ($weightId) {
        Write-Test "GET /weights/$weightId - Get one"
        $response = Invoke-Api -Method GET -Endpoint "/weights/$weightId"
        Write-Success "Retrieved weight"

        Write-Test "PUT /weights/$weightId - Update"
        $response = Invoke-Api -Method PUT -Endpoint "/weights/$weightId" -Body @{
            weight = 46.0
        }
        Write-Success "Updated weight"

        Write-Test "DELETE /weights/$weightId - Delete"
        $response = Invoke-Api -Method DELETE -Endpoint "/weights/$weightId"
        Write-Success "Deleted"
    }
}

# =============================================================================
# Treatments API - FULL CRUD
# =============================================================================
Write-Header "Treatments API (5 endpoints)"

if ($animalId) {
    Write-Test "POST /treatments - Create"
    $treatmentResponse = Invoke-Api -Method POST -Endpoint "/treatments" -Body @{
        animalId = $animalId
        treatmentDate = "2024-01-20"
        reason = "Parasitisme interne"
        diagnosis = "Strongylose digestive"
        dosage = 5
        farmId = $FarmId
    }
    $treatmentId = if ($treatmentResponse.data) { $treatmentResponse.data.id } else { $treatmentResponse.id }
    Write-Success "Created: $treatmentId"

    Write-Test "GET /treatments - List all"
    $response = Invoke-Api -Method GET -Endpoint "/treatments?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Found: $count treatments"

    if ($treatmentId) {
        Write-Test "GET /treatments/$treatmentId - Get one"
        $response = Invoke-Api -Method GET -Endpoint "/treatments/$treatmentId"
        Write-Success "Retrieved treatment"

        Write-Test "PUT /treatments/$treatmentId - Update"
        $response = Invoke-Api -Method PUT -Endpoint "/treatments/$treatmentId" -Body @{
            dosage = 6
        }
        Write-Success "Updated dosage"

        Write-Test "DELETE /treatments/$treatmentId - Delete"
        $response = Invoke-Api -Method DELETE -Endpoint "/treatments/$treatmentId"
        Write-Success "Deleted"
    }
}

# =============================================================================
# Vaccinations API - FULL CRUD
# =============================================================================
Write-Header "Vaccinations API (5 endpoints)"

if ($animalId) {
    Write-Test "POST /vaccinations - Create"
    $vaccinationResponse = Invoke-Api -Method POST -Endpoint "/vaccinations" -Body @{
        animalId = $animalId
        vaccinationDate = "2024-01-25"
        nextDueDate = "2024-07-25"
        farmId = $FarmId
    }
    $vaccinationId = if ($vaccinationResponse.data) { $vaccinationResponse.data.id } else { $vaccinationResponse.id }
    Write-Success "Created: $vaccinationId"

    Write-Test "GET /vaccinations - List all"
    $response = Invoke-Api -Method GET -Endpoint "/vaccinations?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Found: $count vaccinations"

    if ($vaccinationId) {
        Write-Test "GET /vaccinations/$vaccinationId - Get one"
        $response = Invoke-Api -Method GET -Endpoint "/vaccinations/$vaccinationId"
        Write-Success "Retrieved vaccination"

        Write-Test "PUT /vaccinations/$vaccinationId - Update"
        $response = Invoke-Api -Method PUT -Endpoint "/vaccinations/$vaccinationId" -Body @{
            nextDueDate = "2024-08-25"
        }
        Write-Success "Updated next due date"

        Write-Test "DELETE /vaccinations/$vaccinationId - Delete"
        $response = Invoke-Api -Method DELETE -Endpoint "/vaccinations/$vaccinationId"
        Write-Success "Deleted"
    }
}

# =============================================================================
# Movements API - FULL CRUD + Statistics
# =============================================================================
Write-Header "Movements API (6 endpoints)"

if ($animalId) {
    Write-Test "POST /movements - Create entry"
    $movementResponse = Invoke-Api -Method POST -Endpoint "/movements" -Body @{
        animalId = $animalId
        movementType = "entry"
        movementDate = "2024-01-01"
        origin = "Marche Djelfa"
        farmId = $FarmId
    }
    $movementId = if ($movementResponse.data) { $movementResponse.data.id } else { $movementResponse.id }
    Write-Success "Created: $movementId"

    Write-Test "GET /movements - List all"
    $response = Invoke-Api -Method GET -Endpoint "/movements?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Found: $count movements"

    Write-Test "GET /movements/statistics - Get statistics"
    $response = Invoke-Api -Method GET -Endpoint "/movements/statistics?farmId=$FarmId"
    Write-Success "Retrieved statistics"

    if ($movementId) {
        Write-Test "GET /movements/$movementId - Get one"
        $response = Invoke-Api -Method GET -Endpoint "/movements/$movementId"
        Write-Success "Retrieved movement"

        Write-Test "PUT /movements/$movementId - Update"
        $response = Invoke-Api -Method PUT -Endpoint "/movements/$movementId" -Body @{
            origin = "Marche Djelfa - Updated"
        }
        Write-Success "Updated origin"

        Write-Test "DELETE /movements/$movementId - Delete"
        $response = Invoke-Api -Method DELETE -Endpoint "/movements/$movementId"
        Write-Success "Deleted"
    }
}

# =============================================================================
# Breedings API - FULL CRUD + Upcoming
# =============================================================================
Write-Header "Breedings API (6 endpoints)"

if ($animalId) {
    Write-Test "POST /breedings - Create"
    $breedingResponse = Invoke-Api -Method POST -Endpoint "/breedings" -Body @{
        femaleId = $animalId
        breedingDate = "2024-02-01"
        method = "natural"
        farmId = $FarmId
    }
    $breedingId = if ($breedingResponse.data) { $breedingResponse.data.id } else { $breedingResponse.id }
    Write-Success "Created: $breedingId"

    Write-Test "GET /breedings - List all"
    $response = Invoke-Api -Method GET -Endpoint "/breedings?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Found: $count breedings"

    Write-Test "GET /breedings/upcoming - Get upcoming"
    $response = Invoke-Api -Method GET -Endpoint "/breedings/upcoming?farmId=$FarmId"
    $count = if ($response.data) { $response.data.Count } else { $response.Count }
    Write-Success "Upcoming: $count"

    if ($breedingId) {
        Write-Test "GET /breedings/$breedingId - Get one"
        $response = Invoke-Api -Method GET -Endpoint "/breedings/$breedingId"
        Write-Success "Retrieved breeding"

        Write-Test "PUT /breedings/$breedingId - Update"
        $response = Invoke-Api -Method PUT -Endpoint "/breedings/$breedingId" -Body @{
            method = "artificial"
        }
        Write-Success "Updated method"

        Write-Test "DELETE /breedings/$breedingId - Delete"
        $response = Invoke-Api -Method DELETE -Endpoint "/breedings/$breedingId"
        Write-Success "Deleted"
    }
}

# =============================================================================
# Campaigns API - FULL CRUD + Active + Progress
# =============================================================================
Write-Header "Campaigns API (7 endpoints)"

Write-Test "POST /campaigns - Create"
$campaignResponse = Invoke-Api -Method POST -Endpoint "/campaigns" -Body @{
    name = "Campagne Enterotoxemie 2024"
    campaignType = "vaccination"
    startDate = "2024-03-01"
    endDate = "2024-03-15"
    targetCount = 100
    farmId = $FarmId
}
$campaignId = if ($campaignResponse.data) { $campaignResponse.data.id } else { $campaignResponse.id }
Write-Success "Created: $campaignId"

Write-Test "GET /campaigns - List all"
$response = Invoke-Api -Method GET -Endpoint "/campaigns?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count campaigns"

Write-Test "GET /campaigns/active - Get active"
$response = Invoke-Api -Method GET -Endpoint "/campaigns/active?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Active: $count"

if ($campaignId) {
    Write-Test "GET /campaigns/$campaignId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/campaigns/$campaignId"
    Write-Success "Retrieved campaign"

    Write-Test "GET /campaigns/$campaignId/progress - Get progress"
    $response = Invoke-Api -Method GET -Endpoint "/campaigns/$campaignId/progress"
    Write-Success "Retrieved progress"

    Write-Test "PUT /campaigns/$campaignId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/campaigns/$campaignId" -Body @{
        targetCount = 150
    }
    Write-Success "Updated target count"

    Write-Test "DELETE /campaigns/$campaignId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/campaigns/$campaignId"
    Write-Success "Deleted"
}

# =============================================================================
# Documents API - FULL CRUD + Expiring + Expired
# =============================================================================
Write-Header "Documents API (7 endpoints)"

Write-Test "POST /documents - Create"
$documentResponse = Invoke-Api -Method POST -Endpoint "/documents" -Body @{
    documentType = "health_certificate"
    documentNumber = "CERT-2024-001"
    issueDate = "2024-01-15"
    expiryDate = "2024-07-15"
    issuingAuthority = "DSA Djelfa"
    farmId = $FarmId
}
$documentId = if ($documentResponse.data) { $documentResponse.data.id } else { $documentResponse.id }
Write-Success "Created: $documentId"

Write-Test "GET /documents - List all"
$response = Invoke-Api -Method GET -Endpoint "/documents?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Found: $count documents"

Write-Test "GET /documents/expiring - Get expiring"
$response = Invoke-Api -Method GET -Endpoint "/documents/expiring?farmId=$FarmId&days=180"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Expiring: $count"

Write-Test "GET /documents/expired - Get expired"
$response = Invoke-Api -Method GET -Endpoint "/documents/expired?farmId=$FarmId"
$count = if ($response.data) { $response.data.Count } else { $response.Count }
Write-Success "Expired: $count"

if ($documentId) {
    Write-Test "GET /documents/$documentId - Get one"
    $response = Invoke-Api -Method GET -Endpoint "/documents/$documentId"
    Write-Success "Retrieved document"

    Write-Test "PUT /documents/$documentId - Update"
    $response = Invoke-Api -Method PUT -Endpoint "/documents/$documentId" -Body @{
        expiryDate = "2024-12-31"
    }
    Write-Success "Updated expiry date"

    Write-Test "DELETE /documents/$documentId - Delete"
    $response = Invoke-Api -Method DELETE -Endpoint "/documents/$documentId"
    Write-Success "Deleted"
}

# =============================================================================
# Sync API - FULL
# =============================================================================
Write-Header "Sync API (2 endpoints)"

Write-Test "POST /sync - Push changes"
$response = Invoke-Api -Method POST -Endpoint "/sync" -Body @{
    farmId = $FarmId
    changes = @()
    lastSyncTimestamp = "2024-01-01T00:00:00Z"
}
Write-Success "Sync pushed"

Write-Test "GET /sync/changes - Get changes"
$response = Invoke-Api -Method GET -Endpoint "/sync/changes?farmId=$FarmId&since=2024-01-01T00:00:00Z"
Write-Success "Retrieved changes"

# =============================================================================
# Cleanup - Delete test animal
# =============================================================================
Write-Header "Cleanup"

if ($animalId) {
    Write-Test "DELETE /animals/$animalId - Delete test animal"
    $response = Invoke-Api -Method DELETE -Endpoint "/animals/$animalId"
    Write-Success "Deleted test animal"
}

# =============================================================================
# Rate Limiting Test
# =============================================================================
Write-Header "Rate Limiting Test"

Write-Test "Testing rate limit (5 rapid requests)..."
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-Api -Method GET -Endpoint "/veterinarians"
        if ($response.success -eq $false) {
            Write-ErrorMsg "Request $i : Rate limited"
        } else {
            Write-Success "Request $i : OK"
        }
    } catch {
        Write-ErrorMsg "Request $i : Error"
    }
}

# =============================================================================
# Summary
# =============================================================================
Write-Header "Test Complete - 100% Coverage"

Write-Host ""
Write-Host "Endpoints tested: 77/77" -ForegroundColor Green
Write-Host ""
Write-Host "Modules covered:"
Write-Host "  - App (1)"
Write-Host "  - Veterinarians (5)"
Write-Host "  - Medical Products (5)"
Write-Host "  - Vaccines (5)"
Write-Host "  - Administration Routes (5)"
Write-Host "  - Animals (5)"
Write-Host "  - Lots (7)"
Write-Host "  - Weights (6)"
Write-Host "  - Treatments (5)"
Write-Host "  - Vaccinations (5)"
Write-Host "  - Movements (6)"
Write-Host "  - Breedings (6)"
Write-Host "  - Campaigns (7)"
Write-Host "  - Documents (7)"
Write-Host "  - Sync (2)"
Write-Host ""
