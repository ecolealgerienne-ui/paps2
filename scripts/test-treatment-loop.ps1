# Test unitaire pour creation de treatments en boucle avec debug
param(
    [string]$BaseUrl = "http://localhost:3000"
)

$farmId = "550e8400-e29b-41d4-a716-446655440000"

Write-Host "=== TEST TREATMENT LOOP ===" -ForegroundColor Cyan

# 1. Recuperer des animaux
Write-Host "`n1. Recuperation des animaux..." -ForegroundColor Yellow
try {
    $animalsResponse = Invoke-RestMethod -Uri "$BaseUrl/farms/$farmId/animals?limit=5" -Method GET

    # Handle nested response
    $animals = if ($animalsResponse.data.data) {
        $animalsResponse.data.data
    } elseif ($animalsResponse.data -is [array]) {
        $animalsResponse.data
    } else {
        @($animalsResponse.data)
    }

    Write-Host "   Animaux trouves: $($animals.Count)" -ForegroundColor Green
    foreach ($a in $animals) {
        Write-Host "   - $($a.id) | $($a.visualId)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Recuperer des produits
Write-Host "`n2. Recuperation des produits..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/products?limit=5" -Method GET

    Write-Host "   DEBUG productsResponse.data type: $($productsResponse.data.GetType().Name)" -ForegroundColor Magenta
    Write-Host "   DEBUG productsResponse.data.data exists: $($null -ne $productsResponse.data.data)" -ForegroundColor Magenta

    # Handle nested response - SAME LOGIC AS MAIN SCRIPT
    $productsArray = @()
    if ($productsResponse.data.data) {
        $productsArray = @($productsResponse.data.data)
    } elseif ($productsResponse.data -is [array]) {
        $productsArray = @($productsResponse.data)
    } else {
        $productsArray = @($productsResponse)
    }

    Write-Host "   Produits dans productsArray: $($productsArray.Count)" -ForegroundColor Green

    if ($productsArray.Count -eq 0) {
        Write-Host "   ERREUR: productsArray est VIDE!" -ForegroundColor Red
        Write-Host "   Essayons autrement..." -ForegroundColor Yellow

        # Debug: show raw structure
        Write-Host "   productsResponse.data:" -ForegroundColor Magenta
        $productsResponse.data | ConvertTo-Json -Depth 1 | Write-Host
    } else {
        foreach ($p in $productsArray) {
            Write-Host "   - $($p.id) | nameFr=$($p.nameFr)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Simuler exactement comme le script principal
Write-Host "`n3. Simulation boucle treatments (2 iterations)..." -ForegroundColor Yellow

$treatmentCount = 0
$animalIds = @()
foreach ($a in $animals) { $animalIds += $a.id }

Write-Host "   animalIds count: $($animalIds.Count)" -ForegroundColor Cyan
Write-Host "   productsArray count: $($productsArray.Count)" -ForegroundColor Cyan

if ($animalIds.Count -eq 0) {
    Write-Host "   ERREUR: Pas d'animaux!" -ForegroundColor Red
    exit 1
}

if ($productsArray.Count -eq 0) {
    Write-Host "   ERREUR: Pas de produits dans productsArray!" -ForegroundColor Red
    exit 1
}

# Boucle sur 2 animaux
for ($i = 0; $i -lt 2; $i++) {
    $animalId = $animalIds[$i]
    Write-Host "`n   --- Iteration $($i+1) ---" -ForegroundColor Cyan
    Write-Host "   animalId: $animalId" -ForegroundColor Gray

    # Exactement comme le script principal
    $selectedProduct = $productsArray | Get-Random

    Write-Host "   selectedProduct: $selectedProduct" -ForegroundColor Gray
    Write-Host "   selectedProduct.id: $($selectedProduct.id)" -ForegroundColor Gray
    Write-Host "   selectedProduct.nameFr: $($selectedProduct.nameFr)" -ForegroundColor Gray

    $productName = if ($selectedProduct.nameFr) { $selectedProduct.nameFr }
                  elseif ($selectedProduct.name_fr) { $selectedProduct.name_fr }
                  else { "Produit" }

    Write-Host "   productName final: $productName" -ForegroundColor Gray

    $treatment = @{
        animalId = $animalId
        productId = $selectedProduct.id
        productName = $productName
        type = "treatment"
        treatmentDate = (Get-Date).ToString("yyyy-MM-ddT00:00:00.000Z")
        dose = 5.0
        status = "completed"
        withdrawalEndDate = (Get-Date).AddDays(30).ToString("yyyy-MM-ddT00:00:00.000Z")
        diagnosis = "Test diagnostic $($i+1)"
        notes = "Test treatment $($i+1)"
    }

    Write-Host "   Treatment object:" -ForegroundColor Gray
    $treatment | ConvertTo-Json -Compress | Write-Host

    # Envoyer
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer test-token"
        }
        $body = $treatment | ConvertTo-Json -Depth 10

        $response = Invoke-RestMethod -Uri "$BaseUrl/farms/$farmId/treatments" -Method POST -Headers $headers -Body $body
        Write-Host "   SUCCES! ID: $($response.data.id)" -ForegroundColor Green
        $treatmentCount++
    } catch {
        Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Details: $($errorBody | ConvertTo-Json -Compress)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== RESULTAT: $treatmentCount treatments crees ===" -ForegroundColor $(if ($treatmentCount -gt 0) { "Green" } else { "Red" })
