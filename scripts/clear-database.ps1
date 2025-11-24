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
    $envFile = Join-Path $PSScriptRoot ".." ".env"

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

    # Liste de toutes les tables dans l'ordre de suppression
    $tables = @(
        @{ Name = "farm_national_campaign_preferences"; Label = "Farm National Campaign Preferences" },
        @{ Name = "farm_veterinarian_preferences"; Label = "Farm Veterinarian Preferences" },
        @{ Name = "farm_vaccine_preferences"; Label = "Farm Vaccine Preferences" },
        @{ Name = "farm_product_preferences"; Label = "Farm Product Preferences" },
        @{ Name = "farm_breed_preferences"; Label = "Farm Breed Preferences" },
        @{ Name = "campaign_countries"; Label = "Campaign Countries" },
        @{ Name = "vaccine_countries"; Label = "Vaccine Countries" },
        @{ Name = "product_countries"; Label = "Product Countries" },
        @{ Name = "breed_countries"; Label = "Breed Countries" },
        @{ Name = "sync_queues"; Label = "Sync Queues" },
        @{ Name = "weights"; Label = "Weights" },
        @{ Name = "documents"; Label = "Documents" },
        @{ Name = "personal_campaigns"; Label = "Personal Campaigns" },
        @{ Name = "breedings"; Label = "Breedings" },
        @{ Name = "vaccinations"; Label = "Vaccinations" },
        @{ Name = "treatments"; Label = "Treatments" },
        @{ Name = "movement_animals"; Label = "Movement Animals" },
        @{ Name = "movements"; Label = "Movements" },
        @{ Name = "lot_animals"; Label = "Lot Animals" },
        @{ Name = "lots"; Label = "Lots" },
        @{ Name = "animals"; Label = "Animals" },
        @{ Name = "alert_configurations"; Label = "Alert Configurations" },
        @{ Name = "farm_preferences"; Label = "Farm Preferences" },
        @{ Name = "custom_vaccines"; Label = "Custom Vaccines" },
        @{ Name = "custom_medical_products"; Label = "Custom Medical Products" },
        @{ Name = "farms"; Label = "Farms" },
        @{ Name = "veterinarians"; Label = "Veterinarians" },
        @{ Name = "alert_templates"; Label = "Alert Templates" },
        @{ Name = "national_campaigns"; Label = "National Campaigns" },
        @{ Name = "vaccines_global"; Label = "Global Vaccines" },
        @{ Name = "global_medical_products"; Label = "Global Medical Products" },
        @{ Name = "breeds"; Label = "Breeds" },
        @{ Name = "species"; Label = "Species" },
        @{ Name = "countries"; Label = "Countries" },
        @{ Name = "administration_routes"; Label = "Administration Routes" }
    )

    # Créer un fichier SQL temporaire
    $sqlFile = Join-Path $env:TEMP "clear_database.sql"

    # Générer le script SQL
    $sqlCommands = @"
-- Desactiver les triggers pour accelerer
SET session_replication_role = 'replica';

-- Supprimer les donnees de toutes les tables
"@

    foreach ($table in $tables) {
        $sqlCommands += "`nDELETE FROM `"$($table.Name)`";"
    }

    $sqlCommands += @"

-- Reactiver les triggers
SET session_replication_role = 'origin';

-- Reset les sequences
DO `$`$
DECLARE
  seq_name text;
BEGIN
  FOR seq_name IN
    SELECT sequence_name FROM information_schema.sequences
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RESTART WITH 1';
  END LOOP;
END `$`$;
"@

    # Écrire le fichier SQL
    $sqlCommands | Out-File -FilePath $sqlFile -Encoding UTF8

    Write-Host "[INFO] Execution de la suppression..." -ForegroundColor Cyan
    Write-Host ""

    # Définir le mot de passe PostgreSQL
    $env:PGPASSWORD = $dbPassword

    # Exécuter le script SQL avec psql
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue

    if ($null -eq $psqlPath) {
        Write-Host "[WARN] psql non trouve, tentative avec npx prisma db execute..." -ForegroundColor Yellow

        # Alternative: utiliser Prisma CLI
        npx prisma db execute --file $sqlFile --schema prisma/schema.prisma
    } else {
        # Utiliser psql
        & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile -q
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host " TERMINE: Toutes les donnees ont ete supprimees" -ForegroundColor Green
        Write-Host " La base de donnees est maintenant vide!" -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERREUR] Erreur lors de l'execution du script SQL" -ForegroundColor Red
        exit 1
    }

    # Nettoyer le fichier temporaire
    Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue

} catch {
    Write-Host ""
    Write-Host "[ERREUR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
} finally {
    # Nettoyer la variable de mot de passe
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
