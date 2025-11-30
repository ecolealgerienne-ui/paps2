# Product Packagings Migration Checklist

## Entity: ProductPackaging (10/16 - Phase 2)

### Schema ✅
- [x] 11 fields: id, productId, countryCode, concentration, concentrationUnitId, volume, volumeUnitId, packagingLabel, gtinEan, numeroAMM, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: product, country, concentrationUnit, volumeUnit, treatments, farmPreferences
- [x] Unique constraint: [productId, countryCode, gtinEan]
- [x] Indexes: productId, countryCode

### DTOs ✅
- [x] CreateProductPackagingDto (full validation, mobile sync fields)
- [x] UpdateProductPackagingDto (excludes productId/countryCode, includes version, mobile sync)
- [x] ProductPackagingResponseDto (all fields, nullable types as `| null`)
- [x] Removed custom id field from CreateDto
- [x] Removed QueryProductPackagingDto (replaced with query params)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/product-packagings`
- [x] 10 endpoints total (including specialized)
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (productId, countryCode, gtinEan, isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Specialized endpoints: scan/:gtin, product/:productId, country/:countryCode
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe for query params
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 3 fields (packagingLabel, gtinEan, numeroAMM)
- [x] Sort whitelist: packagingLabel, countryCode, concentration, gtinEan, createdAt
- [x] Default sort: packagingLabel ASC
- [x] AppLogger throughout
- [x] Soft delete + restore
- [x] Optimistic locking (version)
- [x] update() handles undefined properly (ternaries)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findByProduct, findByCountry, findByGtin
- [x] Mobile sync support (created_at, updated_at)

### Documentation ✅
- [x] I18N_KEYS.md (24 keys)
- [x] TESTS_PLAN.md (80+ test cases, 10 endpoints)
- [x] PRODUCT_PACKAGINGS_MIGRATION_CHECKLIST.md

## Completion: 36/36 (100%) ✅

## Notes
- Mobile sync fields (created_at, updated_at) preserved for offline scenarios
- Specialized endpoints maintained for barcode scanning and filtering
- productId and countryCode excluded from UpdateDto (part of unique constraint)
- No dependency check needed for delete (packagings are leaf entities in most contexts)
