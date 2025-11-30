# Active Substances Migration Checklist

## Entity: ActiveSubstance (7/16 - Phase 2)

### Schema ✅
- [x] 9 fields: id, code, name, nameFr, nameEn, nameAr, atcCode, description, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: products
- [x] Indexes: code, atcCode

### DTOs ✅
- [x] CreateActiveSubstanceDto (full validation)
- [x] UpdateActiveSubstanceDto (partial, excludes code, includes version)
- [x] ActiveSubstanceResponseDto (all fields, nullable types as `| null`)
- [x] Removed QueryActiveSubstanceDto (replaced with query params)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/active-substances`
- [x] 7 endpoints total
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe for query params

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 5 fields (code, name, nameFr, nameEn, nameAr)
- [x] Sort whitelist: name, code, atcCode, createdAt
- [x] Default sort: name ASC
- [x] AppLogger throughout
- [x] Soft delete + restore
- [x] Dependency check (products)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly
- [x] Restore on duplicate code in create()
- [x] Proper Prisma types imported

### Documentation ✅
- [x] I18N_KEYS.md (18 keys)
- [x] TESTS_PLAN.md (70+ test cases, 7 endpoints)
- [x] ACTIVE_SUBSTANCES_MIGRATION_CHECKLIST.md

## Completion: 33/33 (100%) ✅
