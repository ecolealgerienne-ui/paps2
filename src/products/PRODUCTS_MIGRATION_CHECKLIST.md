# Products Migration Checklist

## Entity: Product (15/16 - Phase 3 - Scope Pattern)

### Schema ✅
- [x] 17 fields: id, scope, farmId, code, nameFr, nameEn, nameAr, commercialName, description, type, categoryId, substanceId, atcVetCode, manufacturer, form, targetDisease, immunityDurationDays, notes, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: farm (FK), category (FK), substance (FK), therapeuticIndications, farmerProductLots
- [x] Indexes: scope, farmId, code (unique), type, categoryId, substanceId, isActive, deletedAt
- [x] Scope pattern: DataScope enum (global/local)

### DTOs ✅
- [x] CreateProductDto (local, full validation)
- [x] CreateGlobalProductDto (admin, requires code)
- [x] UpdateProductDto (excludes scope/farmId/code, includes version)
- [x] ProductResponseDto (all fields, nullable types as `| null`)
- [x] Nested DTOs: ProductCategoryInfo, ActiveSubstanceInfo
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1` (dual structure)
- [x] 14 endpoints total (9 farm-scoped + 5 global)
- [x] Guards: AuthGuard on create/update/delete/restore
- [x] Guards: AuthGuard + AdminGuard on admin endpoints
- [x] Pagination query params (page, limit)
- [x] Filter query params (scope, type, categoryId, isActive, vaccinesOnly)
- [x] Search query param
- [x] Sort query params (sort, order)
- [x] Specialized endpoints: vaccines, search, type/:type
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe/ParseEnumPipe for query params
- [x] PATCH instead of PUT
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 5 fields (nameFr, nameEn, nameAr, commercialName, manufacturer)
- [x] Sort whitelist: nameFr, nameEn, nameAr, commercialName, createdAt
- [x] Default sort: nameFr
- [x] AppLogger throughout (existing)
- [x] Soft delete + restore (dual: farm + admin)
- [x] Dependency check (therapeuticIndications, farmerProductLots)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly (ternaries)
- [x] Restore on duplicate code in createGlobal()
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findVaccines, search, searchGlobal, findByType

### Scope Pattern ✅
- [x] Dual create: create() for local, createGlobal() for admin
- [x] Dual findAll: findAll(farmId) and findAllGlobal()
- [x] Dual restore: restore(farmId) and restoreGlobal()
- [x] Scope-aware queries (global + farm's local)
- [x] Global products: code required and unique, farmId=null
- [x] Local products: code optional, farmId set
- [x] Cannot modify/delete global products from farm endpoints

### Documentation ✅
- [x] I18N_KEYS.md (63 keys)
- [x] TESTS_PLAN.md (95+ test cases, 14 endpoints)
- [x] PRODUCTS_MIGRATION_CHECKLIST.md

## Completion: 36/36 (100%) ✅

## Notes
- Scope pattern with dual endpoint structure
- code is unique constraint but nullable (required only for global)
- Products can be vaccines (special handling)
- Dependency checks prevent deletion if used in therapeuticIndications or lots
- Restore on duplicate: if createGlobal() tries to create with existing code that's soft-deleted, it restores instead
- Farm-scoped endpoints: /api/v1/farms/:farmId/products/*
- Global endpoints: /api/v1/products/* and /api/v1/admin/products/*
