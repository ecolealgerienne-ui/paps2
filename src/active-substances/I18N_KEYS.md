# Active Substances - Internationalization Keys

## Overview
This document lists all i18n keys needed for the Active Substances module.

## Error Messages

### Validation Errors
```typescript
activeSubstance.validation.code.required          // "Le code est requis"
activeSubstance.validation.code.maxLength         // "Le code ne doit pas dépasser 50 caractères"

activeSubstance.validation.name.required          // "Le nom international (DCI) est requis"
activeSubstance.validation.name.maxLength         // "Le nom ne doit pas dépasser 200 caractères"

activeSubstance.validation.nameFr.maxLength       // "Le nom français ne doit pas dépasser 200 caractères"
activeSubstance.validation.nameEn.maxLength       // "Le nom anglais ne doit pas dépasser 200 caractères"
activeSubstance.validation.nameAr.maxLength       // "Le nom arabe ne doit pas dépasser 200 caractères"

activeSubstance.validation.atcCode.maxLength      // "Le code ATC ne doit pas dépasser 20 caractères"

activeSubstance.validation.isActive.invalid       // "Le statut actif doit être un booléen"
```

### Business Logic Errors
```typescript
activeSubstance.error.notFound                    // "Substance active non trouvée"
activeSubstance.error.codeAlreadyExists          // "Le code de substance active existe déjà"
activeSubstance.error.versionConflict            // "Conflit de version : les données ont été modifiées"
activeSubstance.error.inUse                      // "Impossible de supprimer : {count} produits actifs dépendent de cette substance"
activeSubstance.error.notDeleted                 // "La substance active n'est pas supprimée"
```

### Success Messages
```typescript
activeSubstance.success.created                   // "Substance active créée avec succès"
activeSubstance.success.updated                   // "Substance active mise à jour avec succès"
activeSubstance.success.deleted                   // "Substance active supprimée avec succès"
activeSubstance.success.restored                  // "Substance active restaurée avec succès"
```

## Total Keys: 18
