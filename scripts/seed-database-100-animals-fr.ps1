# =============================================================================
# Script de Seed - 100 animaux avec données réalistes (2023-2025)
# 1 ferme, bovins/ovins, traitements, vaccins, pesées, reproductions, etc.
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED 100 ANIMAUX - AniTra Backend API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Helper pour extraire l'ID depuis une réponse API (structure variable)
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

# Helper pour appeler l'API avec Invoke-RestMethod
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

# Helper pour générer une date aléatoire dans une plage
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
$globalProductIds = @()
$globalVaccineIds = @()
$nationalCampaignIds = @()
$breedIds = @()
$speciesIds = @()
$farmId = $null
$farmResponse = $null
$vetIds = @()
$lotIds = @()
$animalIds = @()
$medicalProductIds = @()
$customVaccineIds = @()

# Dates de référence (2023-2025)
$startDate = Get-Date "2023-01-01"
$endDate = Get-Date "2025-11-24"

# =============================================================================
# 1. COUNTRIES (5 pays européens)
# =============================================================================
Write-Host ""
Write-Host "1. Countries (5 pays europeens)" -ForegroundColor Cyan

$countries = @(
    @{ code = "FR"; nameFr = "France"; nameEn = "France"; nameAr = "فرنسا"; region = "EU" }
    @{ code = "BE"; nameFr = "Belgique"; nameEn = "Belgium"; nameAr = "بلجيكا"; region = "EU" }
    @{ code = "DE"; nameFr = "Allemagne"; nameEn = "Germany"; nameAr = "ألمانيا"; region = "EU" }
    @{ code = "ES"; nameFr = "Espagne"; nameEn = "Spain"; nameAr = "إسبانيا"; region = "EU" }
    @{ code = "IT"; nameFr = "Italie"; nameEn = "Italy"; nameAr = "إيطاليا"; region = "EU" }
)

foreach ($country in $countries) {
    Invoke-CurlApi -Method POST -Endpoint "/countries" -Body $country `
        -Description "Pays: $($country.nameFr)"
}

# =============================================================================
# 2. ADMINISTRATION ROUTES (5 routes)
# =============================================================================
Write-Host ""
Write-Host "2. Administration Routes (5 voies)" -ForegroundColor Cyan

$routes = @(
    @{ code = "IM"; nameFr = "Intramusculaire"; nameEn = "Intramuscular"; nameAr = "عضلي" }
    @{ code = "SC"; nameFr = "Sous-cutanee"; nameEn = "Subcutaneous"; nameAr = "تحت الجلد" }
    @{ code = "IV"; nameFr = "Intraveineuse"; nameEn = "Intravenous"; nameAr = "وريدي" }
    @{ code = "PO"; nameFr = "Orale"; nameEn = "Oral"; nameAr = "فموي" }
    @{ code = "TOP"; nameFr = "Topique"; nameEn = "Topical"; nameAr = "موضعي" }
)

foreach ($route in $routes) {
    Invoke-CurlApi -Method POST -Endpoint "/administration-routes" -Body $route `
        -Description "Route: $($route.nameFr)"
}

# =============================================================================
# 3. GLOBAL MEDICAL PRODUCTS (15 produits)
# =============================================================================
Write-Host ""
Write-Host "3. Global Medical Products (15 produits)" -ForegroundColor Cyan

$products = @(
    @{ code = "IVERM-001"; nameFr = "Ivomec 1%"; nameEn = "Ivomec 1%"; nameAr = "Ivomec 1%"; type = "antiparasitic"; laboratoire = "Boehringer Ingelheim"; principeActif = "Ivermectine" }
    @{ code = "PANACUR-001"; nameFr = "Panacur"; nameEn = "Panacur"; nameAr = "Panacur"; type = "antiparasitic"; laboratoire = "MSD"; principeActif = "Fenbendazole" }
    @{ code = "CLAMOXYL-001"; nameFr = "Clamoxyl LA"; nameEn = "Clamoxyl LA"; nameAr = "Clamoxyl LA"; type = "antibiotic"; laboratoire = "Zoetis"; principeActif = "Amoxicilline" }
    @{ code = "EXCENEL-001"; nameFr = "Excenel RTU"; nameEn = "Excenel RTU"; nameAr = "Excenel RTU"; type = "antibiotic"; laboratoire = "Zoetis"; principeActif = "Ceftiofur" }
    @{ code = "FINADYNE-001"; nameFr = "Finadyne"; nameEn = "Finadyne"; nameAr = "Finadyne"; type = "anti_inflammatory"; laboratoire = "MSD"; principeActif = "Flunixine" }
    @{ code = "METACAM-001"; nameFr = "Metacam"; nameEn = "Metacam"; nameAr = "Metacam"; type = "anti_inflammatory"; laboratoire = "Boehringer Ingelheim"; principeActif = "Meloxicam" }
    @{ code = "CALCIUM-001"; nameFr = "Calcium Injectable"; nameEn = "Calcium Injectable"; nameAr = "Calcium Injectable"; type = "vitamin_mineral"; laboratoire = "Vetoquinol"; principeActif = "Calcium borogluconate" }
    @{ code = "VITAD3-001"; nameFr = "Vitamine AD3E"; nameEn = "Vitamin AD3E"; nameAr = "Vitamin AD3E"; type = "vitamin_mineral"; laboratoire = "CEVA"; principeActif = "Vitamines A, D3, E" }
    @{ code = "OXYTETRA-001"; nameFr = "Oxytetracycline LA"; nameEn = "Oxytetracycline LA"; nameAr = "Oxytetracycline LA"; type = "antibiotic"; laboratoire = "CEVA"; principeActif = "Oxytetracycline" }
    @{ code = "COLICOLI-001"; nameFr = "Coliprotec"; nameEn = "Coliprotec"; nameAr = "Coliprotec"; type = "antibiotic"; laboratoire = "Hipra"; principeActif = "Colistine" }
    @{ code = "DEXTRO-001"; nameFr = "Dextrose 50%"; nameEn = "Dextrose 50%"; nameAr = "Dextrose 50%"; type = "vitamin_mineral"; laboratoire = "Vetoquinol"; principeActif = "Glucose" }
    @{ code = "OXYTOCINE-001"; nameFr = "Oxytocine"; nameEn = "Oxytocin"; nameAr = "Oxytocin"; type = "hormone"; laboratoire = "CEVA"; principeActif = "Oxytocine" }
    @{ code = "PROSTAGLAN-001"; nameFr = "Prostaglandine"; nameEn = "Prostaglandin"; nameAr = "Prostaglandin"; type = "hormone"; laboratoire = "Zoetis"; principeActif = "PGF2alpha" }
    @{ code = "BETADINE-001"; nameFr = "Betadine"; nameEn = "Betadine"; nameAr = "Betadine"; type = "antiseptic"; laboratoire = "Vetoquinol"; principeActif = "Povidone iodee" }
    @{ code = "SPRAY-001"; nameFr = "Spray cicatrisant"; nameEn = "Wound spray"; nameAr = "Wound spray"; type = "antiseptic"; laboratoire = "Vetoquinol"; principeActif = "Oxytetracycline" }
)

foreach ($product in $products) {
    $productResponse = Invoke-CurlApi -Method POST -Endpoint "/global-medical-products" -Body $product `
        -Description "Produit: $($product.nameFr)"
    $productId = Get-IdFromResponse $productResponse
    if ($productId) {
        $globalProductIds += $productId
    }
}

Write-Host "    -> $($globalProductIds.Count) produits globaux crees" -ForegroundColor Green

# =============================================================================
# 4. GLOBAL VACCINES (10 vaccins)
# =============================================================================
Write-Host ""
Write-Host "4. Global Vaccines (10 vaccins)" -ForegroundColor Cyan

$vaccines = @(
    @{ code = "ENTEROTOX-001"; nameFr = "Vaccin Enterotoxemie"; nameEn = "Enterotoxemia Vaccine"; nameAr = "Enterotoxemia Vaccine"; targetDisease = "enterotoxemia"; laboratoire = "MSD" }
    @{ code = "BRUCELLO-001"; nameFr = "Vaccin Brucellose B19"; nameEn = "Brucellosis B19"; nameAr = "Brucellosis B19"; targetDisease = "brucellosis"; laboratoire = "MSD" }
    @{ code = "BLUETONGUE-001"; nameFr = "Vaccin Fievre Catarrhale"; nameEn = "Bluetongue Vaccine"; nameAr = "Bluetongue Vaccine"; targetDisease = "bluetongue"; laboratoire = "Zoetis" }
    @{ code = "FMD-001"; nameFr = "Vaccin Fievre Aphteuse"; nameEn = "Foot and Mouth Disease"; nameAr = "Foot and Mouth Disease"; targetDisease = "foot_and_mouth"; laboratoire = "CEVA" }
    @{ code = "RABIES-001"; nameFr = "Vaccin Rage"; nameEn = "Rabies Vaccine"; nameAr = "Rabies Vaccine"; targetDisease = "rabies"; laboratoire = "Zoetis" }
    @{ code = "ANTHRAX-001"; nameFr = "Vaccin Charbon"; nameEn = "Anthrax Vaccine"; nameAr = "Anthrax Vaccine"; targetDisease = "anthrax"; laboratoire = "CEVA" }
    @{ code = "PAST-001"; nameFr = "Vaccin Pasteurellose"; nameEn = "Pasteurellosis Vaccine"; nameAr = "Pasteurellosis Vaccine"; targetDisease = "pasteurellosis"; laboratoire = "MSD" }
    @{ code = "PPR-001"; nameFr = "Vaccin Peste Petits Ruminants"; nameEn = "PPR Vaccine"; nameAr = "PPR Vaccine"; targetDisease = "ppr"; laboratoire = "CEVA" }
    @{ code = "SHEEPPOX-001"; nameFr = "Vaccin Variole Ovine"; nameEn = "Sheep Pox Vaccine"; nameAr = "Sheep Pox Vaccine"; targetDisease = "sheep_pox"; laboratoire = "MSD" }
    @{ code = "MULTI-001"; nameFr = "Vaccin Multivalent"; nameEn = "Multivalent Vaccine"; nameAr = "Multivalent Vaccine"; targetDisease = "other"; laboratoire = "Hipra" }
)

foreach ($vaccine in $vaccines) {
    $vaccineResponse = Invoke-CurlApi -Method POST -Endpoint "/vaccines-global" -Body $vaccine `
        -Description "Vaccin: $($vaccine.nameFr)"
    $vaccineId = Get-IdFromResponse $vaccineResponse
    if ($vaccineId) {
        $globalVaccineIds += $vaccineId
    }
}

Write-Host "    -> $($globalVaccineIds.Count) vaccins globaux crees" -ForegroundColor Green

# =============================================================================
# 5. NATIONAL CAMPAIGNS (4 campagnes)
# =============================================================================
Write-Host ""
Write-Host "5. National Campaigns (4 campagnes)" -ForegroundColor Cyan

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
# 6. ALERT TEMPLATES (6 templates)
# =============================================================================
Write-Host ""
Write-Host "6. Alert Templates (6 templates)" -ForegroundColor Cyan

$templates = @(
    @{ code = "vacc-reminder"; nameFr = "Rappel vaccination"; nameEn = "Vaccination reminder"; nameAr = "Vaccination reminder"; descriptionFr = "Rappel pour vaccinations"; descriptionEn = "Vaccination reminder"; category = "vaccination"; daysBeforeAlert = 7; isActive = $true }
    @{ code = "treat-reminder"; nameFr = "Rappel traitement"; nameEn = "Treatment reminder"; nameAr = "Treatment reminder"; descriptionFr = "Rappel pour traitements"; descriptionEn = "Treatment reminder"; category = "treatment"; daysBeforeAlert = 3; isActive = $true }
    @{ code = "birth-reminder"; nameFr = "Rappel mise bas"; nameEn = "Birth reminder"; nameAr = "Birth reminder"; descriptionFr = "Rappel mise bas prevue"; descriptionEn = "Expected birth"; category = "reproduction"; daysBeforeAlert = 10; isActive = $true }
    @{ code = "weight-reminder"; nameFr = "Rappel pesee"; nameEn = "Weight reminder"; nameAr = "Weight reminder"; descriptionFr = "Rappel pesee periodique"; descriptionEn = "Periodic weighing"; category = "health"; daysBeforeAlert = 30; isActive = $true }
    @{ code = "health-check"; nameFr = "Controle sanitaire"; nameEn = "Health check"; nameAr = "Health check"; descriptionFr = "Controle sanitaire periodique"; descriptionEn = "Periodic health check"; category = "health"; daysBeforeAlert = 60; isActive = $true }
    @{ code = "campaign-reminder"; nameFr = "Rappel campagne"; nameEn = "Campaign reminder"; nameAr = "Campaign reminder"; descriptionFr = "Rappel campagne nationale"; descriptionEn = "National campaign reminder"; category = "campaign"; daysBeforeAlert = 5; isActive = $true }
)

foreach ($template in $templates) {
    Invoke-CurlApi -Method POST -Endpoint "/alert-templates" -Body $template `
        -Description "Template: $($template.nameFr)"
}

# =============================================================================
# 7. SPECIES (2 especes: bovins et ovins)
# =============================================================================
Write-Host ""
Write-Host "7. Species (2 especes)" -ForegroundColor Cyan

$species = @(
    @{ id = "bovine"; nameFr = "Bovin"; nameEn = "Bovine"; nameAr = "بقري"; icon = "cow" }
    @{ id = "ovine"; nameFr = "Ovin"; nameEn = "Ovine"; nameAr = "غنمي"; icon = "sheep" }
)

foreach ($specie in $species) {
    $speciesResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/species" -Body $specie `
        -Description "Espece: $($specie.nameFr)"
    if ($speciesResponse) {
        $speciesIds += $specie.id
    }
}

Write-Host "    -> $($speciesIds.Count) especes creees" -ForegroundColor Green

# =============================================================================
# 8. BREEDS (8 races: 5 bovines + 3 ovines)
# =============================================================================
Write-Host ""
Write-Host "8. Breeds (8 races)" -ForegroundColor Cyan

$breeds = @(
    # Races bovines
    @{ code = "prim-holstein"; speciesId = "bovine"; nameFr = "Prim'Holstein"; nameEn = "Holstein"; nameAr = "Holstein"; description = "Race laitiere" }
    @{ code = "montbeliarde"; speciesId = "bovine"; nameFr = "Montbeliarde"; nameEn = "Montbeliarde"; nameAr = "Montbeliarde"; description = "Race mixte" }
    @{ code = "charolaise"; speciesId = "bovine"; nameFr = "Charolaise"; nameEn = "Charolais"; nameAr = "Charolais"; description = "Race a viande" }
    @{ code = "limousine"; speciesId = "bovine"; nameFr = "Limousine"; nameEn = "Limousin"; nameAr = "Limousin"; description = "Race a viande" }
    @{ code = "blonde-aquitaine"; speciesId = "bovine"; nameFr = "Blonde d'Aquitaine"; nameEn = "Blonde d'Aquitaine"; nameAr = "Blonde d'Aquitaine"; description = "Race a viande" }
    # Races ovines
    @{ code = "ile-de-france"; speciesId = "ovine"; nameFr = "Ile-de-France"; nameEn = "Ile-de-France"; nameAr = "Ile-de-France"; description = "Race a viande" }
    @{ code = "lacaune"; speciesId = "ovine"; nameFr = "Lacaune"; nameEn = "Lacaune"; nameAr = "Lacaune"; description = "Race laitiere" }
    @{ code = "merinos"; speciesId = "ovine"; nameFr = "Merinos"; nameEn = "Merino"; nameAr = "Merino"; description = "Race a laine" }
)

foreach ($breed in $breeds) {
    # Envoyer un ID temporaire pour passer la validation
    $tempBreedId = [guid]::NewGuid().ToString()
    $breed.id = $tempBreedId

    $breedResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/breeds" -Body $breed `
        -Description "Race: $($breed.nameFr)"

    # Capturer l'ID généré par le serveur
    $breedId = Get-IdFromResponse $breedResponse
    if ($breedId) {
        $breedIds += $breedId
    }
}

Write-Host "    -> $($breedIds.Count) races creees" -ForegroundColor Green
Start-Sleep -Seconds 1

# =============================================================================
# 9. FARM (1 ferme principale)
# =============================================================================
Write-Host ""
Write-Host "9. Farm (1 ferme)" -ForegroundColor Cyan

$farmId = "550e8400-e29b-41d4-a716-446655440000"
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

# =============================================================================
# 10. VETERINARIANS (5 veterinaires)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "10. Veterinarians (5 veterinaires)" -ForegroundColor Cyan

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

# TO BE CONTINUED...
# Le script continue avec les tables de liaison, puis la génération des 100 animaux
# et leurs données transactionnelles

Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  SCRIPT EN COURS DE CREATION..." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Partie 1 terminee: Tables de reference" -ForegroundColor Green
Write-Host "A venir:" -ForegroundColor Cyan
Write-Host "  - Tables de liaison (breed/product/vaccine countries)" -ForegroundColor White
Write-Host "  - Preferences de la ferme" -ForegroundColor White
Write-Host "  - 100 animaux (bovins/ovins)" -ForegroundColor White
Write-Host "  - Vaccinations, traitements, pesees, reproductions" -ForegroundColor White
Write-Host "  - Lots, mouvements, documents" -ForegroundColor White
Write-Host ""
