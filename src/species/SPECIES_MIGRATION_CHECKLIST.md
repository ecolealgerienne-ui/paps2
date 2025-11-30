# Species Migration Checklist

## Entity: Species (6/16 - Phase 2)

### Schema ✅
- [x] 8 fields: id, nameFr, nameEn, nameAr, icon, displayOrder, description, scientificName
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: animals, breeds, ageCategories
- [x] String @id (NOT UUID) - custom ids like "bovine", "ovine"

### DTOs ✅
- [x] CreateSpeciesDto (full validation)
- [x] UpdateSpeciesDto (partial, excludes id, includes version)
- [x] SpeciesResponseDto (all fields, nullable types as `| null`)
- [x] scientificName added to all DTOs
- [x] icon made optional in CreateDto

### Controller ✅
- [x] Endpoint at `/api/v1/species`
- [x] 5 main endpoints + 1 restore
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Removed custom wrapper `{ success: true, data: {...} }`
- [x] Returns DTOs directly
- [x] Pagination query params (page, limit)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes

### Service ✅
- [x] Removed local type definition
- [x] Imports Prisma types
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 4 fields (nameFr, nameEn, nameAr, scientificName)
- [x] Sort whitelist: nameFr, nameEn, id, displayOrder, createdAt
- [x] Default sort: displayOrder → nameFr
- [x] AppLogger throughout
- [x] Soft delete + restore
- [x] Dependency check (breeds)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly
- [x] scientificName handled in create/update

### Documentation ✅
- [x] I18N_KEYS.md (20 keys)
- [x] TESTS_PLAN.md (60+ test cases, 6 endpoints)
- [x] SPECIES_MIGRATION_CHECKLIST.md

## Completion: 33/33 (100%) ✅
