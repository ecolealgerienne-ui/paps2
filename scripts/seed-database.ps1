# =============================================================================
<<<<<<< HEAD
# Script de Seed - Remplir la base avec des données de test
=======
# Script de Seed - Remplir la base avec des donnees de test
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SEED DATABASE - AniTra Backend API" -ForegroundColor Cyan
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

        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
            return $response | ConvertFrom-Json -ErrorAction SilentlyContinue
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
<<<<<<< HEAD
    @{ code = "DZ"; nameFr = "Algérie"; nameEn = "Algeria"; nameAr = "الجزائر" }
=======
    @{ code = "DZ"; nameFr = "Algerie"; nameEn = "Algeria"; nameAr = "الجزائر" }
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
    @{ code = "TN"; nameFr = "Tunisie"; nameEn = "Tunisia"; nameAr = "تونس" }
    @{ code = "MA"; nameFr = "Maroc"; nameEn = "Morocco"; nameAr = "المغرب" }
    @{ code = "LY"; nameFr = "Libye"; nameEn = "Libya"; nameAr = "ليبيا" }
    @{ code = "MR"; nameFr = "Mauritanie"; nameEn = "Mauritania"; nameAr = "موريتانيا" }
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
<<<<<<< HEAD
    @{ code = "SC"; nameFr = "Sous-cutanée"; nameEn = "Subcutaneous"; nameAr = "تحت الجلد" }
=======
    @{ code = "SC"; nameFr = "Sous-cutanee"; nameEn = "Subcutaneous"; nameAr = "تحت الجلد" }
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
    @{ code = "IV"; nameFr = "Intraveineuse"; nameEn = "Intravenous"; nameAr = "وريدي" }
    @{ code = "PO"; nameFr = "Orale"; nameEn = "Oral"; nameAr = "فموي" }
)

foreach ($route in $routes) {
    Invoke-CurlApi -Method POST -Endpoint "/administration-routes" -Body $route `
        -Description "Route: $($route.nameFr)"
}

# =============================================================================
# 3. GLOBAL MEDICAL PRODUCTS
# =============================================================================
Write-Host ""
<<<<<<< HEAD
Write-Host "3. Global Medical Products (Produits médicaux globaux)" -ForegroundColor Cyan
=======
Write-Host "3. Global Medical Products (Produits medicaux globaux)" -ForegroundColor Cyan
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18

$products = @(
    @{
        code = "IVERM-001"
        nameFr = "Ivermectine Injectable"
        nameEn = "Ivermectin Injectable"
<<<<<<< HEAD
        nameAr = "إيفرمكتين قابل للحقن"
=======
        nameAr = "ايفرمكتين"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
        type = "antiparasitic"
        laboratoire = "SAIDAL"
        principeActif = "Ivermectine"
    }
    @{
        code = "PEN-001"
<<<<<<< HEAD
        nameFr = "Pénicilline G"
        nameEn = "Penicillin G"
        nameAr = "بنسلين ج"
        type = "antibiotic"
        laboratoire = "ANTIBIOTICAL"
        principeActif = "Benzylpénicilline"
    }
    @{
        code = "OXY-001"
        nameFr = "Oxytétracycline LA"
        nameEn = "Oxytetracycline LA"
        nameAr = "أوكسي تتراسيكلين"
        type = "antibiotic"
        laboratoire = "VETOQUINOL"
        principeActif = "Oxytétracycline"
=======
        nameFr = "Penicilline G"
        nameEn = "Penicillin G"
        nameAr = "بنسلين"
        type = "antibiotic"
        laboratoire = "ANTIBIOTICAL"
        principeActif = "Benzylpenicilline"
    }
    @{
        code = "OXY-001"
        nameFr = "Oxytetracycline LA"
        nameEn = "Oxytetracycline LA"
        nameAr = "اوكسي تتراسيكلين"
        type = "antibiotic"
        laboratoire = "VETOQUINOL"
        principeActif = "Oxytetracycline"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
    }
)

foreach ($product in $products) {
    Invoke-CurlApi -Method POST -Endpoint "/global-medical-products" -Body $product `
        -Description "Produit: $($product.nameFr)"
}

# =============================================================================
# 4. GLOBAL VACCINES
# =============================================================================
Write-Host ""
Write-Host "4. Global Vaccines (Vaccins globaux)" -ForegroundColor Cyan

$vaccines = @(
    @{
        code = "BRUC-B19"
        nameFr = "Vaccin Brucellose B19"
        nameEn = "Brucellosis B19 Vaccine"
<<<<<<< HEAD
        nameAr = "لقاح البروسيلا B19"
        targetDisease = "brucellosis"
        laboratoire = "INMV Algérie"
    }
    @{
        code = "FMD-O"
        nameFr = "Vaccin Fièvre Aphteuse O"
        nameEn = "Foot-and-Mouth Disease O Vaccine"
        nameAr = "لقاح الحمى القلاعية O"
=======
        nameAr = "لقاح البروسيلا"
        targetDisease = "brucellosis"
        laboratoire = "INMV Algerie"
    }
    @{
        code = "FMD-O"
        nameFr = "Vaccin Fievre Aphteuse O"
        nameEn = "Foot-and-Mouth Disease O Vaccine"
        nameAr = "لقاح الحمى القلاعية"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
        targetDisease = "fmd"
        laboratoire = "SAIDAL"
    }
    @{
        code = "ENTERO-CD"
<<<<<<< HEAD
        nameFr = "Vaccin Entérotoxémie"
        nameEn = "Enterotoxemia Vaccine"
        nameAr = "لقاح التسمم المعوي"
        targetDisease = "enterotoxemia"
        laboratoire = "INMV Algérie"
=======
        nameFr = "Vaccin Enterotoxemie"
        nameEn = "Enterotoxemia Vaccine"
        nameAr = "لقاح التسمم المعوي"
        targetDisease = "enterotoxemia"
        laboratoire = "INMV Algerie"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
    }
)

foreach ($vaccine in $vaccines) {
    Invoke-CurlApi -Method POST -Endpoint "/vaccines-global" -Body $vaccine `
        -Description "Vaccin: $($vaccine.nameFr)"
}

# =============================================================================
# 5. NATIONAL CAMPAIGNS
# =============================================================================
Write-Host ""
Write-Host "5. National Campaigns (Campagnes nationales)" -ForegroundColor Cyan

$campaigns = @(
    @{
        code = "bruc-2025"
        nameFr = "Campagne Brucellose 2025"
        nameEn = "Brucellosis Campaign 2025"
        nameAr = "حملة البروسيلا 2025"
        description = "Vaccination nationale contre la brucellose bovine"
        startDate = "2025-01-01T00:00:00.000Z"
        endDate = "2025-12-31T23:59:59.999Z"
        isActive = $true
    }
    @{
        code = "fmd-2025"
<<<<<<< HEAD
        nameFr = "Campagne Fièvre Aphteuse 2025"
        nameEn = "FMD Campaign 2025"
        nameAr = "حملة الحمى القلاعية 2025"
        description = "Vaccination nationale contre la fièvre aphteuse"
=======
        nameFr = "Campagne Fievre Aphteuse 2025"
        nameEn = "FMD Campaign 2025"
        nameAr = "حملة الحمى القلاعية 2025"
        description = "Vaccination nationale contre la fievre aphteuse"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
        startDate = "2025-02-01T00:00:00.000Z"
        endDate = "2025-11-30T23:59:59.999Z"
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
<<<<<<< HEAD
Write-Host "6. Alert Templates (Modèles d'alertes)" -ForegroundColor Cyan
=======
Write-Host "6. Alert Templates (Modeles d'alertes)" -ForegroundColor Cyan
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18

$templates = @(
    @{
        code = "vacc-reminder"
        nameFr = "Rappel de vaccination"
        nameEn = "Vaccination reminder"
        nameAr = "تذكير بالتطعيم"
<<<<<<< HEAD
        descriptionFr = "Rappel automatique pour les vaccinations à venir"
=======
        descriptionFr = "Rappel automatique pour les vaccinations a venir"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
        descriptionEn = "Automatic reminder for upcoming vaccinations"
        descriptionAr = "تذكير تلقائي للتطعيمات القادمة"
        severity = "info"
        isActive = $true
    }
    @{
        code = "disease-alert"
        nameFr = "Alerte maladie"
        nameEn = "Disease alert"
        nameAr = "تنبيه المرض"
<<<<<<< HEAD
        descriptionFr = "Alerte en cas de détection de maladie"
=======
        descriptionFr = "Alerte en cas de detection de maladie"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
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
# 7. FARM (Ferme de test)
# =============================================================================
Write-Host ""
Write-Host "7. Farm (Ferme de test)" -ForegroundColor Cyan

$farmId = "550e8400-e29b-41d4-a716-446655440000"
$farm = @{
    id = $farmId
    name = "Ferme de Test API"
    ownerName = "Ahmed Benali"
    wilaya = "Alger"
    commune = "Bab Ezzouar"
<<<<<<< HEAD
    address = "Cité 123, Bab Ezzouar"
=======
    address = "Cite 123, Bab Ezzouar"
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
    phone = "0550123456"
    isDefault = $true
}

Invoke-CurlApi -Method POST -Endpoint "/api/farms" -Body $farm `
    -Description "Ferme: $($farm.name)"

# =============================================================================
# 8. VETERINARIANS
# =============================================================================
Write-Host ""
<<<<<<< HEAD
Write-Host "8. Veterinarians (Vétérinaires)" -ForegroundColor Cyan
=======
Write-Host "8. Veterinarians (Veterinaires)" -ForegroundColor Cyan
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18

$vets = @(
    @{
        firstName = "Mohammed"
        lastName = "Benmohamed"
        title = "Dr."
        phone = "0551234567"
        email = "m.benmohamed@vet.dz"
        licenseNumber = "VET-DZ-001234"
        specialties = "Bovins, Ovins"
    }
    @{
        firstName = "Fatima"
        lastName = "Benali"
        title = "Dr."
        phone = "0552345678"
        email = "f.benali@vet.dz"
        licenseNumber = "VET-DZ-005678"
        specialties = "Bovins"
    }
)

foreach ($vet in $vets) {
    Invoke-CurlApi -Method POST -Endpoint "/farms/$farmId/veterinarians" -Body $vet `
<<<<<<< HEAD
        -Description "Vétérinaire: Dr. $($vet.lastName)"
}

# =============================================================================
# RÉSUMÉ
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED TERMINÉ" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Données créées:" -ForegroundColor Cyan
=======
        -Description "Veterinaire: Dr. $($vet.lastName)"
}

# =============================================================================
# RESUME
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SEED TERMINE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Donnees creees:" -ForegroundColor Cyan
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
Write-Host "  - Countries: 5 pays" -ForegroundColor White
Write-Host "  - Administration Routes: 4 voies" -ForegroundColor White
Write-Host "  - Global Medical Products: 3 produits" -ForegroundColor White
Write-Host "  - Global Vaccines: 3 vaccins" -ForegroundColor White
Write-Host "  - National Campaigns: 2 campagnes" -ForegroundColor White
<<<<<<< HEAD
Write-Host "  - Alert Templates: 2 modèles" -ForegroundColor White
Write-Host "  - Farm: 1 ferme de test" -ForegroundColor White
Write-Host "  - Veterinarians: 2 vétérinaires" -ForegroundColor White
Write-Host ""
Write-Host "Note: Les duplicates sont ignorés (SKIP)" -ForegroundColor Gray
=======
Write-Host "  - Alert Templates: 2 modeles" -ForegroundColor White
Write-Host "  - Farm: 1 ferme de test" -ForegroundColor White
Write-Host "  - Veterinarians: 2 veterinaires" -ForegroundColor White
Write-Host ""
Write-Host "Note: Les duplicates sont ignores (SKIP)" -ForegroundColor Gray
>>>>>>> 7af39b71d56c76fd4b136ba3377b1701fe534c18
Write-Host ""
