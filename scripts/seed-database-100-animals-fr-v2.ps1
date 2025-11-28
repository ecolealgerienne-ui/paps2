# =============================================================================
# Script de Seed - 100 animaux avec données réalistes (2023-2025)
# Version 2.0 - Adapté à la nouvelle architecture unifiée
#
# PREREQUIS: Exécuter d'abord le seed TypeScript pour les données de référence:
#   npx ts-node prisma/seed-all-medical-data.ts
#
# Ce script crée:
# - 1 ferme avec vétérinaires
# - 4 campagnes nationales + 6 templates d'alertes
# - 100 animaux (70% bovins, 30% ovins)
# - Traitements, vaccinations, pesées, reproductions, documents, mouvements
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED 100 ANIMAUX - AniTra Backend API" -ForegroundColor Cyan
Write-Host "  Version 2.0 - Architecture unifiée" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

function Get-IdFromResponse {
    param([object]$Response)
    if (-not $Response) { return $null }
    if ($Response.id) { return $Response.id }
    if ($Response.data -and $Response.data.id) { return $Response.data.id }
    if ($Response.data -and $Response.data.data -and $Response.data.data.id) {
        return $Response.data.data.id
    }
    return $null
}

function Invoke-CurlApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description,
        [switch]$Silent
    )

    $uri = "$BaseUrl$Endpoint"

    if ($Description -and -not $Silent) {
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

        if (-not $Silent) {
            Write-Host " OK" -ForegroundColor Green
        }
        Start-Sleep -Milliseconds 200
        return $response
    } catch {
        if (-not $Silent) {
            Write-Host " ERROR" -ForegroundColor Red
            Write-Host "    $($_.Exception.Message)" -ForegroundColor Red

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
        }
        return $null
    }
}

function Get-RandomDate {
    param(
        [DateTime]$Start,
        [DateTime]$End
    )
    $range = ($End - $Start).TotalDays
    $randomDays = Get-Random -Minimum 0 -Maximum $range
    return $Start.AddDays($randomDays).ToString("yyyy-MM-ddT00:00:00.000Z")
}

# =============================================================================
# VARIABLES GLOBALES
# =============================================================================
$nationalCampaignIds = @()
$breedIds = @()
$productIds = @()
$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farmResponse = $null
$vetIds = @()
$lotIds = @()
$animalIds = @()
$breeds = @()

# Dates de référence (2023-2025)
$startDate = Get-Date "2023-01-01"
$endDate = Get-Date "2025-11-24"

# =============================================================================
# 0. CRÉATION DE LA FERME (nécessaire pour récupérer les produits)
# =============================================================================
Write-Host ""
Write-Host "0. Creation de la ferme" -ForegroundColor Cyan

$farm = @{
    id = $farmId
    name = "GAEC de la Vallee Verte"
    ownerId = "owner-gaec-001"
    location = "Lyon, Rhone-Alpes, France"
    address = "125 Chemin des Pres, 69100 Villeurbanne"
    commune = "69266"
    city = "Villeurbanne"
    postalCode = "69100"
    country = "FR"
    department = "69"
}

$farmResponse = Invoke-CurlApi -Method POST -Endpoint "/api/farms" -Body $farm `
    -Description "Ferme: $($farm.name)"

if (-not $farmResponse) {
    Write-Host "  ERREUR - Impossible de creer la ferme" -ForegroundColor Red
    exit 1
}

# =============================================================================
# 1. RÉCUPÉRATION DES DONNÉES EXISTANTES (pré-seedées par TypeScript)
# =============================================================================
Write-Host ""
Write-Host "1. Recuperation des donnees existantes" -ForegroundColor Cyan

# Récupérer les races existantes
Write-Host "  [FETCH] Recuperation des races..." -ForegroundColor Yellow -NoNewline
$breedsResponse = Invoke-CurlApi -Method GET -Endpoint "/api/v1/breeds?limit=200" -Silent
if ($breedsResponse) {
    $breeds = if ($breedsResponse.data) { $breedsResponse.data } else { $breedsResponse }
    foreach ($breed in $breeds) {
        $breedIds += $breed.id
    }
    Write-Host " OK ($($breedIds.Count) races)" -ForegroundColor Green
} else {
    Write-Host " ERREUR - Executez d'abord: npx ts-node prisma/seed-all-medical-data.ts" -ForegroundColor Red
    exit 1
}

# Récupérer les produits existants (endpoint global, pas besoin de farmId)
Write-Host "  [FETCH] Recuperation des produits..." -ForegroundColor Yellow -NoNewline
$productsResponse = Invoke-CurlApi -Method GET -Endpoint "/api/v1/products?limit=1000" -Silent
if ($productsResponse) {
    $products = if ($productsResponse.data) { $productsResponse.data } else { $productsResponse }
    foreach ($product in $products) {
        $productIds += $product.id
    }
    Write-Host " OK ($($productIds.Count) produits)" -ForegroundColor Green
} else {
    Write-Host " ATTENTION - Aucun produit trouve" -ForegroundColor Yellow
}

# Séparer les races par espèce
$bovineBreeds = @()
$ovineBreeds = @()
foreach ($breed in $breeds) {
    if ($breed.speciesId -eq "bovine" -or $breed.species_id -eq "bovine") {
        $bovineBreeds += $breed.id
    } elseif ($breed.speciesId -eq "ovine" -or $breed.species_id -eq "ovine") {
        $ovineBreeds += $breed.id
    }
}

Write-Host "    -> Races bovines: $($bovineBreeds.Count)" -ForegroundColor Gray
Write-Host "    -> Races ovines: $($ovineBreeds.Count)" -ForegroundColor Gray

# =============================================================================
# 1. NATIONAL CAMPAIGNS (4 campagnes)
# =============================================================================
Write-Host ""
Write-Host "1. National Campaigns (4 campagnes)" -ForegroundColor Cyan

$campaigns = @(
    @{ code = "vacc-fr-2024"; nameFr = "Campagne Vaccination 2024"; nameEn = "Vaccination Campaign 2024"; nameAr = "Vaccination Campaign 2024"; type = "vaccination"; description = "Campagne nationale de vaccination"; startDate = "2024-01-01T00:00:00.000Z"; endDate = "2024-12-31T23:59:59.999Z"; isActive = $true }
    @{ code = "depara-fr-2024"; nameFr = "Campagne Deparasitage 2024"; nameEn = "Deworming Campaign 2024"; nameAr = "Deworming Campaign 2024"; type = "deworming"; description = "Campagne de deparasitage"; startDate = "2024-03-01T00:00:00.000Z"; endDate = "2024-11-30T23:59:59.999Z"; isActive = $true }
    @{ code = "brucello-fr-2024"; nameFr = "Depistage Brucellose 2024"; nameEn = "Brucellosis Screening 2024"; nameAr = "Brucellosis Screening 2024"; type = "screening"; description = "Depistage brucellose"; startDate = "2024-01-01T00:00:00.000Z"; endDate = "2024-12-31T23:59:59.999Z"; isActive = $true }
    @{ code = "recens-fr-2024"; nameFr = "Recensement 2024"; nameEn = "Census 2024"; nameAr = "Census 2024"; type = "census"; description = "Recensement annuel"; startDate = "2024-09-01T00:00:00.000Z"; endDate = "2024-10-31T23:59:59.999Z"; isActive = $false }
)

foreach ($campaign in $campaigns) {
    $campaignResponse = Invoke-CurlApi -Method POST -Endpoint "/api/national-campaigns" -Body $campaign `
        -Description "Campagne: $($campaign.nameFr)"
    $campaignId = Get-IdFromResponse $campaignResponse
    if ($campaignId) {
        $nationalCampaignIds += $campaignId
    }
}

Write-Host "    -> $($nationalCampaignIds.Count) campagnes nationales creees" -ForegroundColor Green

# =============================================================================
# 2. ALERT TEMPLATES (6 templates)
# =============================================================================
Write-Host ""
Write-Host "2. Alert Templates (6 templates)" -ForegroundColor Cyan

$templates = @(
    @{ code = "vacc-reminder"; nameFr = "Rappel vaccination"; nameEn = "Vaccination reminder"; nameAr = "Vaccination reminder"; descriptionFr = "Rappel pour vaccinations"; descriptionEn = "Vaccination reminder"; category = "vaccination"; isActive = $true }
    @{ code = "treat-reminder"; nameFr = "Rappel traitement"; nameEn = "Treatment reminder"; nameAr = "Treatment reminder"; descriptionFr = "Rappel pour traitements"; descriptionEn = "Treatment reminder"; category = "treatment"; isActive = $true }
    @{ code = "birth-reminder"; nameFr = "Rappel mise bas"; nameEn = "Birth reminder"; nameAr = "Birth reminder"; descriptionFr = "Rappel mise bas prevue"; descriptionEn = "Expected birth"; category = "reproduction"; isActive = $true }
    @{ code = "weight-reminder"; nameFr = "Rappel pesee"; nameEn = "Weight reminder"; nameAr = "Weight reminder"; descriptionFr = "Rappel pesee periodique"; descriptionEn = "Periodic weighing"; category = "health"; isActive = $true }
    @{ code = "health-check"; nameFr = "Controle sanitaire"; nameEn = "Health check"; nameAr = "Health check"; descriptionFr = "Controle sanitaire periodique"; descriptionEn = "Periodic health check"; category = "health"; isActive = $true }
    @{ code = "campaign-reminder"; nameFr = "Rappel campagne"; nameEn = "Campaign reminder"; nameAr = "Campaign reminder"; descriptionFr = "Rappel campagne nationale"; descriptionEn = "National campaign reminder"; category = "administrative"; isActive = $true }
)

foreach ($template in $templates) {
    Invoke-CurlApi -Method POST -Endpoint "/alert-templates" -Body $template `
        -Description "Template: $($template.nameFr)"
}

# =============================================================================
# 3. VETERINARIANS (5 veterinaires)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "3. Veterinarians (5 veterinaires)" -ForegroundColor Cyan

    $vets = @(
        @{ firstName = "Marie"; lastName = "Martin"; title = "Dr."; phone = "0612345678"; email = "m.martin@vetfrance.fr"; licenseNumber = "VET-FR-001"; specialties = "Bovins laitiers" }
        @{ firstName = "Pierre"; lastName = "Dubois"; title = "Dr."; phone = "0623456789"; email = "p.dubois@vetfrance.fr"; licenseNumber = "VET-FR-002"; specialties = "Bovins viande" }
        @{ firstName = "Sophie"; lastName = "Bernard"; title = "Dr."; phone = "0634567890"; email = "s.bernard@vetfrance.fr"; licenseNumber = "VET-FR-003"; specialties = "Ovins" }
        @{ firstName = "Luc"; lastName = "Petit"; title = "Dr."; phone = "0645678901"; email = "l.petit@vetfrance.fr"; licenseNumber = "VET-FR-004"; specialties = "Chirurgie" }
        @{ firstName = "Claire"; lastName = "Moreau"; title = "Dr."; phone = "0656789012"; email = "c.moreau@vetfrance.fr"; licenseNumber = "VET-FR-005"; specialties = "Reproduction" }
    )

    foreach ($vet in $vets) {
        $vetResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarians" -Body $vet `
            -Description "Veterinaire: Dr. $($vet.lastName)"
        $vetId = Get-IdFromResponse $vetResponse
        if ($vetId) {
            $vetIds += $vetId
        }
    }

    Write-Host "    -> $($vetIds.Count) veterinaires crees" -ForegroundColor Green
}

# =============================================================================
# 5. CAMPAIGN COUNTRIES (Lier campagnes a la France)
# =============================================================================
Write-Host ""
Write-Host "5. Campaign Countries (Campagnes en France)" -ForegroundColor Cyan

$campaignCountryCount = 0
foreach ($campaignId in $nationalCampaignIds) {
    $campaignCountry = @{
        campaignId = $campaignId
        countryCode = "FR"
    }
    $response = Invoke-CurlApi -Method POST -Endpoint "/api/v1/campaign-countries" -Body $campaignCountry -Silent
    if ($response) { $campaignCountryCount++ }
}
Write-Host "    -> $campaignCountryCount liaisons campagne-pays creees" -ForegroundColor Green

# =============================================================================
# 6. FARM CONFIGURATION & PREFERENCES
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "6. Farm Configuration & Preferences" -ForegroundColor Cyan

    # Alert Configuration
    $alertConfig = @{
        enableEmailAlerts = $true
        enableSmsAlerts = $false
        enablePushAlerts = $true
        vaccinationReminderDays = 7
        treatmentReminderDays = 3
        healthCheckReminderDays = 30
    }
    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/alert-configuration" -Body $alertConfig `
        -Description "  Configuration alertes"

    # Farm Preferences - utiliser les races et produits existants
    $defaultBreedId = if ($bovineBreeds.Count -gt 0) { $bovineBreeds[0] } else { $null }
    $farmPreferences = @{
        weightUnit = "kg"
        currency = "EUR"
        language = "fr"
        dateFormat = "DD/MM/YYYY"
        enableNotifications = $true
        defaultVeterinarianId = if ($vetIds.Count -gt 0) { $vetIds[0] } else { $null }
        defaultBreedId = $defaultBreedId
        defaultSpeciesId = "bovine"
    }
    Invoke-CurlApi -Method PUT -Endpoint "/farms/$farmId/preferences" -Body $farmPreferences `
        -Description "  Preferences ferme"

    # Farm Product Preferences (5 produits favoris) - utiliser productIds existants
    $productPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(5, $productIds.Count); $i++) {
        $productPref = @{
            productId = $productIds[$i]
            displayOrder = $i + 1
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/product-preferences" -Body $productPref -Silent
        if ($response) { $productPrefCount++ }
    }

    # Farm Veterinarian Preferences (3 vétérinaires favoris)
    $vetPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(3, $vetIds.Count); $i++) {
        $vetPref = @{
            veterinarianId = $vetIds[$i]
            displayOrder = $i + 1
            isActive = $true
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarian-preferences" -Body $vetPref -Silent
        if ($response) { $vetPrefCount++ }
    }

    # Farm Breed Preferences (3 races favorites)
    $breedPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(3, $bovineBreeds.Count); $i++) {
        $breedPref = @{
            breedId = $bovineBreeds[$i]
        }
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/breed-preferences" -Body $breedPref -Silent
        if ($response) { $breedPrefCount++ }
    }

    # Farm Campaign Preferences (Inscription a 2 campagnes)
    $campaignPrefCount = 0
    for ($i = 0; $i -lt [Math]::Min(2, $nationalCampaignIds.Count); $i++) {
        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/campaign-preferences/$($nationalCampaignIds[$i])/enroll" -Body @{} -Silent
        if ($response) { $campaignPrefCount++ }
    }

    Write-Host "    -> Produits favoris: $productPrefCount" -ForegroundColor Green
    Write-Host "    -> Veterinaires favoris: $vetPrefCount" -ForegroundColor Green
    Write-Host "    -> Races favorites: $breedPrefCount" -ForegroundColor Green
    Write-Host "    -> Campagnes inscrites: $campaignPrefCount" -ForegroundColor Green
}

# =============================================================================
# 7. LOTS (10 lots varies)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "7. Lots (10 lots)" -ForegroundColor Cyan

    $lots = @(
        @{ name = "Lot Vaches Laitieres"; type = "production"; status = "open" }
        @{ name = "Lot Genisses 2024"; type = "reproduction"; status = "open" }
        @{ name = "Lot Vente Automne 2024"; type = "sale"; status = "closed" }
        @{ name = "Lot Traitement Parasites Mars"; type = "treatment"; status = "completed" }
        @{ name = "Lot Vaccination Printemps"; type = "vaccination"; status = "completed" }
        @{ name = "Lot Brebis Laitieres"; type = "production"; status = "open" }
        @{ name = "Lot Agneaux Printemps 2024"; type = "birth"; status = "open" }
        @{ name = "Lot Reforme 2024"; type = "sale"; status = "open" }
        @{ name = "Lot Quarantaine"; type = "quarantine"; status = "open" }
        @{ name = "Lot Engraissement"; type = "fattening"; status = "open" }
    )

    foreach ($lot in $lots) {
        $lotResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/lots" -Body $lot -Silent
        $lotId = Get-IdFromResponse $lotResponse
        if ($lotId) {
            $lotIds += $lotId
        }
    }
    Write-Host "    -> $($lotIds.Count) lots crees" -ForegroundColor Green
}

# =============================================================================
# 8. ANIMAUX (100 animaux: 70% bovins, 30% ovins)
# =============================================================================
if ($farmResponse -and $breedIds.Count -gt 0) {
    Write-Host ""
    Write-Host "8. Animals (100 animaux: ~70 bovins, ~30 ovins)" -ForegroundColor Cyan
    Write-Host "    Statuts: 70-75 vivants, 10-12 vendus, 5-8 morts, 5-8 abattus" -ForegroundColor Gray
    Write-Host ""

    # Statuts et leur répartition
    $animalStatuses = @(
        @{ status = "alive"; count = 72 }
        @{ status = "sold"; count = 11 }
        @{ status = "dead"; count = 7 }
        @{ status = "slaughtered"; count = 10 }
    )

    $animalCounter = 0
    $birthStartDate = Get-Date "2020-01-01"
    $birthEndDate = Get-Date "2025-06-01"

    foreach ($statusGroup in $animalStatuses) {
        $status = $statusGroup.status
        $count = $statusGroup.count

        for ($i = 0; $i -lt $count; $i++) {
            $animalCounter++

            # 70% bovins, 30% ovins
            $isBovine = ($animalCounter % 10) -le 6
            $speciesId = if ($isBovine) { "bovine" } else { "ovine" }

            # Utiliser les races existantes
            $breedId = if ($isBovine -and $bovineBreeds.Count -gt 0) {
                $bovineBreeds | Get-Random
            } elseif (-not $isBovine -and $ovineBreeds.Count -gt 0) {
                $ovineBreeds | Get-Random
            } else {
                $breedIds | Get-Random
            }

            # Sexe aléatoire
            $sex = if ((Get-Random -Minimum 0 -Maximum 2) -eq 0) { "male" } else { "female" }

            # Date de naissance aléatoire
            $birthDate = Get-RandomDate -Start $birthStartDate -End $birthEndDate

            # Générer ID électronique et numéro
            $eidNumber = "2502690" + ("{0:D8}" -f (Get-Random -Minimum 1 -Maximum 99999999))
            $officialNumber = "FR-{0}-{1:D5}" -f (Get-Date $birthDate -Format "yyyy"), (Get-Random -Minimum 1 -Maximum 99999)
            $visualId = if ($isBovine) {
                @("Belle", "Marguerite", "Duchesse", "Fauvette", "Iris", "Lilas", "Noisette", "Pivoine", "Rose", "Tulipe",
                  "Cesar", "Django", "Elliot", "Faust", "Gaspard", "Hugo", "Igor", "Jules", "Lancelot", "Nestor") | Get-Random
            } else {
                @("Blanchette", "Cannelle", "Doucette", "Etoile", "Flocon", "Grisette", "Lulu", "Noisette", "Perle", "Violette",
                  "Alphonse", "Basile", "Caramel", "Dominique", "Edmond", "Felix", "Gaston", "Leon", "Marius", "Oscar") | Get-Random
            }
            $visualId += "-" + $animalCounter.ToString("D3")

            $animal = @{
                id = [guid]::NewGuid().ToString()
                birthDate = $birthDate
                sex = $sex
                currentEid = $eidNumber
                officialNumber = $officialNumber
                visualId = $visualId
                speciesId = $speciesId
                breedId = $breedId
                status = $status
                notes = "Animal de test - Statut: $status"
            }

            # Si animal mort/abattu/vendu, ajouter date
            if ($status -eq "dead") {
                $deathDate = Get-RandomDate -Start (Get-Date $birthDate).AddMonths(6) -End $endDate
                $animal.deathDate = $deathDate
                $animal.deathReason = @("maladie", "accident", "vieillesse") | Get-Random
            } elseif ($status -eq "slaughtered") {
                $slaughterDate = Get-RandomDate -Start (Get-Date $birthDate).AddYears(1) -End $endDate
                $animal.slaughterDate = $slaughterDate
            } elseif ($status -eq "sold") {
                $saleDate = Get-RandomDate -Start (Get-Date $birthDate).AddMonths(8) -End $endDate
                $animal.saleDate = $saleDate
            }

            $animalResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/animals" -Body $animal -Silent
            $animalIdResult = Get-IdFromResponse $animalResponse

            if ($animalIdResult) {
                $animalIds += $animal.id

                if ($animalCounter % 10 -eq 0) {
                    Write-Host "    -> Animaux: $animalCounter/100 crees..." -ForegroundColor Cyan
                }
            }
        }
    }

    Write-Host ""
    Write-Host "    -> TOTAL: $($animalIds.Count) animaux crees avec succes!" -ForegroundColor Green
}

# =============================================================================
# 9. LOT-ANIMALS (Affecter animaux aux lots)
# =============================================================================
if ($farmResponse -and $lotIds.Count -gt 0 -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "9. Lot-Animals (Affectation aux lots)" -ForegroundColor Cyan

    $lotAnimalCount = 0
    foreach ($animalId in $animalIds) {
        $numLots = Get-Random -Minimum 1 -Maximum 3
        $selectedLots = $lotIds | Get-Random -Count $numLots

        foreach ($lotId in $selectedLots) {
            $lotAnimalDto = @{
                animalIds = @($animalId)
            }
            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/lots/$lotId/animals" -Body $lotAnimalDto -Silent
            if ($response) { $lotAnimalCount++ }
        }
    }
    Write-Host "    -> $lotAnimalCount affectations animal-lot creees" -ForegroundColor Green
}

# =============================================================================
# 10. TREATMENTS (Traitements + Vaccinations unifiés - ~450-550 total)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0 -and $productIds.Count -gt 0) {
    Write-Host ""
    Write-Host "10. Treatments (Traitements + Vaccinations unifies)" -ForegroundColor Cyan

    $treatmentCount = 0
    $vaccinationCount = 0

    foreach ($animalId in $animalIds) {
        # 2-3 traitements par animal
        $numTreatments = Get-Random -Minimum 2 -Maximum 4
        for ($i = 0; $i -lt $numTreatments; $i++) {
            $treatmentDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $withdrawalDays = Get-Random -Minimum 0 -Maximum 60
            $withdrawalEndDate = (Get-Date $treatmentDate).AddDays($withdrawalDays).ToString("yyyy-MM-ddT00:00:00.000Z")

            $treatment = @{
                animalId = $animalId
                productId = $productIds | Get-Random
                type = "treatment"
                treatmentDate = $treatmentDate
                dose = [Math]::Round((Get-Random -Minimum 10 -Maximum 100) / 10.0, 1)
                doseUnit = @("ml", "mg", "g") | Get-Random
                status = @("completed", "in_progress", "planned") | Get-Random
                withdrawalEndDate = $withdrawalEndDate
                diagnosis = @("Infection respiratoire", "Parasitose", "Boiterie", "Mammite", "Diarrhee", "Fievre", "Plaie", "Reproduction") | Get-Random
                notes = "Traitement therapeutique"
            }

            if ($vetIds.Count -gt 0) {
                $treatment.veterinarianId = $vetIds | Get-Random
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/treatments" -Body $treatment -Silent
            if ($response) { $treatmentCount++ }

            if ($treatmentCount % 50 -eq 0) {
                Write-Host "    -> Traitements: $treatmentCount crees..." -ForegroundColor Cyan
            }
        }

        # 2-3 vaccinations par animal (type=vaccination)
        $numVaccinations = Get-Random -Minimum 2 -Maximum 4
        for ($i = 0; $i -lt $numVaccinations; $i++) {
            $vaccineDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $nextDueDate = (Get-Date $vaccineDate).AddYears(1).ToString("yyyy-MM-ddT00:00:00.000Z")

            $vaccination = @{
                animalId = $animalId
                productId = $productIds | Get-Random
                type = "vaccination"
                treatmentDate = $vaccineDate
                dose = @(1.0, 2.0, 2.5, 3.0, 5.0) | Get-Random
                doseUnit = "ml"
                status = "completed"
                withdrawalEndDate = $nextDueDate
                diagnosis = @("Vaccination preventive", "Rappel vaccinal", "Primo-vaccination") | Get-Random
                notes = "Vaccination de routine"
            }

            if ($vetIds.Count -gt 0) {
                $vaccination.veterinarianId = $vetIds | Get-Random
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/treatments" -Body $vaccination -Silent
            if ($response) { $vaccinationCount++ }

            if ($vaccinationCount % 50 -eq 0) {
                Write-Host "    -> Vaccinations: $vaccinationCount creees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $treatmentCount traitements + $vaccinationCount vaccinations" -ForegroundColor Green
}

# =============================================================================
# 11. MOVEMENTS (~150-200 mouvements)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "11. Movements (~150-200 mouvements)" -ForegroundColor Cyan

    $movementCount = 0

    foreach ($animalId in $animalIds) {
        $numMovements = Get-Random -Minimum 1 -Maximum 3

        for ($i = 0; $i -lt $numMovements; $i++) {
            $movementDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $movementType = @("entry", "exit", "transfer", "birth", "purchase") | Get-Random

            $movement = @{
                movementType = $movementType
                movementDate = $movementDate
                animalIds = @($animalId)
                reason = switch ($movementType) {
                    "entry" { @("Achat", "Naissance", "Retour") | Get-Random }
                    "exit" { @("Vente", "Reforme", "Abattage") | Get-Random }
                    "transfer" { "Changement de batiment" }
                    "birth" { "Naissance a la ferme" }
                    "purchase" { "Achat en elevage" }
                }
                notes = "Mouvement type $movementType"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/movements" -Body $movement -Silent
            if ($response) { $movementCount++ }

            if ($movementCount % 50 -eq 0) {
                Write-Host "    -> Mouvements: $movementCount crees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $movementCount mouvements crees" -ForegroundColor Green
}

# =============================================================================
# 12. WEIGHTS (~400-500 pesees)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "12. Weights (~400-500 pesees)" -ForegroundColor Cyan

    $weightCount = 0

    foreach ($animalId in $animalIds) {
        $numWeights = Get-Random -Minimum 4 -Maximum 6
        $baseWeight = Get-Random -Minimum 250 -Maximum 500

        for ($i = 0; $i -lt $numWeights; $i++) {
            $weightDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
            $weightValue = $baseWeight + ($i * (Get-Random -Minimum 20 -Maximum 60))

            $weight = @{
                animalId = $animalId
                weight = [Math]::Round($weightValue, 1)
                weightDate = $weightDate
                source = @("manual", "automatic", "weighbridge") | Get-Random
                notes = "Pesee periodique #$($i + 1)"
            }

            $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/weights" -Body $weight -Silent
            if ($response) { $weightCount++ }

            if ($weightCount % 100 -eq 0) {
                Write-Host "    -> Pesees: $weightCount creees..." -ForegroundColor Cyan
            }
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $weightCount pesees creees" -ForegroundColor Green
}

# =============================================================================
# 13. BREEDINGS (~40-50 reproductions)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "13. Breedings (~40-50 reproductions)" -ForegroundColor Cyan

    $breedingCount = 0
    $numBreedings = [Math]::Min(50, ($animalIds.Count * 0.45))
    $selectedAnimals = $animalIds | Get-Random -Count $numBreedings

    foreach ($animalId in $selectedAnimals) {
        $breedingDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End (Get-Date "2024-12-31")
        $expectedBirthDate = (Get-Date $breedingDate).AddMonths(9).ToString("yyyy-MM-ddT00:00:00.000Z")

        $breeding = @{
            motherId = $animalId
            fatherName = @("Taureau Elite", "Taureau Limousin", "Belier Ile-de-France", "Reproducteur IA") | Get-Random
            method = @("artificial_insemination", "natural_mating") | Get-Random
            breedingDate = $breedingDate
            expectedBirthDate = $expectedBirthDate
            expectedOffspringCount = Get-Random -Minimum 1 -Maximum 3
            status = @("planned", "confirmed", "delivered", "failed") | Get-Random
            notes = "Saillie IA ou monte naturelle"
        }

        if ($vetIds.Count -gt 0) {
            $breeding.veterinarianId = $vetIds | Get-Random
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/breedings" -Body $breeding -Silent
        if ($response) { $breedingCount++ }

        if ($breedingCount % 10 -eq 0) {
            Write-Host "    -> Reproductions: $breedingCount creees..." -ForegroundColor Cyan
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $breedingCount reproductions creees" -ForegroundColor Green
}

# =============================================================================
# 14. DOCUMENTS (~100-120 documents)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0) {
    Write-Host ""
    Write-Host "14. Documents (~100 documents)" -ForegroundColor Cyan

    $documentCount = 0

    foreach ($animalId in $animalIds) {
        $uploadDate = Get-RandomDate -Start (Get-Date "2023-01-01") -End $endDate
        $issueDate = $uploadDate
        $expiryDate = (Get-Date $issueDate).AddYears(1).ToString("yyyy-MM-ddT00:00:00.000Z")

        $docType = @("health_certificate", "movement_permit", "test_results", "pedigree", "insurance", "other") | Get-Random
        $docTitle = switch ($docType) {
            "health_certificate" { "Certificat sanitaire" }
            "movement_permit" { "Autorisation de mouvement" }
            "test_results" { "Resultats d'analyses" }
            "pedigree" { "Certificat de genealogie" }
            "insurance" { "Attestation d'assurance" }
            "other" { "Document divers" }
        }

        $document = @{
            animalId = $animalId
            type = $docType
            title = $docTitle
            fileName = $docTitle.Replace(" ", "-").ToLower() + "-" + (Get-Random -Minimum 1000 -Maximum 9999) + ".pdf"
            fileUrl = "https://example.com/documents/animal-$animalId/" + $docTitle.Replace(" ", "-").ToLower() + ".pdf"
            fileSizeBytes = Get-Random -Minimum 50000 -Maximum 500000
            mimeType = "application/pdf"
            uploadDate = $uploadDate
            documentNumber = "DOC-FR-" + (Get-Date $issueDate -Format "yyyy") + "-" + (Get-Random -Minimum 10000 -Maximum 99999)
            issueDate = $issueDate
            expiryDate = $expiryDate
            notes = "Document officiel"
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/documents" -Body $document -Silent
        if ($response) { $documentCount++ }

        if ($documentCount % 25 -eq 0) {
            Write-Host "    -> Documents: $documentCount crees..." -ForegroundColor Cyan
        }
    }
    Write-Host ""
    Write-Host "    -> TOTAL: $documentCount documents crees" -ForegroundColor Green
}

# =============================================================================
# 15. PERSONAL CAMPAIGNS (4 campagnes personnelles)
# =============================================================================
if ($farmResponse -and $animalIds.Count -gt 0 -and $productIds.Count -gt 0) {
    Write-Host ""
    Write-Host "15. Personal Campaigns (4 campagnes personnelles)" -ForegroundColor Cyan

    $campaignsData = @(
        @{ name = "Campagne Deparasitage Printemps 2024"; type = "deworming"; campaignDate = "2024-03-15T00:00:00.000Z"; withdrawalEndDate = "2024-04-15T00:00:00.000Z"; targetCount = 80 }
        @{ name = "Campagne Vaccination Automne 2024"; type = "vaccination"; campaignDate = "2024-09-01T00:00:00.000Z"; withdrawalEndDate = "2024-10-01T00:00:00.000Z"; targetCount = 95 }
        @{ name = "Traitement Antiparasitaire Ete"; type = "treatment"; campaignDate = "2024-06-15T00:00:00.000Z"; withdrawalEndDate = "2024-07-15T00:00:00.000Z"; targetCount = 70 }
        @{ name = "Campagne Depistage Brucellose"; type = "screening"; campaignDate = "2024-05-01T00:00:00.000Z"; withdrawalEndDate = "2024-05-31T00:00:00.000Z"; targetCount = 100 }
    )

    $campaignCount = 0
    foreach ($campaignData in $campaignsData) {
        $targetAnimals = $animalIds | Get-Random -Count ([Math]::Min($campaignData.targetCount, $animalIds.Count))

        $personalCampaign = @{
            name = $campaignData.name
            description = "Campagne personnalisee de la ferme"
            productId = $productIds | Get-Random
            type = $campaignData.type
            campaignDate = $campaignData.campaignDate
            withdrawalEndDate = $campaignData.withdrawalEndDate
            animalIdsJson = ($targetAnimals | ConvertTo-Json -Compress)
            targetCount = $campaignData.targetCount
            status = @("planned", "in_progress", "completed") | Get-Random
            notes = "Campagne de gestion sanitaire"
        }

        if ($vetIds.Count -gt 0) {
            $personalCampaign.veterinarianId = $vetIds | Get-Random
        }

        $response = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/personal-campaigns" -Body $personalCampaign `
            -Description "  Campagne: $($campaignData.name)"
        if ($response) { $campaignCount++ }
    }
    Write-Host "    -> $campaignCount campagnes personnelles creees" -ForegroundColor Green
}

# =============================================================================
# RESUME FINAL
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED 100 ANIMAUX - TERMINE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resume complet:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Donnees pre-seedees (TypeScript):" -ForegroundColor Yellow
Write-Host "  - 3 especes (bovine, ovine, caprine)" -ForegroundColor White
Write-Host "  - 8 pays" -ForegroundColor White
Write-Host "  - $($breedIds.Count) races" -ForegroundColor White
Write-Host "  - $($productIds.Count) produits medicaux" -ForegroundColor White
Write-Host "  - 14 voies d'administration" -ForegroundColor White
Write-Host "  - 20 unites de mesure" -ForegroundColor White
Write-Host ""
Write-Host "Donnees creees (ce script):" -ForegroundColor Yellow
Write-Host "  - 4 campagnes nationales" -ForegroundColor White
Write-Host "  - 6 templates d'alertes" -ForegroundColor White
Write-Host "  - 1 ferme (GAEC de la Vallee Verte)" -ForegroundColor White
Write-Host "  - 5 veterinaires" -ForegroundColor White
Write-Host "  - 10 lots" -ForegroundColor White
Write-Host ""
Write-Host "Animaux et donnees transactionnelles:" -ForegroundColor Yellow
Write-Host "  - $($animalIds.Count) animaux (70% bovins, 30% ovins)" -ForegroundColor Green
Write-Host "    * 72 vivants, 11 vendus, 7 morts, 10 abattus" -ForegroundColor White
Write-Host "  - ~150 affectations lot-animaux" -ForegroundColor Green
Write-Host "  - ~450-550 traitements + vaccinations (unifies)" -ForegroundColor Green
Write-Host "  - ~150-200 mouvements" -ForegroundColor Green
Write-Host "  - ~400-500 pesees" -ForegroundColor Green
Write-Host "  - ~40-50 reproductions" -ForegroundColor Green
Write-Host "  - ~100 documents" -ForegroundColor Green
Write-Host "  - 4 campagnes personnelles" -ForegroundColor Green
Write-Host ""
Write-Host "Donnees etalees sur la periode 2023-2025" -ForegroundColor Gray
Write-Host ""
Write-Host "Base de donnees prete pour les tests!" -ForegroundColor Green
Write-Host ""
