# Countries Migration Checklist

## Entity: Country (1/16 - Phase 1)

### Schema ✅
- [x] 7 fields: code (PK), nameFr, nameEn, nameAr, region, isActive, createdAt, updatedAt
- [x] No version (no optimistic locking needed - simple reference data)
- [x] No deletedAt (no soft delete - countries are permanent reference data)
- [x] Relations: breedCountries, campaignCountries, productPackagings, therapeuticIndications
- [x] Indexes: code (PK), isActive, region
- [x] Unique constraint: code (ISO 3166-1 alpha-2)

### DTOs ✅
- [x] CreateCountryDto (full validation, code uppercase)
- [x] UpdateCountryDto (excludes code - immutable)
- [x] CountryResponseDto (all fields, nullable types as `| null`)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/countries`
- [x] 6 endpoints total
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE
- [x] Pagination query params (page, limit)
- [x] Filter query params (region, isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe for query params
- [x] PATCH instead of PUT
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 4 fields (nameFr, nameEn, nameAr, code)
- [x] Sort whitelist: nameFr, nameEn, nameAr, code, region
- [x] Default sort: nameFr
- [x] No AppLogger (simple entity, using default NestJS logger)
- [x] No soft delete (permanent reference data)
- [x] Dependency check (breedCountries, campaignCountries, productPackagings, therapeuticIndications)
- [x] No optimistic locking (no version field - simple reference data)
- [x] update() handles undefined properly (ternaries)
- [x] No restore on duplicate (no soft delete)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized method: findByCode

### Special Characteristics ✅
- [x] Code is immutable (excluded from UpdateDto)
- [x] Code is forced uppercase (ISO 3166-1 alpha-2)
- [x] No version/deletedAt (permanent reference data)
- [x] Region is optional nullable field

### Documentation ✅
- [x] I18N_KEYS.md (already exists)
- [x] TESTS_PLAN.md (already exists)
- [x] COUNTRIES_MIGRATION_CHECKLIST.md

## Completion Status

### Implemented: 33/33 (100%) ✅

**All Requirements Met:**
- ✅ Dependency check in remove() - verifies breedCountries, campaignCountries, productPackagings, therapeuticIndications
- ⚠️ AppLogger intentionally omitted (simple entity, using default NestJS logger)
- ⚠️ No restore method (N/A - no soft delete, permanent reference data)

**Notes:**
- Countries is a simple reference data entity
- No soft delete by design (countries are permanent)
- No optimistic locking (no concurrent modification expected)
- Code is immutable after creation
- Dependency check is CRITICAL before allowing deletion

## Migration Complete ✅

This entity meets all 33 points of the standard migration checklist. Countries is a simple reference data entity with no soft delete, following the permanent reference data pattern.
