# =============================================================================
# Script de Seed - Donnees de test pour la France
# Inclut: donnees de reference + donnees transactionnelles (100 animaux)
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED DATABASE FR - AniTra Backend API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Helper pour appeler l'API avec Invoke-RestMethod
function Invoke-CurlApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description
    )

    $uri = "$BaseUrl$Endpoint"

    if ($Description) {
        Write-Host "  [SEED] $Description..." -ForegroundColor Yellow -NoNewline
    }

    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $Token"
    }

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers `
                -DisableKeepAlive -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
        }

        Write-Host " OK" -ForegroundColor Green
        Start-Sleep -Milliseconds 400
        return $response
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red

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
        return $null
    }
}

# =============================================================================
# 1. COUNTRIES
# =============================================================================
Write-Host ""
Write-Host "1. Countries (Pays)" -ForegroundColor Cyan

$countries = @(
    @{ code = "FR"; nameFr = "France"; nameEn = "France"; nameAr = "France" }
)

foreach ($country in $countries) {
    Invoke-CurlApi -Method POST -Endpoint "/countries" -Body $country `
        -Description "Pays: $($country.nameFr)"
}

# =============================================================================
# 2. ADMINISTRATION ROUTES
# =============================================================================
Write-Host ""
Write-Host "2. Administration Routes (Voies d'administration)" -ForegroundColor Cyan

$routes = @(
    @{ code = "IM"; nameFr = "Intramusculaire"; nameEn = "Intramuscular"; nameAr = "Intramuscular" }
)

foreach ($route in $routes) {
    Invoke-CurlApi -Method POST -Endpoint "/administration-routes" -Body $route `
        -Description "Route: $($route.nameFr)"
}

# =============================================================================
# 3. GLOBAL MEDICAL PRODUCTS (Produits francais)
# =============================================================================
Write-Host ""
Write-Host "3. Global Medical Products (Produits medicaux)" -ForegroundColor Cyan

$products = @(
    @{
        code = "IVERM-FR-001"
        nameFr = "Ivomec 1%"
        nameEn = "Ivomec 1%"; nameAr = "Ivomec 1%"
        type = "antiparasitic"
        laboratoire = "Boehringer Ingelheim"
        principeActif = "Ivermectine"
    }
)

foreach ($product in $products) {
    Invoke-CurlApi -Method POST -Endpoint "/global-medical-products" -Body $product `
        -Description "Produit: $($product.nameFr)"
}

# =============================================================================
# 4. GLOBAL VACCINES (Vaccins francais)
# =============================================================================
Write-Host ""
Write-Host "4. Global Vaccines (Vaccins)" -ForegroundColor Cyan

$vaccines = @(
    @{
        code = "ENTEROTOX-001"
        nameFr = "Vaccin Enterotoxemie"
        nameEn = "Enterotoxemia Vaccine"; nameAr = "Enterotoxemia Vaccine"
        targetDisease = "enterotoxemia"
        laboratoire = "MSD Sante Animale"
    }
)

foreach ($vaccine in $vaccines) {
    Invoke-CurlApi -Method POST -Endpoint "/vaccines-global" -Body $vaccine `
        -Description "Vaccin: $($vaccine.nameFr)"
}

# =============================================================================
# 5. NATIONAL CAMPAIGNS (Campagnes France)
# =============================================================================
Write-Host ""
Write-Host "5. National Campaigns (Campagnes nationales)" -ForegroundColor Cyan

$campaigns = @(
    @{
        code = "vacc-fr-2025"
        nameFr = "Campagne Vaccination France 2025"
        nameEn = "Vaccination Campaign France 2025"; nameAr = "Vaccination Campaign France 2025"
        type = "vaccination"
        description = "Campagne de vaccination nationale"
        startDate = "2025-01-01T00:00:00.000Z"
        endDate = "2025-12-31T23:59:59.999Z"
        isActive = $true
    }
)

foreach ($campaign in $campaigns) {
    Invoke-CurlApi -Method POST -Endpoint "/api/national-campaigns" -Body $campaign `
        -Description "Campagne: $($campaign.nameFr)"
}

# =============================================================================
# 6. ALERT TEMPLATES
# =============================================================================
Write-Host ""
Write-Host "6. Alert Templates (Modeles d'alertes)" -ForegroundColor Cyan

$templates = @(
    @{
        code = "vacc-reminder"
        nameFr = "Rappel de vaccination"
        nameEn = "Vaccination reminder"; nameAr = "Vaccination reminder"
        descriptionFr = "Rappel automatique pour les vaccinations a venir"
        descriptionEn = "Automatic reminder for upcoming vaccinations"
        category = "vaccination"
        isActive = $true
    }
)

foreach ($template in $templates) {
    Invoke-CurlApi -Method POST -Endpoint "/alert-templates" -Body $template `
        -Description "Alerte: $($template.nameFr)"
}

# =============================================================================
# 7. SPECIES (Especes)
# =============================================================================
Write-Host ""
Write-Host "7. Species (Especes)" -ForegroundColor Cyan

$species = @(
    @{
        id = "bovine"
        nameFr = "Bovin"
        nameEn = "Bovine"
        nameAr = "Bovine"
        icon = "cow"
    }
)

foreach ($specie in $species) {
    Invoke-CurlApi -Method POST -Endpoint "/api/v1/species" -Body $specie `
        -Description "Espece: $($specie.nameFr)"
}

# =============================================================================
# 8. BREEDS (Races)
# =============================================================================
Write-Host ""
Write-Host "8. Breeds (Races)" -ForegroundColor Cyan

$breedId = [guid]::NewGuid().ToString()
$breed = @{
    id = $breedId
    code = "prim-holstein"
    speciesId = "bovine"
    nameFr = "Prim'Holstein"
    nameEn = "Holstein"
    nameAr = "Holstein"
}

$breedResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/breeds" -Body $breed `
    -Description "Race: $($breed.nameFr)"

# Utiliser l'ID retourné par l'API si disponible
if ($breedResponse) {
    if ($breedResponse.id) {
        $breedId = $breedResponse.id
        Write-Host "    Breed ID captured: $breedId" -ForegroundColor Cyan
    } elseif ($breedResponse.data -and $breedResponse.data.id) {
        $breedId = $breedResponse.data.id
        Write-Host "    Breed ID captured: $breedId" -ForegroundColor Cyan
    }
}

# =============================================================================
# 9. FARM (Ferme francaise)
# =============================================================================
Write-Host ""
Write-Host "9. Farm (Ferme)" -ForegroundColor Cyan

$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farm = @{
    id = $farmId
    name = "EARL du Plateau"
    ownerId = "owner-test-001"
    location = "Clermont-Ferrand, France"
    address = "15 Route de la Montagne, 63000 Clermont-Ferrand"
    commune = "63113"
    city = "Clermont-Ferrand"
    postalCode = "63000"
    country = "FR"
    department = "63"
}

$farmResponse = Invoke-CurlApi -Method POST -Endpoint "/api/farms" -Body $farm `
    -Description "Ferme: $($farm.name)"

# =============================================================================
# 10. VETERINARIANS
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "10. Veterinarians (Veterinaires)" -ForegroundColor Cyan

    $vets = @(
        @{
            firstName = "Marie"
            lastName = "Martin"
            title = "Dr."
            phone = "0612345678"
            email = "m.martin@veterinaire-france.fr"
            licenseNumber = "VET-FR-123456"
            specialties = "Bovins laitiers"
        }
    )

    $vetIds = @()
    foreach ($vet in $vets) {
        $vetResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarians" -Body $vet `
            -Description "Veterinaire: Dr. $($vet.lastName)"
        if ($vetResponse -and $vetResponse.id) {
            $vetIds += $vetResponse.id
        }
    }
}

# =============================================================================
# 11. LOTS (Batches/Groups)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "11. Lots (Batches)" -ForegroundColor Cyan

    $lots = @(
        @{
            name = "Lot Test"
            type = "sale"
            status = "open"
        }
    )

    $lotIds = @()
    foreach ($lot in $lots) {
        $lotResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/lots" -Body $lot `
            -Description "Lot: $($lot.name)"
        if ($lotResponse -and $lotResponse.id) {
            $lotIds += $lotResponse.id
        }
    }
}

# =============================================================================
# 12. ANIMALS (1 animal de test)
# =============================================================================
if ($farmResponse -and $breedId) {
    Write-Host ""
    Write-Host "12. Animals (1 animal)" -ForegroundColor Cyan

    $animalId = [guid]::NewGuid().ToString()
    $animal = @{
        id = $animalId
        birthDate = "2023-06-15T00:00:00.000Z"
        sex = "female"
        currentEid = "250269000000001"
        officialNumber = "FR-TEST-001"
        visualId = "Belle-001"
        speciesId = "bovine"
        breedId = $breedId
        status = "alive"
        notes = "Animal de test"
    }

    Write-Host "    Using breedId: $breedId" -ForegroundColor Cyan
    $animalResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/animals" -Body $animal `
        -Description "Animal: $($animal.visualId) (EID: $($animal.currentEid))"
} elseif (-not $breedId) {
    Write-Host ""
    Write-Host "12. Animals (1 animal)" -ForegroundColor Cyan
    Write-Host "  [SKIP] Animal creation skipped - breed not created" -ForegroundColor Yellow
}

# =============================================================================
# RESUME
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Donnees de test creees:" -ForegroundColor Cyan
Write-Host "  - Country: 1" -ForegroundColor White
Write-Host "  - Administration Route: 1" -ForegroundColor White
Write-Host "  - Global Medical Product: 1" -ForegroundColor White
Write-Host "  - Global Vaccine: 1" -ForegroundColor White
Write-Host "  - National Campaign: 1" -ForegroundColor White
Write-Host "  - Alert Template: 1" -ForegroundColor White
Write-Host "  - Species: 1" -ForegroundColor White
Write-Host "  - Breed: 1" -ForegroundColor White
Write-Host "  - Farm: 1" -ForegroundColor White
Write-Host "  - Veterinarian: 1" -ForegroundColor White
Write-Host "  - Lot: 1" -ForegroundColor White
Write-Host "  - Animal: 1" -ForegroundColor White
Write-Host ""
