# Test unitaire pour creation de treatment avec erreurs detaillees
param(
    [string]$BaseUrl = "http://localhost:3000"
)

$farmId = "550e8400-e29b-41d4-a716-446655440000"

Write-Host "=== TEST TREATMENT ===" -ForegroundColor Cyan

# 1. Recuperer un animal
Write-Host "`n1. Recuperation d'un animal..." -ForegroundColor Yellow
try {
    $animalsResponse = Invoke-RestMethod -Uri "$BaseUrl/farms/$farmId/animals?limit=1" -Method GET
    # Handle nested response: {success, data: {data: [...], meta: {...}}}
    $animal = if ($animalsResponse.data.data) {
        $animalsResponse.data.data[0]
    } elseif ($animalsResponse.data -is [array]) {
        $animalsResponse.data[0]
    } else {
        $animalsResponse.data
    }
    if (-not $animal -or -not $animal.id) {
        Write-Host "   ERREUR: Aucun animal trouve" -ForegroundColor Red
        exit 1
    }
    Write-Host "   Animal: $($animal.id) - $($animal.visualId)" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Recuperer un produit
Write-Host "`n2. Recuperation d'un produit..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/products?limit=1" -Method GET
    Write-Host "   Response structure:" -ForegroundColor Gray
    Write-Host "   - data type: $($productsResponse.data.GetType().Name)" -ForegroundColor Gray
    Write-Host "   - data.data exists: $($null -ne $productsResponse.data.data)" -ForegroundColor Gray

    $product = if ($productsResponse.data.data) {
        $productsResponse.data.data[0]
    } elseif ($productsResponse.data -is [array]) {
        $productsResponse.data[0]
    } else {
        $productsResponse.data
    }

    if (-not $product) {
        Write-Host "   ERREUR: Aucun produit trouve" -ForegroundColor Red
        exit 1
    }
    Write-Host "   Produit ID: $($product.id)" -ForegroundColor Green
    Write-Host "   Produit nameFr: $($product.nameFr)" -ForegroundColor Green
    Write-Host "   Produit name_fr: $($product.name_fr)" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Construire le treatment
Write-Host "`n3. Construction du treatment..." -ForegroundColor Yellow
$productName = if ($product.nameFr) { $product.nameFr } elseif ($product.name_fr) { $product.name_fr } else { "Produit Test" }

$treatment = @{
    animalId = $animal.id
    productId = $product.id
    productName = $productName
    type = "treatment"
    treatmentDate = (Get-Date).ToString("yyyy-MM-ddT00:00:00.000Z")
    dose = 5.0
    status = "completed"
    withdrawalEndDate = (Get-Date).AddDays(30).ToString("yyyy-MM-ddT00:00:00.000Z")
    diagnosis = "Test diagnostic"
    notes = "Test treatment"
}

Write-Host "   Treatment object:" -ForegroundColor Gray
$treatment | ConvertTo-Json | Write-Host

# 4. Envoyer le treatment
Write-Host "`n4. Envoi du treatment..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer test-token"
    }
    $body = $treatment | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "$BaseUrl/farms/$farmId/treatments" -Method POST -Headers $headers -Body $body
    Write-Host "   SUCCES!" -ForegroundColor Green
    Write-Host "   Response:" -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "   ERREUR HTTP: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red

    # Lire le corps de l'erreur
    if ($_.ErrorDetails.Message) {
        Write-Host "`n   Details de l'erreur:" -ForegroundColor Yellow
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorBody | ConvertTo-Json -Depth 5 | Write-Host
        } catch {
            Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== FIN TEST ===" -ForegroundColor Cyan
