<#
.SYNOPSIS
    Script pour vider complètement la base de données PostgreSQL

.DESCRIPTION
    ATTENTION: Ce script supprime TOUTES les données de TOUTES les tables !
    Utilisez-le uniquement en développement.

.EXAMPLE
    .\scripts\clear-database.ps1

.NOTES
    Nécessite que la variable d'environnement DATABASE_URL soit définie dans .env
#>

# Arrêter le script en cas d'erreur
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host " SUPPRESSION DE TOUTES LES DONNEES DE LA BASE DE DONNEES" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host ""

try {
    # Charger les variables d'environnement depuis .env
    $envFile = Join-Path $PSScriptRoot "..\.env"

    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
            }
        }
        Write-Host "[OK] Variables d'environnement chargees depuis .env" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Fichier .env non trouve, utilisation des variables systeme" -ForegroundColor Yellow
    }

    # Récupérer DATABASE_URL
    $databaseUrl = [Environment]::GetEnvironmentVariable("DATABASE_URL", "Process")

    if ([string]::IsNullOrEmpty($databaseUrl)) {
        Write-Host "[ERREUR] Variable DATABASE_URL non definie!" -ForegroundColor Red
        exit 1
    }

    # Vérifier qu'on n'est pas en production
    if ($databaseUrl -match "production|prod") {
        Write-Host "[ERREUR] Ce script ne peut pas etre execute en production!" -ForegroundColor Red
        exit 1
    }

    # Parser DATABASE_URL (format: postgresql://user:password@host:port/database)
    if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
        $dbUser = $matches[1]
        $dbPassword = $matches[2]
        $dbHost = $matches[3]
        $dbPort = $matches[4]
        $dbName = $matches[5]

        Write-Host "[INFO] Base de donnees: $dbName @ $dbHost" -ForegroundColor Cyan
    } else {
        Write-Host "[ERREUR] Format DATABASE_URL invalide!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "[ATTENTION] Cette operation est IRREVERSIBLE!" -ForegroundColor Red
    Write-Host ""
    $confirmation = Read-Host "Voulez-vous continuer? (tapez 'OUI' pour confirmer)"

    if ($confirmation -ne "OUI") {
        Write-Host "[ANNULE] Operation annulee par l'utilisateur" -ForegroundColor Yellow
        exit 0
    }

    Write-Host ""
    Write-Host "[INFO] Execution de la suppression..." -ForegroundColor Cyan
    Write-Host ""

    # Exécuter le script TypeScript qui utilise Prisma Client
    npx ts-node scripts\clear-database.ts

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host " TERMINE: Toutes les donnees ont ete supprimees" -ForegroundColor Green
        Write-Host " La base de donnees est maintenant vide!" -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERREUR] Erreur lors de l'execution du script" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host ""
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
