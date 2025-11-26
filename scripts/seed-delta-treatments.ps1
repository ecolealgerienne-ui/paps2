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
        [switch]$Silent,
        [switch]$ShowBodyOnError
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
            # Try to get detailed error from response
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $reader.BaseStream.Position = 0
                $errorBody = $reader.ReadToEnd()
                Write-Host "    Details: $errorBody" -ForegroundColor Red
            } catch {}
        }
        if ($ShowBodyOnError -and $Body) {
            Write-Host "    Body sent: $jsonBody" -ForegroundColor Yellow
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
Write-Host "   FarmId utilise: $FarmId" -ForegroundColor Gray

# Recuperer les animaux
Write-Host "  Chargement des animaux de la ferme $FarmId..." -ForegroundColor Gray
$animalsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/animals?limit=500" -Silent
$animals = @()
if ($animalsResponse) {
    # Structure: response.data.data (nested)
    if ($animalsResponse.data -and $animalsResponse.data.data) {
        $animals = @($animalsResponse.data.data)
    } elseif ($animalsResponse.data -is [array]) {
        $animals = @($animalsResponse.data)
    } elseif ($animalsResponse -is [array]) {
        $animals = @($animalsResponse)
    }
}
$animalCount = if ($animals) { $animals.Count } else { 0 }
Write-Host "    -> $animalCount animaux trouves" -ForegroundColor Green
if ($animalCount -gt 0) {
    $firstAnimal = $animals[0]
    Write-Host "    Debug - Premier animal: id=$($firstAnimal.id), name=$($firstAnimal.name)" -ForegroundColor Gray
}

# Recuperer les produits medicaux (endpoint retourne global + local)
Write-Host "  Chargement des produits medicaux..." -ForegroundColor Gray
$products = @()

$productsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/medical-products?limit=100" -Silent
if ($productsResponse) {
    # Structure: response.data.data (nested) ou response.data (array)
    if ($productsResponse.data -and $productsResponse.data.data) {
        $products = @($productsResponse.data.data)
    } elseif ($productsResponse.data -is [array]) {
        $products = @($productsResponse.data)
    } elseif ($productsResponse -is [array]) {
        $products = @($productsResponse)
    }
}

Write-Host "    -> $($products.Count) produits medicaux trouves" -ForegroundColor Green

# Recuperer les veterinaires
Write-Host "  Chargement des veterinaires..." -ForegroundColor Gray
$vetsResponse = Invoke-Api -Method GET -Endpoint "/farms/$FarmId/veterinarians" -Silent
$vets = @()
if ($vetsResponse) {
    # Structure: response.data.data (nested) ou response.data (array)
    if ($vetsResponse.data -and $vetsResponse.data.data) {
        $vets = @($vetsResponse.data.data)
    } elseif ($vetsResponse.data -is [array]) {
        $vets = @($vetsResponse.data)
    } elseif ($vetsResponse -is [array]) {
        $vets = @($vetsResponse)
    }
}
$vetCount = if ($vets) { $vets.Count } else { 0 }
Write-Host "    -> $vetCount veterinaires trouves" -ForegroundColor Green

# Verifier qu'on a les donnees necessaires
if ($animalCount -eq 0) {
    Write-Host ""
    Write-Host "ERREUR: Aucun animal trouve pour la ferme $FarmId" -ForegroundColor Red
    Write-Host "Executez d'abord: .\scripts\seed-database-100-animals-fr.ps1" -ForegroundColor Red
    exit 1
}

if ($products.Count -eq 0) {
    Write-Host ""
    Write-Host "ERREUR: Aucun produit medical trouve. productId est obligatoire pour les traitements." -ForegroundColor Red
    Write-Host "Executez d'abord seed-database-100-animals-fr.ps1 pour creer les produits globaux." -ForegroundColor Red
    exit 1
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

# Statuts possibles (TreatmentStatus enum: scheduled, in_progress, completed, cancelled)
$statuses = @("completed", "completed", "completed", "in_progress", "scheduled")

# Debug: show first product
if ($products.Count -gt 0) {
    $firstProduct = $products[0]
    Write-Host "    Debug - Premier produit: id=$($firstProduct.id), nameFr=$($firstProduct.nameFr)" -ForegroundColor Gray
}

$attemptCount = 0
$errorCount = 0

# 2-3 traitements par animal
foreach ($animal in $animals) {
    $animalId = $animal.id
    if (-not $animalId) { continue }

    $numTreatments = Get-Random -Minimum 2 -Maximum 4

    for ($i = 0; $i -lt $numTreatments; $i++) {
        $attemptCount++
        $treatmentDate = Get-RandomDate -Start $startDate -End $endDate
        $withdrawalDays = Get-Random -Minimum 0 -Maximum 60
        $withdrawalEndDate = (Get-Date $treatmentDate).AddDays($withdrawalDays).ToString("yyyy-MM-ddT00:00:00.000Z")

        # Selectionner un produit (obligatoire)
        $selectedProduct = $products | Get-Random
        $productNameValue = if ($selectedProduct.nameFr) { $selectedProduct.nameFr } elseif ($selectedProduct.name) { $selectedProduct.name } else { $productNames | Get-Random }
        $productIdValue = $selectedProduct.id

        # Skip si pas de productId valide
        if (-not $productIdValue) {
            Write-Host "    SKIP: Produit sans ID" -ForegroundColor Yellow
            continue
        }

        $treatment = @{
            animalId = [string]$animalId
            productId = [string]$productIdValue
            productName = [string]$productNameValue
            treatmentDate = [string]$treatmentDate
            dose = [double]([Math]::Round((Get-Random -Minimum 10 -Maximum 100) / 10.0, 1))
            dosage = [double]([Math]::Round((Get-Random -Minimum 10 -Maximum 100) / 10.0, 1))
            dosageUnit = [string](@("ml", "mg", "g", "comprime") | Get-Random)
            duration = [int](Get-Random -Minimum 1 -Maximum 7)
            status = [string]($statuses | Get-Random)
            withdrawalEndDate = [string]$withdrawalEndDate
            diagnosis = [string]($diagnostics | Get-Random)
            cost = [double]([Math]::Round((Get-Random -Minimum 1500 -Maximum 8000) / 100.0, 2))
            notes = "Traitement therapeutique - Delta script"
        }

        # Ajouter un veterinaire si disponible
        if ($vetCount -gt 0) {
            $selectedVet = $vets | Get-Random
            $treatment.veterinarianId = [string]$selectedVet.id
            $treatment.veterinarianName = "$($selectedVet.firstName) $($selectedVet.lastName)"
        }

        # Debug: show first few attempts with details
        $showDebug = ($attemptCount -le 3)

        $response = Invoke-Api -Method POST -Endpoint "/farms/$FarmId/treatments" -Body $treatment -Silent:(-not $showDebug) -ShowBodyOnError:$showDebug
        if ($response) {
            $treatmentCount++
        } else {
            $errorCount++
            # Stop after 5 errors to avoid flooding
            if ($errorCount -ge 5) {
                Write-Host "    -> Trop d'erreurs ($errorCount), arret..." -ForegroundColor Red
                break
            }
        }

        # Afficher progression tous les 50
        if ($treatmentCount % 50 -eq 0 -and $treatmentCount -gt 0) {
            Write-Host "    -> Traitements: $treatmentCount crees..." -ForegroundColor Cyan
        }
    }

    # Break outer loop if too many errors
    if ($errorCount -ge 5) { break }
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
