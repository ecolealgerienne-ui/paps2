# =============================================================================
# Script de test simple - Une donnee par API
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED TEST SIMPLE - AniTra Backend API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Helper pour appeler l'API
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description
    )

    $uri = "$BaseUrl$Endpoint"

    if ($Description) {
        Write-Host "  [TEST] $Description..." -ForegroundColor Yellow -NoNewline
    }

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host ""
            Write-Host "    Request: $Endpoint" -ForegroundColor Cyan
            Write-Host "    Body: $jsonBody" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        }

        Write-Host "    Response: OK" -ForegroundColor Green
        Start-Sleep -Milliseconds 400
        return $response
    } catch {
        Write-Host ""
        Write-Host "    ERROR: $($_.Exception.Message)" -ForegroundColor Red

        # Afficher le détail de l'erreur du serveur
        if ($_.ErrorDetails.Message) {
            try {
                $errorObj = $_.ErrorDetails.Message | ConvertFrom-Json
                if ($errorObj.message -is [array]) {
                    Write-Host "    Details: $($errorObj.message -join ', ')" -ForegroundColor Yellow
                } else {
                    Write-Host "    Details: $($errorObj | ConvertTo-Json -Compress)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "    Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
            }
        }
        Write-Host ""
        return $null
    }
}

# =============================================================================
# TEST 1: Country
# =============================================================================
Write-Host ""
Write-Host "TEST 1: Country" -ForegroundColor Cyan
$country = @{ code = "FR"; nameFr = "France"; nameEn = "France"; nameAr = "France" }
Invoke-Api -Method POST -Endpoint "/countries" -Body $country -Description "Country"

# =============================================================================
# TEST 2: Administration Route
# =============================================================================
Write-Host ""
Write-Host "TEST 2: Administration Route" -ForegroundColor Cyan
$route = @{ code = "IM"; nameFr = "Intramusculaire"; nameEn = "Intramuscular"; nameAr = "Intramuscular" }
Invoke-Api -Method POST -Endpoint "/administration-routes" -Body $route -Description "Route"

# =============================================================================
# TEST 3: Global Medical Product
# =============================================================================
Write-Host ""
Write-Host "TEST 3: Global Medical Product" -ForegroundColor Cyan
$product = @{
    code = "TEST-PROD-001"
    nameFr = "Test Product"
    nameEn = "Test Product"
    nameAr = "Test Product"
    type = "antibiotic"
}
Invoke-Api -Method POST -Endpoint "/global-medical-products" -Body $product -Description "Product"

# =============================================================================
# TEST 4: Global Vaccine
# =============================================================================
Write-Host ""
Write-Host "TEST 4: Global Vaccine" -ForegroundColor Cyan
$vaccine = @{
    code = "TEST-VACC-001"
    nameFr = "Test Vaccine"
    nameEn = "Test Vaccine"
    nameAr = "Test Vaccine"
    targetDisease = "bvd"
}
Invoke-Api -Method POST -Endpoint "/vaccines-global" -Body $vaccine -Description "Vaccine"

# =============================================================================
# TEST 5: National Campaign
# =============================================================================
Write-Host ""
Write-Host "TEST 5: National Campaign" -ForegroundColor Cyan
$campaign = @{
    code = "test-campaign-2025"
    nameFr = "Test Campaign 2025"
    nameEn = "Test Campaign 2025"
    nameAr = "Test Campaign 2025"
    startDate = "2025-01-01T00:00:00.000Z"
    endDate = "2025-12-31T23:59:59.999Z"
}
Invoke-Api -Method POST -Endpoint "/api/national-campaigns" -Body $campaign -Description "Campaign"

# =============================================================================
# TEST 6: Alert Template
# =============================================================================
Write-Host ""
Write-Host "TEST 6: Alert Template" -ForegroundColor Cyan
$template = @{
    code = "test-alert"
    nameFr = "Test Alert"
    nameEn = "Test Alert"
    nameAr = "Test Alert"
    category = "health"
}
Invoke-Api -Method POST -Endpoint "/alert-templates" -Body $template -Description "Alert Template"

# =============================================================================
# TEST 7: Farm
# =============================================================================
Write-Host ""
Write-Host "TEST 7: Farm" -ForegroundColor Cyan
$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farm = @{
    id = $farmId
    name = "Test Farm"
    ownerName = "Test Owner"
}
$farmResponse = Invoke-Api -Method POST -Endpoint "/api/farms" -Body $farm -Description "Farm"

# =============================================================================
# TEST 8: Veterinarian
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "TEST 8: Veterinarian" -ForegroundColor Cyan
    $vet = @{
        name = "Dr. Test"
        phone = "0600000000"
    }
    Invoke-Api -Method POST -Endpoint "/farms/$farmId/veterinarians" -Body $vet -Description "Veterinarian"
}

# =============================================================================
# TEST 9: Lot
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "TEST 9: Lot" -ForegroundColor Cyan
    $lot = @{
        name = "Test Lot"
        lotType = "production"
        createdDate = "2025-01-01T00:00:00.000Z"
    }
    Invoke-Api -Method POST -Endpoint "/farms/$farmId/lots" -Body $lot -Description "Lot"
}

# =============================================================================
# TEST 10: Animal
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "TEST 10: Animal" -ForegroundColor Cyan
    $animal = @{
        name = "Test Animal"
        earTag = "FR-TEST-001"
        birthDate = "2024-01-01T00:00:00.000Z"
        sex = "female"
        species = "bovin"
        breed = "prim-holstein"
        status = "alive"
    }
    Invoke-Api -Method POST -Endpoint "/farms/$farmId/animals" -Body $animal -Description "Animal"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  TEST TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
