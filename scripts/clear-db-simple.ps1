# Script simple pour vider la base de données via Docker
# Assume que PostgreSQL tourne dans un container Docker

Write-Host "SUPPRESSION DE TOUTES LES DONNEES" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer? (tapez 'OUI' pour confirmer)"

if ($confirmation -ne "OUI") {
    Write-Host "Operation annulee" -ForegroundColor Yellow
    exit 0
}

# Charger .env
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key -Value $value
        }
    }
}

# Parser DATABASE_URL
if ($DATABASE_URL -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]

    Write-Host "Connexion: $dbName @ $dbHost" -ForegroundColor Cyan
    Write-Host ""

    # Trouver le container Docker postgres
    $container = docker ps --filter "expose=$dbPort" --format "{{.Names}}" | Select-Object -First 1

    if ($container) {
        Write-Host "Container trouve: $container" -ForegroundColor Green

        # Exécuter le script SQL
        Get-Content "scripts\clear-database.sql" | docker exec -i $container psql -U $dbUser -d $dbName

        Write-Host ""
        Write-Host "TERMINE!" -ForegroundColor Green
    } else {
        Write-Host "Container Docker non trouve sur le port $dbPort" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Executez manuellement:" -ForegroundColor Yellow
        Write-Host "  psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f scripts\clear-database.sql" -ForegroundColor White
        Write-Host "  Mot de passe: $dbPassword" -ForegroundColor White
    }
} else {
    Write-Host "Erreur: DATABASE_URL invalide" -ForegroundColor Red
}
