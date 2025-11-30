# Species - Internationalization Keys

## Overview
This document lists all i18n keys needed for the Species module.

## Error Messages

### Validation Errors
```typescript
species.validation.id.required          // "L'identifiant de l'espèce est requis"
species.validation.id.invalid           // "L'identifiant de l'espèce est invalide"
species.validation.id.maxLength         // "L'identifiant ne doit pas dépasser 50 caractères"

species.validation.nameFr.required      // "Le nom français est requis"
species.validation.nameFr.maxLength     // "Le nom français ne doit pas dépasser 100 caractères"

species.validation.nameEn.required      // "Le nom anglais est requis"
species.validation.nameEn.maxLength     // "Le nom anglais ne doit pas dépasser 100 caractères"

species.validation.nameAr.required      // "Le nom arabe est requis"
species.validation.nameAr.maxLength     // "Le nom arabe ne doit pas dépasser 100 caractères"

species.validation.icon.maxLength       // "L'icône ne doit pas dépasser 50 caractères"

species.validation.description.maxLength // "La description ne doit pas dépasser 500 caractères"

species.validation.scientificName.maxLength // "Le nom scientifique ne doit pas dépasser 100 caractères"

species.validation.displayOrder.invalid // "L'ordre d'affichage doit être un nombre"
```

### Business Logic Errors
```typescript
species.error.notFound                  // "Espèce non trouvée"
species.error.alreadyExists             // "L'espèce existe déjà"
species.error.versionConflict           // "Conflit de version : les données ont été modifiées"
species.error.inUse                     // "Impossible de supprimer : {count} races actives dépendent de cette espèce"
species.error.notDeleted                // "L'espèce n'est pas supprimée"
```

### Success Messages
```typescript
species.success.created                 // "Espèce créée avec succès"
species.success.updated                 // "Espèce mise à jour avec succès"
species.success.deleted                 // "Espèce supprimée avec succès"
species.success.restored                // "Espèce restaurée avec succès"
```

## Total Keys: 20
