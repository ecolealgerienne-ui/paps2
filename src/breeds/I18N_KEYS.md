# Breeds - Internationalization Keys

## Overview
This document lists all i18n keys needed for the Breeds module.

## Error Messages

### Validation Errors
```typescript
breed.validation.code.required                // "Le code est requis"
breed.validation.code.maxLength               // "Le code ne doit pas dépasser 50 caractères"

breed.validation.speciesId.required           // "L'espèce est requise"

breed.validation.nameFr.required              // "Le nom français est requis"
breed.validation.nameFr.maxLength             // "Le nom français ne doit pas dépasser 200 caractères"

breed.validation.nameEn.required              // "Le nom anglais est requis"
breed.validation.nameEn.maxLength             // "Le nom anglais ne doit pas dépasser 200 caractères"

breed.validation.nameAr.required              // "Le nom arabe est requis"
breed.validation.nameAr.maxLength             // "Le nom arabe ne doit pas dépasser 200 caractères"

breed.validation.displayOrder.invalid         // "L'ordre d'affichage doit être un nombre entier"
breed.validation.displayOrder.min             // "L'ordre d'affichage doit être positif ou nul"

breed.validation.isActive.invalid             // "Le statut actif doit être un booléen"
```

### Business Logic Errors
```typescript
breed.error.notFound                          // "Race non trouvée"
breed.error.codeAlreadyExists                 // "Le code de race existe déjà"
breed.error.versionConflict                   // "Conflit de version : les données ont été modifiées"
breed.error.inUse                             // "Impossible de supprimer : {count} animaux actifs dépendent de cette race"
breed.error.notDeleted                        // "La race n'est pas supprimée"
```

### Success Messages
```typescript
breed.success.created                         // "Race créée avec succès"
breed.success.updated                         // "Race mise à jour avec succès"
breed.success.deleted                         // "Race supprimée avec succès"
breed.success.restored                        // "Race restaurée avec succès"
```

## Total Keys: 21
