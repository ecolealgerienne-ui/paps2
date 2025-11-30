# Breeds Migration Checklist

## Entity: Breed (11/16 - Phase 3)

### Schema ✅
- [x] 8 fields: id, code, speciesId, nameFr, nameEn, nameAr, description, displayOrder, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: species (FK), animals, breedCountries, farmPreferences
- [x] Indexes: code, speciesId, deletedAt, displayOrder, isActive

### DTOs ✅
- [x] CreateBreedDto (full validation, removed custom id field)
- [x] UpdateBreedDto (excludes code/speciesId, includes version)
- [x] BreedResponseDto (all fields, nullable types as `| null`)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/breeds`
- [x] 9 endpoints total (including specialized)
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (speciesId, isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Specialized endpoint: species/:speciesId, code/:code
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe for query params
- [x] PATCH instead of PUT
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 5 fields (code, nameFr, nameEn, nameAr, description)
- [x] Sort whitelist: nameFr, nameEn, code, displayOrder, createdAt
- [x] Default sort: displayOrder → nameFr
- [x] AppLogger throughout
- [x] Soft delete + restore
- [x] Dependency check (animals)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly (ternaries)
- [x] Restore on duplicate code in create()
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized method: findBySpecies, findByCode

### Documentation ✅
- [x] I18N_KEYS.md (21 keys)
- [x] TESTS_PLAN.md (75+ test cases, 9 endpoints)
- [x] BREEDS_MIGRATION_CHECKLIST.md

## Completion: 33/33 (100%) ✅

## Notes
- Depends on Species entity (FK relationship)
- Animals dependency check before delete
- Specialized findBySpecies uses composite index
- code and speciesId excluded from UpdateDto (immutable)
