# =============================================================================
# Script Delta - Ajout de Traitements
# Ajoute des traitements aux animaux existants
# =============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = "test-token",
    [string]$FarmId = "550e8400-e29b-41d4-a716-446655440000"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DELTA: TRAITEMENTS - AniTra Backend API" -ForegroundColor Cyan
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

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description,
        [switch]$Silent
    )

    $uri = "$BaseUrl$Endpoint"

    if ($Description -and -not $Silent) {
        Write-Host "  [DELTA] $Description..." -ForegroundColor Yellow -NoNewline
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
        Start-Sleep -Milliseconds 100
        return $response
    } catch {
        if (-not $Silent) {
            Write-Host " ERROR" -ForegroundColor Red
            Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
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
# 1. RECUPERER LES DONNEES EXISTANTES
# =============================================================================
Write-Host "1. Recuperation des donnees existantes..." -ForegroundColor Cyan

# Recuperer les animaux
Write-Host "  Chargement des animaux..." -ForegroundColor Gray
$animalsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/animals" -Silent
$animals = @()
if ($animalsResponse.data) {
    $animals = $animalsResponse.data
} elseif ($animalsResponse -is [array]) {
    $animals = $animalsResponse
}
Write-Host "    -> $($animals.Count) animaux trouves" -ForegroundColor Green

# Recuperer les produits medicaux de la ferme (local scope)
Write-Host "  Chargement des produits medicaux..." -ForegroundColor Gray
$productsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/medical-products" -Silent
$products = @()
if ($productsResponse.data) {
    $products = $productsResponse.data
} elseif ($productsResponse -is [array]) {
    $products = $productsResponse
}
Write-Host "    -> $($products.Count) produits trouves" -ForegroundColor Green

# Recuperer les veterinaires
Write-Host "  Chargement des veterinaires..." -ForegroundColor Gray
$vetsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarians" -Silent
$vets = @()
if ($vetsResponse.data) {
    $vets = $vetsResponse.data
} elseif ($vetsResponse -is [array]) {
    $vets = $vetsResponse
}
Write-Host "    -> $($vets.Count) veterinaires trouves" -ForegroundColor Green

# Verifier qu'on a les donnees necessaires
if ($animals.Count -eq 0) {
    Write-Host ""
    Write-Host "ERREUR: Aucun animal trouve. Executez d'abord seed-database-100-animals-fr.ps1" -ForegroundColor Red
    exit 1
}

if ($products.Count -eq 0) {
    Write-Host ""
    Write-Host "ATTENTION: Aucun produit medical trouve. Les traitements seront crees sans productId." -ForegroundColor Yellow
}

# =============================================================================
# 2. CREER LES TRAITEMENTS (~200-300 traitements)
# =============================================================================
Write-Host ""
Write-Host "2. Creation des traitements (~200-300)..." -ForegroundColor Cyan

$treatmentCount = 0
$startDate = Get-Date "2023-01-01"
$endDate = Get-Date "2025-11-24"

# Diagnostics possibles
$diagnostics = @(
    "Infection respiratoire",
    "Parasitose interne",
    "Parasitose externe",
    "Boiterie",
    "Mammite",
    "Diarrhee",
    "Fievre",
    "Plaie cutanee",
    "Trouble reproductif",
    "Carence minerale",
    "Metrite",
    "Retention placentaire"
)

# Noms de produits (pour productName si pas de productId)
$productNames = @(
    "Ivomec 1%",
    "Clamoxyl LA",
    "Finadyne",
    "Panacur",
    "Calcium Injectable",
    "Vitamine AD3E",
    "Oxytetracycline LA",
    "Metacam",
    "Betadine",
    "Spray cicatrisant",
    "Oxytocine",
    "Prostaglandine"
)

# Statuts possibles
$statuses = @("completed", "completed", "completed", "in_progress", "planned")

# 2-3 traitements par animal
foreach ($animal in $animals) {
    $animalId = $animal.id
    if (-not $animalId) { continue }

    $numTreatments = Get-Random -Minimum 2 -Maximum 4

    for ($i = 0; $i -lt $numTreatments; $i++) {
        $treatmentDate = Get-RandomDate -Start $startDate -End $endDate
        $withdrawalDays = Get-Random -Minimum 0 -Maximum 60
        $withdrawalEndDate = (Get-Date $treatmentDate).AddDays($withdrawalDays).ToString("yyyy-MM-ddT00:00:00.000Z")

        $treatment = @{
            animalId = $animalId
            treatmentDate = $treatmentDate
            dose = [Math]::Round((Get-Random -Minimum 10 -Maximum 100) / 10.0, 1)
            dosage = [Math]::Round((Get-Random -Minimum 10 -Maximum 100) / 10.0, 1)
            dosageUnit = @("ml", "mg", "g", "comprime") | Get-Random
            duration = Get-Random -Minimum 1 -Maximum 7
            status = $statuses | Get-Random
            withdrawalEndDate = $withdrawalEndDate
            diagnosis = $diagnostics | Get-Random
            cost = [Math]::Round((Get-Random -Minimum 1500 -Maximum 8000) / 100.0, 2)
            notes = "Traitement therapeutique - Delta script"
            productName = $productNames | Get-Random
        }

        # Ajouter un produit si disponible
        if ($products.Count -gt 0) {
            $selectedProduct = $products | Get-Random
            $treatment.productId = $selectedProduct.id
            $treatment.productName = $selectedProduct.nameFr
        }

        # Ajouter un veterinaire si disponible
        if ($vets.Count -gt 0) {
            $selectedVet = $vets | Get-Random
            $treatment.veterinarianId = $selectedVet.id
            $treatment.veterinarianName = "$($selectedVet.firstName) $($selectedVet.lastName)"
        }

        $response = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/treatments" -Body $treatment -Silent
        if ($response) {
            $treatmentCount++
        }

        # Afficher progression tous les 50
        if ($treatmentCount % 50 -eq 0 -and $treatmentCount -gt 0) {
            Write-Host "    -> Traitements: $treatmentCount crees..." -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "    -> TOTAL: $treatmentCount traitements crees" -ForegroundColor Green

# =============================================================================
# RESUME FINAL
# =============================================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  DELTA TRAITEMENTS - TERMINE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resume:" -ForegroundColor Cyan
Write-Host "  - $treatmentCount traitements crees" -ForegroundColor White
Write-Host "  - Periode: 2023-2025" -ForegroundColor White
Write-Host "  - Diagnostics varies (respiratoire, parasites, boiterie, etc.)" -ForegroundColor White
Write-Host ""
