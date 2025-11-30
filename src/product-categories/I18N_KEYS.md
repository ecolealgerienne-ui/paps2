# Product Categories - Internationalization Keys

## Overview
This document lists all i18n keys needed for the Product Categories module.

## Error Messages

### Validation Errors
```typescript
productCategory.validation.code.required          // "Le code est requis"
productCategory.validation.code.maxLength         // "Le code ne doit pas dépasser 50 caractères"

productCategory.validation.nameFr.required        // "Le nom français est requis"
productCategory.validation.nameFr.maxLength       // "Le nom français ne doit pas dépasser 200 caractères"

productCategory.validation.nameEn.required        // "Le nom anglais est requis"
productCategory.validation.nameEn.maxLength       // "Le nom anglais ne doit pas dépasser 200 caractères"

productCategory.validation.nameAr.required        // "Le nom arabe est requis"
productCategory.validation.nameAr.maxLength       // "Le nom arabe ne doit pas dépasser 200 caractères"

productCategory.validation.displayOrder.invalid   // "L'ordre d'affichage doit être un nombre entier"
productCategory.validation.displayOrder.min       // "L'ordre d'affichage doit être positif ou nul"

productCategory.validation.isActive.invalid       // "Le statut actif doit être un booléen"
```

### Business Logic Errors
```typescript
productCategory.error.notFound                    // "Catégorie de produit non trouvée"
productCategory.error.codeAlreadyExists          // "Le code de catégorie existe déjà"
productCategory.error.versionConflict            // "Conflit de version : les données ont été modifiées"
productCategory.error.inUse                      // "Impossible de supprimer : {count} produits actifs dépendent de cette catégorie"
productCategory.error.notDeleted                 // "La catégorie n'est pas supprimée"
```

### Success Messages
```typescript
productCategory.success.created                   // "Catégorie créée avec succès"
productCategory.success.updated                   // "Catégorie mise à jour avec succès"
productCategory.success.deleted                   // "Catégorie supprimée avec succès"
productCategory.success.restored                  // "Catégorie restaurée avec succès"
```

## Total Keys: 20
