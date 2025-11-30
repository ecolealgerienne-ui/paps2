# Product Packagings - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 10 | Test Cases: 80+

## Endpoints
1. POST /api/v1/product-packagings (create)
2. GET /api/v1/product-packagings (findAll + pagination + filters + search + sort)
3. GET /api/v1/product-packagings/scan/:gtin (findByGtin - barcode scanning)
4. GET /api/v1/product-packagings/product/:productId (findByProduct)
5. GET /api/v1/product-packagings/country/:countryCode (findByCountry)
6. GET /api/v1/product-packagings/:id (findOne)
7. PATCH /api/v1/product-packagings/:id (update)
8. DELETE /api/v1/product-packagings/:id (soft delete)
9. POST /api/v1/product-packagings/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid packaging with all fields (including volume, gtinEan, numeroAMM)
- Valid packaging with minimal fields (concentration, packagingLabel only)
- Packaging with mobile sync timestamps (created_at, updated_at)
- Missing required fields (productId, countryCode, concentration, packagingLabel) → 400
- Invalid productId → 404
- Invalid countryCode → 404
- Invalid concentration (negative) → 400
- Invalid volume (negative) → 400
- Duplicate [productId, countryCode, gtinEan] → 409
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Filters + Search + Sort)
- Default pagination (page 1, limit 50)
- Custom pagination (page 2, limit 20)
- Filter by productId
- Filter by countryCode
- Filter by gtinEan
- Filter by isActive (true/false)
- Search in 3 fields (packagingLabel, gtinEan, numeroAMM)
- Case-insensitive search
- Sort by packagingLabel, countryCode, concentration, gtinEan, createdAt
- Order ASC/DESC
- Default sort: packagingLabel ASC
- Combined filters (productId + countryCode + isActive + search)
- Empty results (no match)

### FINDBYPRODUCT
- Find all packagings for a product
- Returns empty array for product with no packagings
- Sorted by countryCode
- Only non-deleted packagings

### FINDBYCOUNTRY
- Find all active packagings in a country
- Only returns isActive=true
- Sorted by packagingLabel
- Returns empty array for country with no packagings

### FINDBYGTIN (Barcode Scanning)
- Find packaging by GTIN/EAN
- Not found → 404
- Soft-deleted → 404
- Case sensitivity check

### FINDONE (By ID)
- Find existing packaging
- Not found → 404
- Soft-deleted → 404

### UPDATE (Partial Updates)
- Update concentration and concentrationUnitId
- Update volume and volumeUnitId
- Update packagingLabel
- Update gtinEan (set/unset)
- Update numeroAMM (set/unset)
- Update isActive (toggle)
- Partial updates (only some fields)
- productId and countryCode cannot be updated (not in UpdateDto)
- Optimistic locking (version check)
- Version conflict → 409
- Mobile sync timestamp (updated_at)
- Not found → 404
- Unauthorized → 401/403

### DELETE (Soft Delete)
- Soft delete packaging
- Already deleted → 404
- Auth required → 401/403
- Returns deleted entity (not NO_CONTENT)

### RESTORE
- Restore soft-deleted packaging
- Not deleted → 409
- Not found → 404
- Auth required → 401/403

**Status**: ⚠️ Not implemented (MVP ready without tests)

## Special Considerations
- Mobile sync fields (created_at, updated_at) for offline scenarios
- GTIN/EAN barcode scanning workflow
- Unique constraint across [productId, countryCode, gtinEan]
- Multiple foreign key validations (product, country, units)
- Country-specific packaging variations
