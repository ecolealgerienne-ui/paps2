# Checklist de Remédiation - Entité de Référence Admin

> **Template pour la standardisation et remédiation des entités de données de référence**
>
> **Mode** : Big Bang (pas de backward compatibility)
>
> **Version API cible** : `/api/v1/`

---

## Entité : `[ENTITY_NAME]`

**Date de début** : `YYYY-MM-DD`

**Date de fin** : `YYYY-MM-DD`

**Développeur** : `@username`

---

## 📋 CHECKLIST COMPLÈTE (33 Points)

### 🔴 CRITIQUES (Bloquants MVP)

#### 1. Pattern API `/api/v1/`

- [ ] **Endpoint global** : `/api/v1/[resource]`
- [ ] **Endpoint farm-scoped** (si applicable) : `/api/v1/farms/:farmId/[resource]`
- [ ] Ancien endpoint supprimé (Big Bang)
- [ ] Routes mises à jour dans le controller
- [ ] Module enregistré dans `app.module.ts`

**Notes** :
```
Ancien : ___________________
Nouveau : __________________
```

---

#### 2. Structure Table ↔️ CRUD ↔️ Signature API

- [ ] **Audit Schema Prisma** : Tous les champs identifiés
- [ ] **CreateDto** : Contient TOUS les champs créables
- [ ] **UpdateDto** : Contient TOUS les champs modifiables (partial)
- [ ] **ResponseDto** : Contient TOUS les champs + métadonnées
- [ ] Aucun champ manquant entre DB et API
- [ ] Types TypeScript correspondent aux types Prisma

**Champs manquants identifiés** :
```
-
```

**Champs corrigés** :
```
-
```

---

#### 3. Champs Optionnels vs Obligatoires

- [ ] Champs **obligatoires** dans Prisma = `@IsNotEmpty()` dans DTO
- [ ] Champs **optionnels** dans Prisma = `@IsOptional()` dans DTO
- [ ] Cohérence `?` entre Prisma, DTOs, et interfaces TypeScript
- [ ] Valeurs par défaut Prisma documentées

**Matrice de vérification** :
| Champ | Prisma | CreateDto | UpdateDto | Notes |
|-------|--------|-----------|-----------|-------|
|       | String | ✅        | ✅        |       |
|       | String?| ✅ @IsOptional | ✅ | |

---

#### 4. Constantes en Dur

- [ ] Aucune string en dur dans le code (sauf clés techniques)
- [ ] **Enums** définis pour types/statuts
- [ ] Enums Prisma = Enums TypeScript
- [ ] Valeurs de configuration externalisées
- [ ] Magic numbers documentés ou extraits en constantes

**Enums utilisés** :
```typescript
// Liste des enums
```

**Constantes extraites** :
```typescript
// Liste des constantes
```

---

#### 5. Transactions

- [ ] Opérations multiples wrapped dans `prisma.$transaction()`
- [ ] Rollback automatique en cas d'erreur
- [ ] Relations créées atomiquement
- [ ] Pas de risque de données partielles

**Transactions identifiées** :
```
- Méthode : _______________ (Lignes : _____)
```

---

#### 6. I18n

- [ ] **Champs multilingues** : `nameFr`, `nameEn`, `nameAr` présents
- [ ] Messages d'erreur utilisateur en i18n (clés)
- [ ] Messages de validation en i18n
- [ ] Pas de texte utilisateur en dur
- [ ] Fichiers i18n mis à jour (`fr.json`, `en.json`, `ar.json`)

**Clés i18n ajoutées** :
```
- errors.[entity]_not_found
- errors.[entity]_code_duplicate
- validation.[entity]_name_required
```

---

#### 7. Validation des DTOs

- [ ] `class-validator` sur **tous** les champs
- [ ] `@IsString()`, `@IsNumber()`, `@IsBoolean()`, etc.
- [ ] `@IsNotEmpty()` sur champs obligatoires
- [ ] `@IsOptional()` sur champs optionnels
- [ ] Validation métier custom (dates, formats, etc.)
- [ ] Messages d'erreur personnalisés et i18n

**Exemple** :
```typescript
@IsString()
@IsNotEmpty({ message: 'validation.name_fr_required' })
nameFr: string;
```

---

#### 23. Naming Convention (Critique)

- [ ] **Décision prise** : `camelCase` dans les réponses JSON
- [ ] DTOs utilisent `camelCase`
- [ ] Transformation `snake_case` (DB) → `camelCase` (API) automatique
- [ ] Cohérence partout (pas de mélange)

**Pattern appliqué** :
```
DB: name_fr → API: nameFr
DB: display_order → API: displayOrder
```

---

#### 25. Codes Métier - Validation

- [ ] Format standardisé : `UPPERCASE`, alphanumeric, 2-20 chars
- [ ] Validation regex : `^[A-Z0-9_-]{2,20}$`
- [ ] Uniqueness vérifiée (DB + validation DTO)
- [ ] Messages d'erreur clairs

**Validation** :
```typescript
@Matches(/^[A-Z0-9_-]{2,20}$/, {
  message: 'validation.code_format_invalid'
})
code: string;
```

---

#### 27. Performance - Éviter N+1 Queries

- [ ] Relations chargées avec `include` ou `select`
- [ ] Pas de boucles avec queries imbriquées
- [ ] `findUnique` dans les boucles remplacé par `findMany` + include
- [ ] Pagination pour grandes listes

**Optimisations appliquées** :
```
- Ligne ___ : Ajout include { relation }
```

---

### 🟡 IMPORTANTS (Fortement Recommandés)

#### 8. Gestion des Erreurs Standardisée

- [ ] Codes HTTP cohérents
  - `200 OK` : Succès (GET, PUT)
  - `201 Created` : Ressource créée (POST)
  - `204 No Content` : Suppression réussie (DELETE)
  - `400 Bad Request` : Validation échouée
  - `404 Not Found` : Ressource introuvable
  - `409 Conflict` : Duplicate (code unique)
  - `500 Internal Server Error` : Erreur serveur
- [ ] Format erreur uniforme
- [ ] Messages explicites i18n
- [ ] Stack traces en développement uniquement

**Exceptions utilisées** :
```typescript
throw new NotFoundException('errors.[entity]_not_found');
throw new ConflictException('errors.code_already_exists');
throw new BadRequestException('errors.validation_failed');
```

---

#### 9. Authorisation & Guards

- [ ] **Admin endpoints** : `@UseGuards(JwtAuthGuard, AdminGuard)`
- [ ] **Farm-scoped** : `@UseGuards(JwtAuthGuard, FarmOwnerGuard)`
- [ ] **Public** : Pas de guard (si applicable)
- [ ] Vérification ownership pour farm-scoped
- [ ] Tests guards avec différents rôles

**Guards appliqués** :
```typescript
// Liste des endpoints et leurs guards
```

---

#### 10. Soft Delete Consistency

- [ ] `deletedAt` respecté dans **tous** les queries
- [ ] `findMany` : `where: { deletedAt: null }`
- [ ] `findUnique` : Vérifier si soft-deleted
- [ ] DELETE endpoint fait soft delete : `{ deletedAt: new Date() }`
- [ ] Restauration possible (endpoint `PATCH /:id/restore` si besoin)

**Implémentation** :
```typescript
// Soft delete
await prisma.[entity].update({
  where: { id },
  data: { deletedAt: new Date() }
});
```

---

#### 11. Relations & Foreign Keys

- [ ] Relations Prisma correctes (`@relation`)
- [ ] Foreign keys validées avant création
- [ ] Cascade approprié (`onDelete`, `onUpdate`)
- [ ] Vérifier que la ressource liée existe
- [ ] Messages d'erreur si FK invalide

**Relations** :
```prisma
// Liste des relations
```

---

#### 12. Indexes pour Performance

- [ ] `@unique` sur codes métier
- [ ] `@@index` sur foreign keys
- [ ] `@@index` sur champs de recherche fréquents
- [ ] `@@index` composites si nécessaire

**Indexes ajoutés** :
```prisma
@@index([farmId, isActive])
@@index([code])
```

---

#### 13. Pagination Standardisée

- [ ] Tous les `findAll` supportent `page` et `limit`
- [ ] Format de retour :
  ```typescript
  {
    data: [...],
    meta: {
      total: number,
      page: number,
      limit: number,
      pages: number
    }
  }
  ```
- [ ] Défaut : `page=1, limit=20`
- [ ] Validation : `page >= 1`, `limit <= 100`

**Implémentation** :
```typescript
@Query('page') page: number = 1,
@Query('limit') limit: number = 20,
```

---

#### 14. Filtrage & Recherche

- [ ] Filtres par champs métier (`isActive`, `type`, etc.)
- [ ] Recherche texte (`search`) sur champs pertinents
- [ ] Query params cohérents
- [ ] Case-insensitive search

**Filtres disponibles** :
```
?search=vaccine
?isActive=true
?type=VACCINATION
```

---

#### 15. Tri (Sorting)

- [ ] Support `orderBy` et `order` (ASC/DESC)
- [ ] Défaut logique : `displayOrder ASC` ou `createdAt DESC`
- [ ] Validation : champs autorisés pour tri
- [ ] Protection contre injection (whitelist)

**Exemple** :
```typescript
?orderBy=nameFr&order=ASC
```

---

#### 16. DTOs Séparés Request/Response

- [ ] **CreateDto** : Input création
- [ ] **UpdateDto** : Input modification (extends PartialType)
- [ ] **ResponseDto** : Output avec métadonnées
- [ ] Pas de champs sensibles exposés (passwords, tokens, etc.)
- [ ] ResponseDto inclut : `id`, `createdAt`, `updatedAt`, `version`, `deletedAt`

**Structure** :
```
dto/
  ├── create-[entity].dto.ts
  ├── update-[entity].dto.ts
  ├── [entity]-response.dto.ts
  └── index.ts
```

---

#### 17. Enums Synchronisés

- [ ] Enum TypeScript = Enum Prisma
- [ ] Enums utilisés dans validation DTO
- [ ] `@IsEnum()` validator
- [ ] Documentation des valeurs possibles

**Enums** :
```prisma
enum DataScope { global, local }
enum CampaignType { VACCINATION, TREATMENT, PROPHYLAXIS }
```

```typescript
@IsEnum(CampaignType)
type: CampaignType;
```

---

#### 18. Versioning Optimiste

- [ ] Champ `version` utilisé
- [ ] Incrément automatique sur update : `version: { increment: 1 }`
- [ ] Vérification version avant update
- [ ] ConflictException si version mismatch

**Implémentation** :
```typescript
await prisma.[entity].update({
  where: { id, version: currentVersion },
  data: {
    ...updates,
    version: { increment: 1 }
  }
});
```

---

#### 19. Audit Trail Complet

- [ ] `createdAt` : Auto-généré (`@default(now())`)
- [ ] `updatedAt` : Auto-mis à jour (`@updatedAt`)
- [ ] `deletedAt` : Soft delete
- [ ] **Jamais** permettre modification manuelle de ces champs
- [ ] Exclus des CreateDto et UpdateDto

**Vérification** :
```
createdAt, updatedAt, deletedAt absents des DTOs input
```

---

#### 20. Documentation Swagger

- [ ] `@ApiTags('[Entity]')` sur le controller
- [ ] `@ApiOperation({ summary: '...' })` sur chaque endpoint
- [ ] `@ApiResponse()` pour chaque code de retour
- [ ] `@ApiProperty()` sur chaque champ DTO
- [ ] Exemples inclus dans les DTOs

**Exemple** :
```typescript
@ApiOperation({ summary: 'Create a new species' })
@ApiResponse({ status: 201, description: 'Species created', type: SpeciesResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 409, description: 'Code already exists' })
@Post()
create(@Body() dto: CreateSpeciesDto) {}
```

---

#### 21. Tests Basiques

- [ ] Test unitaire : `create` réussit
- [ ] Test unitaire : `findAll` retourne liste
- [ ] Test unitaire : `findOne` retourne ressource
- [ ] Test unitaire : `update` modifie ressource
- [ ] Test unitaire : `delete` soft-delete ressource
- [ ] Test validation : erreurs pour champs invalides
- [ ] Test not found : 404 si ressource inexistante
- [ ] Test duplicate : 409 si code déjà existant

**Couverture minimale** : 80%

---

#### 22. Idempotence

- [ ] POST avec code métier : Vérifier doublon avant création
- [ ] PUT : Update idempotent
- [ ] DELETE : Retourne 204 même si déjà supprimé
- [ ] Pas d'effets de bord sur appels multiples

---

#### 24. displayOrder - Logique

- [ ] Auto-increment à la création : `max + 1`
- [ ] Validation : `displayOrder >= 0`
- [ ] Tri par défaut : `orderBy: { displayOrder: 'asc' }`
- [ ] Optionnel : Endpoint de réordonnancement

**Implémentation** :
```typescript
const maxOrder = await prisma.[entity].findFirst({
  orderBy: { displayOrder: 'desc' },
  select: { displayOrder: true }
});
displayOrder = (maxOrder?.displayOrder || 0) + 1;
```

---

#### 28. Seed Data (si entité de référence critique)

- [ ] Script seed créé : `prisma/seeds/xxx-[entity].seed.ts`
- [ ] Données initiales cohérentes
- [ ] Idempotent (vérifie existence avant création)
- [ ] Enregistré dans `package.json` : `prisma db seed`

**Données seedées** :
```
- X enregistrements
```

---

### 🟢 OPTIONNELS (Qualité Post-MVP)

#### 26. Response Wrapper Standardisé

- [ ] Wrapper uniforme pour toutes les réponses
- [ ] Interceptor global créé
- [ ] Format :
  ```typescript
  {
    data: {...},
    meta: { timestamp, version }
  }
  ```

---

#### 29. Bulk Operations

- [ ] `POST /api/v1/[entity]/bulk-create`
- [ ] `PATCH /api/v1/[entity]/bulk-update`
- [ ] `DELETE /api/v1/[entity]/bulk-delete`
- [ ] Validation : max 100 items par batch

---

#### 30. Query Builders Réutilisables

- [ ] Helper `BaseQueryBuilder.softDelete()`
- [ ] Helper `BaseQueryBuilder.active()`
- [ ] Helper `BaseQueryBuilder.search()`
- [ ] Réutilisé dans tous les services

---

#### 31. Validation au Démarrage

- [ ] Variables d'environnement validées
- [ ] Fail-fast si config manquante
- [ ] Joi schema créé

---

#### 32. Logging Standardisé

- [ ] Actions admin loggées
- [ ] Format uniforme : `{ action, userId, resource, resourceId, data }`
- [ ] Niveau approprié (info, warn, error)

---

#### 33. Custom Validators

- [ ] `@IsUnique()` validator pour codes
- [ ] `@IsValidReference()` pour foreign keys
- [ ] Validators réutilisables

---

## 📊 RÉSUMÉ

**Critiques (10)** : ☐ 0/10
**Importants (18)** : ☐ 0/18
**Optionnels (5)** : ☐ 0/5

**Total** : ☐ 0/33

**Statut** : 🔴 NON DÉMARRÉ | 🟡 EN COURS | 🟢 TERMINÉ

---

## 📝 NOTES & DÉCISIONS

```
[Ajouter notes importantes, décisions prises, blocages, etc.]
```

---

## 🐛 BUGS IDENTIFIÉS & CORRIGÉS

| Bug | Description | Fix | Commit |
|-----|-------------|-----|--------|
|     |             |     |        |

---

## ✅ VALIDATION FINALE

- [ ] Code review effectué
- [ ] Tests passent (unitaires + E2E)
- [ ] Documentation mise à jour
- [ ] Swagger validé
- [ ] Déployé en staging
- [ ] Testé manuellement
- [ ] **Migration terminée** ✅

**Validé par** : `___________` **Date** : `___________`
