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

# Helper pour appeler l'API avec curl
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

    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10 -Compress
            $response = curl.exe -s -X $Method $uri `
                -H "Content-Type: application/json" `
                -H "Authorization: Bearer $Token" `
                -d $jsonBody
        } else {
            $response = curl.exe -s -X $Method $uri `
                -H "Content-Type: application/json" `
                -H "Authorization: Bearer $Token"
        }

        if ($LASTEXITCODE -eq 0 -and $response) {
            Write-Host " OK" -ForegroundColor Green
            $result = $response | ConvertFrom-Json -ErrorAction SilentlyContinue
            return $result
        } else {
            Write-Host " SKIP" -ForegroundColor Gray
            return $null
        }
    } catch {
        Write-Host " SKIP" -ForegroundColor Gray
        return $null
    }
}

# =============================================================================
# 1. COUNTRIES
# =============================================================================
Write-Host ""
Write-Host "1. Countries (Pays)" -ForegroundColor Cyan

$countries = @(
    @{ code = "FR"; nameFr = "France"; nameEn = "France"; nameAr = "فرنسا" }
    @{ code = "ES"; nameFr = "Espagne"; nameEn = "Spain"; nameAr = "إسبانيا" }
    @{ code = "IT"; nameFr = "Italie"; nameEn = "Italy"; nameAr = "إيطاليا" }
    @{ code = "DE"; nameFr = "Allemagne"; nameEn = "Germany"; nameAr = "ألمانيا" }
    @{ code = "BE"; nameFr = "Belgique"; nameEn = "Belgium"; nameAr = "بلجيكا" }
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
# 3. GLOBAL MEDICAL PRODUCTS (Produits francais)
# =============================================================================
Write-Host ""
Write-Host "3. Global Medical Products (Produits medicaux)" -ForegroundColor Cyan

$products = @(
    @{
        code = "IVERM-FR-001"
        nameFr = "Ivomec 1%"
        nameEn = "Ivomec 1%"
        nameAr = "ايفومك"
        type = "antiparasitic"
        laboratoire = "Boehringer Ingelheim"
        principeActif = "Ivermectine"
    }
    @{
        code = "PENI-FR-001"
        nameFr = "Pen & Strep"
        nameEn = "Pen & Strep"
        nameAr = "بن ستريب"
        type = "antibiotic"
        laboratoire = "Virbac"
        principeActif = "Penicilline + Streptomycine"
    }
    @{
        code = "ALAMYCINE-001"
        nameFr = "Alamycine LA"
        nameEn = "Alamycin LA"
        nameAr = "الامايسين"
        type = "antibiotic"
        laboratoire = "Norbrook"
        principeActif = "Oxytetracycline"
    }
    @{
        code = "METACAM-001"
        nameFr = "Metacam 20mg/ml"
        nameEn = "Metacam 20mg/ml"
        nameAr = "ميتاكام"
        type = "anti_inflammatory"
        laboratoire = "Boehringer Ingelheim"
        principeActif = "Meloxicam"
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
        code = "BVD-FR-001"
        nameFr = "Bovilis BVD"
        nameEn = "Bovilis BVD"
        nameAr = "بوفيليس"
        targetDisease = "bvd"
        laboratoire = "MSD Sante Animale"
    }
    @{
        code = "IBR-FR-001"
        nameFr = "Rispoval IBR Marker"
        nameEn = "Rispoval IBR Marker"
        nameAr = "ريسبوفال"
        targetDisease = "ibr"
        laboratoire = "Zoetis"
    }
    @{
        code = "ROTAVIRUS-001"
        nameFr = "Rotavec Corona"
        nameEn = "Rotavec Corona"
        nameAr = "روتافيك"
        targetDisease = "rotavirus"
        laboratoire = "MSD Sante Animale"
    }
    @{
        code = "CLOSTRI-001"
        nameFr = "Covexin 10"
        nameEn = "Covexin 10"
        nameAr = "كوفيكسين"
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
        code = "bvd-fr-2025"
        nameFr = "Campagne BVD France 2025"
        nameEn = "BVD Campaign France 2025"
        nameAr = "حملة BVD فرنسا 2025"
        description = "Vaccination obligatoire contre la BVD bovine"
        startDate = "2025-01-01T00:00:00.000Z"
        endDate = "2025-12-31T23:59:59.999Z"
        isActive = $true
    }
    @{
        code = "ibr-fr-2025"
        nameFr = "Campagne IBR France 2025"
        nameEn = "IBR Campaign France 2025"
        nameAr = "حملة IBR فرنسا 2025"
        description = "Programme d'eradication IBR"
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
        nameEn = "Vaccination reminder"
        nameAr = "تذكير بالتطعيم"
        descriptionFr = "Rappel automatique pour les vaccinations a venir"
        descriptionEn = "Automatic reminder for upcoming vaccinations"
        descriptionAr = "تذكير تلقائي للتطعيمات القادمة"
        severity = "info"
        isActive = $true
    }
    @{
        code = "treatment-reminder"
        nameFr = "Rappel de traitement"
        nameEn = "Treatment reminder"
        nameAr = "تذكير بالعلاج"
        descriptionFr = "Rappel pour les traitements en cours"
        descriptionEn = "Reminder for ongoing treatments"
        descriptionAr = "تذكير للعلاجات الجارية"
        severity = "info"
        isActive = $true
    }
    @{
        code = "disease-alert"
        nameFr = "Alerte maladie"
        nameEn = "Disease alert"
        nameAr = "تنبيه المرض"
        descriptionFr = "Alerte en cas de detection de maladie"
        descriptionEn = "Alert when disease is detected"
        descriptionAr = "تنبيه عند اكتشاف المرض"
        severity = "high"
        isActive = $true
    }
)

foreach ($template in $templates) {
    Invoke-CurlApi -Method POST -Endpoint "/alert-templates" -Body $template `
        -Description "Alerte: $($template.nameFr)"
}

# =============================================================================
# 7. FARM (Ferme francaise)
# =============================================================================
Write-Host ""
Write-Host "7. Farm (Ferme)" -ForegroundColor Cyan

$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farm = @{
    id = $farmId
    name = "EARL du Plateau"
    ownerName = "Jean Dupont"
    wilaya = "Auvergne-Rhone-Alpes"
    commune = "Clermont-Ferrand"
    address = "15 Route de la Montagne, 63000 Clermont-Ferrand"
    phone = "0473123456"
    isDefault = $true
}

Invoke-CurlApi -Method POST -Endpoint "/api/farms" -Body $farm `
    -Description "Ferme: $($farm.name)"

# =============================================================================
# 8. VETERINARIANS
# =============================================================================
Write-Host ""
Write-Host "8. Veterinarians (Veterinaires)" -ForegroundColor Cyan

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
    @{
        firstName = "Pierre"
        lastName = "Dubois"
        title = "Dr."
        phone = "0623456789"
        email = "p.dubois@vet-auvergne.fr"
        licenseNumber = "VET-FR-234567"
        specialties = "Bovins viande, Ovins"
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

# =============================================================================
# 9. LOTS (Batches/Groups)
# =============================================================================
Write-Host ""
Write-Host "9. Lots (Batches)" -ForegroundColor Cyan

$lots = @(
    @{
        name = "Lot Printemps 2024"
        description = "Veaux nes au printemps 2024"
        lotType = "birth_cohort"
        createdDate = "2024-03-01T00:00:00.000Z"
        isActive = $true
    }
    @{
        name = "Lot Automne 2024"
        description = "Veaux nes a l'automne 2024"
        lotType = "birth_cohort"
        createdDate = "2024-09-01T00:00:00.000Z"
        isActive = $true
    }
    @{
        name = "Genisses 18 mois"
        description = "Genisses de 18 mois pour insemination"
        lotType = "production"
        createdDate = "2024-01-15T00:00:00.000Z"
        isActive = $true
    }
    @{
        name = "Vaches laitieres"
        description = "Vaches en production laitiere"
        lotType = "production"
        createdDate = "2024-01-01T00:00:00.000Z"
        isActive = $true
    }
)

$lotIds = @()
foreach ($lot in $lots) {
    $lotResponse = Invoke-CurlApi -Method POST -Endpoint "/api/lots" -Body $lot `
        -Description "Lot: $($lot.name)"
    if ($lotResponse -and $lotResponse.id) {
        $lotIds += $lotResponse.id
    }
}

# =============================================================================
# 10. ANIMALS (100 animaux)
# =============================================================================
Write-Host ""
Write-Host "10. Animals (100 animaux)" -ForegroundColor Cyan

# Noms francais pour les animaux
$cowNames = @("Belle", "Marguerite", "Rosalie", "Blanche", "Noisette", "Caramel", "Chocolat", "Fauvette", "Praline", "Vanille")
$bullNames = @("Napoleon", "Atlas", "Goliath", "Hercule", "Titan", "Zeus", "Apollo", "Mars", "Jupiter", "Thor")

$animalIds = @()
$birthDate = Get-Date "2023-01-01"

for ($i = 1; $i -le 100; $i++) {
    $isFemale = ($i % 2 -eq 0)
    $sex = if ($isFemale) { "female" } else { "male" }

    # Nom de l'animal
    if ($isFemale) {
        $name = $cowNames[$i % $cowNames.Length] + " $i"
    } else {
        $name = $bullNames[$i % $bullNames.Length] + " $i"
    }

    # Date de naissance aleatoire entre 2023 et 2024
    $randomDays = Get-Random -Minimum 0 -Maximum 700
    $animalBirthDate = $birthDate.AddDays($randomDays)

    # Statut de l'animal (vivant, vendu, mort, abattu)
    $status = "alive"
    if ($i -gt 85) { $status = "sold" }
    elseif ($i -gt 92) { $status = "dead" }
    elseif ($i -gt 96) { $status = "slaughtered" }

    # Identification
    $earTag = "FR-63-$(1000 + $i)"

    # Espece et race (bovins)
    $speciesId = "bovin"
    $breedId = if ($i % 3 -eq 0) { "prim-holstein" } elseif ($i % 3 -eq 1) { "charolaise" } else { "limousine" }

    # Lot
    $lotId = if ($i -le 25) { $lotIds[0] } elseif ($i -le 50) { $lotIds[1] } elseif ($i -le 75) { $lotIds[2] } else { $lotIds[3] }

    $animal = @{
        name = $name
        earTag = $earTag
        electronicId = "250269" + ([string]$i).PadLeft(9, '0')
        birthDate = $animalBirthDate.ToString("yyyy-MM-ddT00:00:00.000Z")
        sex = $sex
        species = $speciesId
        breed = $breedId
        status = $status
        lotId = $lotId
    }

    $animalResponse = Invoke-CurlApi -Method POST -Endpoint "/api/animals" -Body $animal `
        -Description "Animal $i/100: $name ($earTag)"

    if ($animalResponse -and $animalResponse.id) {
        $animalIds += $animalResponse.id
    }

    # Petite pause tous les 20 animaux pour eviter surcharge
    if ($i % 20 -eq 0) {
        Start-Sleep -Milliseconds 500
    }
}

# =============================================================================
# 11. BREEDINGS (Reproductions pour 30 vaches)
# =============================================================================
Write-Host ""
Write-Host "11. Breedings (Reproductions)" -ForegroundColor Cyan

$breedingCount = 0
for ($i = 0; $i -lt [Math]::Min(30, $animalIds.Count); $i += 2) {
    if ($animalIds[$i]) {
        $breedingDate = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 365))

        $breeding = @{
            animalId = $animalIds[$i]
            breedingDate = $breedingDate.ToString("yyyy-MM-ddT00:00:00.000Z")
            method = if ($i % 3 -eq 0) { "artificial_insemination" } else { "natural_breeding" }
            bullId = if ($i % 3 -eq 0) { "BULL-FR-001" } else { $null }
            isSuccessful = $true
            notes = "Reproduction normale"
        }

        Invoke-CurlApi -Method POST -Endpoint "/api/breedings" -Body $breeding `
            -Description "Reproduction $($breedingCount + 1)/15"

        $breedingCount++
        if ($breedingCount -ge 15) { break }
    }
}

# =============================================================================
# 12. VACCINATIONS (2 vaccinations par animal vivant)
# =============================================================================
Write-Host ""
Write-Host "12. Vaccinations (Vaccinations)" -ForegroundColor Cyan

$vaccinationCount = 0
foreach ($animalId in $animalIds) {
    if ($animalId -and $vaccinationCount -lt 150) {
        # Vaccination 1: BVD
        $vaccDate1 = (Get-Date).AddDays(-(Get-Random -Minimum 60 -Maximum 180))
        $vacc1 = @{
            animalId = $animalId
            vaccineId = "BVD-FR-001"
            administrationDate = $vaccDate1.ToString("yyyy-MM-ddT00:00:00.000Z")
            administrationRoute = "IM"
            dose = "2ml"
            batchNumber = "BVD2024-" + (Get-Random -Minimum 1000 -Maximum 9999)
            expiryDate = "2026-12-31T00:00:00.000Z"
            veterinarianId = if ($vetIds.Count -gt 0) { $vetIds[0] } else { $null }
            notes = "Vaccination BVD"
        }

        Invoke-CurlApi -Method POST -Endpoint "/api/vaccinations" -Body $vacc1 `
            -Description "Vaccination $($vaccinationCount + 1): BVD" | Out-Null

        $vaccinationCount++

        # Vaccination 2: IBR
        if ($vaccinationCount -lt 150) {
            $vaccDate2 = (Get-Date).AddDays(-(Get-Random -Minimum 30 -Maximum 150))
            $vacc2 = @{
                animalId = $animalId
                vaccineId = "IBR-FR-001"
                administrationDate = $vaccDate2.ToString("yyyy-MM-ddT00:00:00.000Z")
                administrationRoute = "IM"
                dose = "2ml"
                batchNumber = "IBR2024-" + (Get-Random -Minimum 1000 -Maximum 9999)
                expiryDate = "2026-12-31T00:00:00.000Z"
                veterinarianId = if ($vetIds.Count -gt 1) { $vetIds[1] } else { $vetIds[0] }
                notes = "Vaccination IBR"
            }

            Invoke-CurlApi -Method POST -Endpoint "/api/vaccinations" -Body $vacc2 `
                -Description "Vaccination $($vaccinationCount + 1): IBR" | Out-Null

            $vaccinationCount++
        }
    }

    if ($vaccinationCount % 20 -eq 0) {
        Write-Host "  [INFO] $vaccinationCount vaccinations creees..." -ForegroundColor Cyan
    }
}

# =============================================================================
# 13. MEDICAL TREATMENTS (Traitements pour 40 animaux)
# =============================================================================
Write-Host ""
Write-Host "13. Medical Treatments (Traitements)" -ForegroundColor Cyan

$treatmentCount = 0
for ($i = 0; $i -lt [Math]::Min(40, $animalIds.Count); $i++) {
    if ($animalIds[$i]) {
        $treatmentDate = (Get-Date).AddDays(-(Get-Random -Minimum 10 -Maximum 90))

        # Traitements varies
        $treatments = @(
            @{ productId = "IVERM-FR-001"; reason = "Traitement antiparasitaire"; dose = "1ml/50kg" }
            @{ productId = "PENI-FR-001"; reason = "Infection respiratoire"; dose = "5ml" }
            @{ productId = "ALAMYCINE-001"; reason = "Traitement preventif"; dose = "10ml" }
            @{ productId = "METACAM-001"; reason = "Anti-inflammatoire post-velage"; dose = "15ml" }
        )

        $selectedTreatment = $treatments[$i % $treatments.Length]

        $treatment = @{
            animalId = $animalIds[$i]
            medicalProductId = $selectedTreatment.productId
            administrationDate = $treatmentDate.ToString("yyyy-MM-ddT00:00:00.000Z")
            administrationRoute = "IM"
            dose = $selectedTreatment.dose
            duration = 3
            withdrawalPeriodMeat = 28
            withdrawalPeriodMilk = 5
            reason = $selectedTreatment.reason
            veterinarianId = if ($vetIds.Count -gt 0) { $vetIds[$i % $vetIds.Count] } else { $null }
            notes = "Traitement administre sans complications"
        }

        Invoke-CurlApi -Method POST -Endpoint "/api/medical-treatments" -Body $treatment `
            -Description "Traitement $($treatmentCount + 1)/40: $($selectedTreatment.reason)"

        $treatmentCount++
    }
}

# =============================================================================
# RESUME
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Donnees de reference creees:" -ForegroundColor Cyan
Write-Host "  - Countries: 5 pays europeens" -ForegroundColor White
Write-Host "  - Administration Routes: 5 voies" -ForegroundColor White
Write-Host "  - Global Medical Products: 4 produits" -ForegroundColor White
Write-Host "  - Global Vaccines: 4 vaccins" -ForegroundColor White
Write-Host "  - National Campaigns: 2 campagnes France" -ForegroundColor White
Write-Host "  - Alert Templates: 3 modeles" -ForegroundColor White
Write-Host "  - Farm: 1 ferme (EARL du Plateau)" -ForegroundColor White
Write-Host "  - Veterinarians: 2 veterinaires" -ForegroundColor White
Write-Host ""
Write-Host "Donnees transactionnelles creees:" -ForegroundColor Cyan
Write-Host "  - Lots: 4 lots" -ForegroundColor White
Write-Host "  - Animals: 100 animaux (85 vivants, 8 vendus, 4 morts, 3 abattus)" -ForegroundColor White
Write-Host "  - Breedings: ~15 reproductions" -ForegroundColor White
Write-Host "  - Vaccinations: ~$vaccinationCount vaccinations" -ForegroundColor White
Write-Host "  - Medical Treatments: ~$treatmentCount traitements" -ForegroundColor White
Write-Host ""
Write-Host "Note: Les duplicates sont ignores (SKIP)" -ForegroundColor Gray
Write-Host ""
