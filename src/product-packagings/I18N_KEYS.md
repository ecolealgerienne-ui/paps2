# Product Packagings - Internationalization Keys

## Overview
This document lists all i18n keys needed for the Product Packagings module.

## Error Messages

### Validation Errors
```typescript
productPackaging.validation.productId.required         // "Le produit est requis"
productPackaging.validation.productId.uuid             // "Le produit doit être un UUID valide"

productPackaging.validation.countryCode.required       // "Le code pays est requis"
productPackaging.validation.countryCode.maxLength      // "Le code pays ne doit pas dépasser 2 caractères"

productPackaging.validation.concentration.required     // "La concentration est requise"
productPackaging.validation.concentration.number       // "La concentration doit être un nombre"
productPackaging.validation.concentration.min          // "La concentration doit être positive ou nulle"

productPackaging.validation.concentrationUnitId.required  // "L'unité de concentration est requise"

productPackaging.validation.volume.number              // "Le volume doit être un nombre"
productPackaging.validation.volume.min                 // "Le volume doit être positif ou nul"

productPackaging.validation.packagingLabel.required    // "Le libellé du conditionnement est requis"
productPackaging.validation.packagingLabel.maxLength   // "Le libellé ne doit pas dépasser 255 caractères"

productPackaging.validation.gtinEan.maxLength          // "Le code GTIN/EAN ne doit pas dépasser 50 caractères"

productPackaging.validation.numeroAMM.maxLength        // "Le numéro AMM ne doit pas dépasser 100 caractères"

productPackaging.validation.isActive.invalid           // "Le statut actif doit être un booléen"
```

### Business Logic Errors
```typescript
productPackaging.error.notFound                        // "Conditionnement non trouvé"
productPackaging.error.productNotFound                 // "Produit non trouvé"
productPackaging.error.countryNotFound                 // "Pays non trouvé"
productPackaging.error.versionConflict                 // "Conflit de version : les données ont été modifiées"
productPackaging.error.notDeleted                      // "Le conditionnement n'est pas supprimé"
productPackaging.error.gtinNotFound                    // "Aucun conditionnement trouvé avec ce code-barres"
```

### Success Messages
```typescript
productPackaging.success.created                       // "Conditionnement créé avec succès"
productPackaging.success.updated                       // "Conditionnement mis à jour avec succès"
productPackaging.success.deleted                       // "Conditionnement supprimé avec succès"
productPackaging.success.restored                      // "Conditionnement restauré avec succès"
```

## Total Keys: 24
