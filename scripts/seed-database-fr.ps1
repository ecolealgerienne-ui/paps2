# =============================================================================
# Script de Seed - Donnees de test pour la France
# Inclut: donnees de reference + donnees transactionnelles (1 entite par table)
# 24 tables: 8 ref + 12 transactionnelles + 4 config
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

# Le DTO exige un ID (validation) mais le service l'ignore et génère le sien
# On envoie un ID temporaire pour passer la validation
$tempBreedId = [guid]::NewGuid().ToString()
$breed = @{
    id = $tempBreedId
    code = "prim-holstein"
    speciesId = "bovine"
    nameFr = "Prim'Holstein"
    nameEn = "Holstein"
    nameAr = "Holstein"
}

$breedResponse = Invoke-CurlApi -Method POST -Endpoint "/api/v1/breeds" -Body $breed `
    -Description "Race: $($breed.nameFr)"

# Capturer l'ID généré par le serveur (structure imbriquée: data.data.id)
$breedId = $null
if ($breedResponse) {
    if ($breedResponse.id) {
        $breedId = $breedResponse.id
    } elseif ($breedResponse.data -and $breedResponse.data.data -and $breedResponse.data.data.id) {
        $breedId = $breedResponse.data.data.id
    } elseif ($breedResponse.data -and $breedResponse.data.id) {
        $breedId = $breedResponse.data.id
    }

    if ($breedId) {
        Write-Host "    Breed ID from server: $breedId" -ForegroundColor Green
    } else {
        Write-Host "    ERROR: Breed created but ID not found in response!" -ForegroundColor Red
        Write-Host "    Response: $($breedResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
} else {
    Write-Host "    ERROR: Breed creation failed - no response!" -ForegroundColor Red
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

    # Attendre 1 seconde pour s'assurer que le breed est bien committé en DB
    Write-Host "    Waiting 1 second before creating animal..." -ForegroundColor Gray
    Start-Sleep -Seconds 1

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
# 13. MEDICAL PRODUCTS (Produits de la ferme)
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "13. Medical Products (Produits medicaux de la ferme)" -ForegroundColor Cyan

    $medicalProduct = @{
        name = "Ivomec 1% Local"
        commercialName = "Ivomec Injectable"
        category = "antiparasitic"
        activeIngredient = "Ivermectine"
        manufacturer = "Boehringer Ingelheim"
        withdrawalPeriodMeat = 28
        withdrawalPeriodMilk = 0
        currentStock = 10
        minStock = 5
        stockUnit = "flacon"
        unitPrice = 25.50
        batchNumber = "BATCH2025-001"
        expiryDate = "2026-12-31T23:59:59.999Z"
        type = "treatment"
        targetSpecies = "bovine"
        isActive = $true
    }

    $medicalProductResponse = Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/medical-products" -Body $medicalProduct `
        -Description "Produit medical: $($medicalProduct.name)"

    if ($medicalProductResponse -and $medicalProductResponse.id) {
        $medicalProductId = $medicalProductResponse.id
        Write-Host "    Medical Product ID: $medicalProductId" -ForegroundColor Green
    }
}

# =============================================================================
# 14. VACCINATIONS
# =============================================================================
if ($farmResponse -and $animalResponse) {
    Write-Host ""
    Write-Host "14. Vaccinations" -ForegroundColor Cyan

    $vaccination = @{
        animalId = $animalId
        vaccineName = "Vaccin Enterotoxemie"
        type = "obligatoire"
        disease = "enterotoxemia"
        vaccinationDate = "2025-01-15T10:00:00.000Z"
        nextDueDate = "2026-01-15T10:00:00.000Z"
        dose = "2ml"
        administrationRoute = "IM"
        withdrawalPeriodDays = 21
        batchNumber = "VAC2025-001"
        expiryDate = "2026-12-31T23:59:59.999Z"
        cost = 15.0
        notes = "Vaccination de routine"
    }

    if ($vetIds -and $vetIds.Count -gt 0) {
        $vaccination.veterinarianId = $vetIds[0]
        $vaccination.veterinarianName = "Dr. Martin"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/vaccinations" -Body $vaccination `
        -Description "Vaccination: $($vaccination.disease)"
}

# =============================================================================
# 15. TREATMENTS
# =============================================================================
if ($farmResponse -and $animalResponse -and $medicalProductId) {
    Write-Host ""
    Write-Host "15. Treatments (Traitements)" -ForegroundColor Cyan

    $treatment = @{
        animalId = $animalId
        productId = $medicalProductId
        productName = "Ivomec 1% Local"
        treatmentDate = "2025-01-10T09:00:00.000Z"
        dose = 5.0
        dosage = 5.0
        dosageUnit = "ml"
        duration = 1
        status = "completed"
        withdrawalEndDate = "2025-02-07T00:00:00.000Z"
        diagnosis = "Parasitose"
        cost = 25.50
        notes = "Traitement antiparasitaire preventif"
    }

    if ($vetIds -and $vetIds.Count -gt 0) {
        $treatment.veterinarianId = $vetIds[0]
        $treatment.veterinarianName = "Dr. Martin"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/treatments" -Body $treatment `
        -Description "Traitement: $($treatment.diagnosis)"
}

# =============================================================================
# 16. MOVEMENTS
# =============================================================================
if ($farmResponse -and $animalResponse) {
    Write-Host ""
    Write-Host "16. Movements (Mouvements)" -ForegroundColor Cyan

    $movement = @{
        movementType = "entry"
        movementDate = "2023-06-15T08:00:00.000Z"
        animalIds = @($animalId)
        reason = "Naissance a la ferme"
        notes = "Animal ne sur place"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/movements" -Body $movement `
        -Description "Mouvement: $($movement.movementType)"
}

# =============================================================================
# 17. WEIGHTS
# =============================================================================
if ($farmResponse -and $animalResponse) {
    Write-Host ""
    Write-Host "17. Weights (Pesees)" -ForegroundColor Cyan

    $weight = @{
        animalId = $animalId
        weight = 350.5
        weightDate = "2025-01-20T10:00:00.000Z"
        source = "manual"
        notes = "Pesee de routine"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/weights" -Body $weight `
        -Description "Pesee: $($weight.weight) kg"
}

# =============================================================================
# 18. BREEDINGS
# =============================================================================
if ($farmResponse -and $animalResponse) {
    Write-Host ""
    Write-Host "18. Breedings (Reproductions)" -ForegroundColor Cyan

    $breeding = @{
        motherId = $animalId
        fatherName = "Taureau Limousin"
        method = "artificial_insemination"
        breedingDate = "2024-10-01T09:00:00.000Z"
        expectedBirthDate = "2025-07-10T00:00:00.000Z"
        expectedOffspringCount = 1
        status = "planned"
        notes = "IA avec semence de taureau Limousin"
    }

    if ($vetIds -and $vetIds.Count -gt 0) {
        $breeding.veterinarianId = $vetIds[0]
        $breeding.veterinarianName = "Dr. Martin"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/breedings" -Body $breeding `
        -Description "Reproduction: IA"
}

# =============================================================================
# 19. PERSONAL CAMPAIGNS
# =============================================================================
if ($farmResponse -and $animalResponse -and $medicalProductId) {
    Write-Host ""
    Write-Host "19. Personal Campaigns (Campagnes personnelles)" -ForegroundColor Cyan

    $personalCampaign = @{
        name = "Campagne Depar" + "asitage Hiver 2025"
        description = "Traitement antiparasitaire de tous les bovins"
        productId = $medicalProductId
        productName = "Ivomec 1% Local"
        type = "deworming"
        campaignDate = "2025-02-01T00:00:00.000Z"
        withdrawalEndDate = "2025-03-01T00:00:00.000Z"
        animalIdsJson = "[$($animalId | ConvertTo-Json)]"
        targetCount = 1
        status = "planned"
        notes = "Traitement contre les parasites internes et externes"
    }

    if ($vetIds -and $vetIds.Count -gt 0) {
        $personalCampaign.veterinarianId = $vetIds[0]
        $personalCampaign.veterinarianName = "Dr. Martin"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/personal-campaigns" -Body $personalCampaign `
        -Description "Campagne: $($personalCampaign.name)"
}

# =============================================================================
# 20. DOCUMENTS
# =============================================================================
if ($farmResponse -and $animalResponse) {
    Write-Host ""
    Write-Host "20. Documents" -ForegroundColor Cyan

    $document = @{
        animalId = $animalId
        type = "health_certificate"
        title = "Certificat sanitaire"
        fileName = "certificat-sanitaire-belle-001.pdf"
        fileUrl = "https://example.com/documents/certificat-sanitaire-belle-001.pdf"
        fileSizeBytes = 102400
        mimeType = "application/pdf"
        uploadDate = "2025-01-15T14:30:00.000Z"
        documentNumber = "CERT-FR-2025-001"
        issueDate = "2025-01-15T00:00:00.000Z"
        expiryDate = "2026-01-15T00:00:00.000Z"
        notes = "Certificat sanitaire valide pour mouvements"
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/documents" -Body $document `
        -Description "Document: $($document.title)"
}

# =============================================================================
# 21. ALERT CONFIGURATIONS
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "21. Alert Configurations (Configuration des alertes)" -ForegroundColor Cyan

    $alertConfig = @{
        enableEmailAlerts = $true
        enableSmsAlerts = $false
        enablePushAlerts = $true
        vaccinationReminderDays = 7
        treatmentReminderDays = 3
        healthCheckReminderDays = 30
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/alert-configuration" -Body $alertConfig `
        -Description "Configuration des alertes"
}

# =============================================================================
# 22. FARM PREFERENCES
# =============================================================================
if ($farmResponse) {
    Write-Host ""
    Write-Host "22. Farm Preferences (Preferences de la ferme)" -ForegroundColor Cyan

    $farmPreferences = @{
        weightUnit = "kg"
        currency = "EUR"
        language = "fr"
        dateFormat = "DD/MM/YYYY"
        enableNotifications = $true
    }

    if ($vetIds -and $vetIds.Count -gt 0) {
        $farmPreferences.defaultVeterinarianId = $vetIds[0]
    }
    if ($breedId) {
        $farmPreferences.defaultBreedId = $breedId
    }
    $farmPreferences.defaultSpeciesId = "bovine"

    Invoke-CurlApi -Method PUT -Endpoint "/farms/$farmId/preferences" -Body $farmPreferences `
        -Description "Preferences: langue=$($farmPreferences.language), unite=$($farmPreferences.weightUnit)"
}

# =============================================================================
# 23. FARM PRODUCT PREFERENCES
# =============================================================================
if ($farmResponse -and $medicalProductId) {
    Write-Host ""
    Write-Host "23. Farm Product Preferences (Produits preferes)" -ForegroundColor Cyan

    $productPreference = @{
        customProductId = $medicalProductId
        displayOrder = 1
        isActive = $true
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/product-preferences" -Body $productPreference `
        -Description "Produit prefere: Ivomec 1% Local"
}

# =============================================================================
# 24. FARM VETERINARIAN PREFERENCES
# =============================================================================
if ($farmResponse -and $vetIds -and $vetIds.Count -gt 0) {
    Write-Host ""
    Write-Host "24. Farm Veterinarian Preferences (Veterinaires preferes)" -ForegroundColor Cyan

    $vetPreference = @{
        veterinarianId = $vetIds[0]
        displayOrder = 1
        isActive = $true
    }

    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarian-preferences" -Body $vetPreference `
        -Description "Veterinaire prefere: Dr. Martin"
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
Write-Host ""
Write-Host "  Tables de reference:" -ForegroundColor Yellow
Write-Host "    - Country: 1" -ForegroundColor White
Write-Host "    - Administration Route: 1" -ForegroundColor White
Write-Host "    - Global Medical Product: 1" -ForegroundColor White
Write-Host "    - Global Vaccine: 1" -ForegroundColor White
Write-Host "    - National Campaign: 1" -ForegroundColor White
Write-Host "    - Alert Template: 1" -ForegroundColor White
Write-Host "    - Species: 1" -ForegroundColor White
Write-Host "    - Breed: 1" -ForegroundColor White
Write-Host ""
Write-Host "  Tables transactionnelles:" -ForegroundColor Yellow
Write-Host "    - Farm: 1" -ForegroundColor White
Write-Host "    - Veterinarian: 1" -ForegroundColor White
Write-Host "    - Lot: 1" -ForegroundColor White
Write-Host "    - Animal: 1" -ForegroundColor White
Write-Host "    - Medical Product (farm): 1" -ForegroundColor White
Write-Host "    - Vaccination: 1" -ForegroundColor White
Write-Host "    - Treatment: 1" -ForegroundColor White
Write-Host "    - Movement: 1" -ForegroundColor White
Write-Host "    - Weight: 1" -ForegroundColor White
Write-Host "    - Breeding: 1" -ForegroundColor White
Write-Host "    - Personal Campaign: 1" -ForegroundColor White
Write-Host "    - Document: 1" -ForegroundColor White
Write-Host ""
Write-Host "  Tables de configuration:" -ForegroundColor Yellow
Write-Host "    - Alert Configuration: 1" -ForegroundColor White
Write-Host "    - Farm Preferences: 1" -ForegroundColor White
Write-Host "    - Farm Product Preference: 1" -ForegroundColor White
Write-Host "    - Farm Veterinarian Preference: 1" -ForegroundColor White
Write-Host ""
Write-Host "  TOTAL: 24 tables creees avec succes!" -ForegroundColor Green
Write-Host ""
