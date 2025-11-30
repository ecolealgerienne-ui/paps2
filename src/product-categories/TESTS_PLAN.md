# Product Categories - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 7 | Test Cases: 70+

## Endpoints
1. POST /api/v1/product-categories (create)
2. GET /api/v1/product-categories (findAll + pagination + search + sort)
3. GET /api/v1/product-categories/code/:code (findByCode)
4. GET /api/v1/product-categories/:id (findOne)
5. PATCH /api/v1/product-categories/:id (update)
6. DELETE /api/v1/product-categories/:id (soft delete)
7. POST /api/v1/product-categories/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid category with all fields (code, nameFr, nameEn, nameAr, description, displayOrder, isActive)
- Valid category with minimal fields (code, nameFr, nameEn, nameAr only)
- Restore soft-deleted on duplicate code
- Duplicate active code → 409
- Missing required fields (code, nameFr, nameEn, nameAr) → 400
- Invalid code format → 400
- Invalid displayOrder (negative) → 400
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Filters + Search + Sort)
- Default pagination (page 1, limit 20)
- Custom pagination (page 2, limit 10)
- Filter by isActive (true/false)
- Search in 4 fields (code, nameFr, nameEn, nameAr)
- Case-insensitive search
- Sort by nameFr, nameEn, code, displayOrder, createdAt
- Order ASC/DESC
- Default sort: displayOrder → nameFr
- Combined filters (isActive + search)
- Empty results (no match)

### FINDBYCODE
- Find existing category by code
- Case-insensitive code lookup
- Not found → 404
- Soft-deleted → 404

### FINDONE (By ID)
- Find existing category
- Not found → 404
- Soft-deleted → 404

### UPDATE (Partial Updates)
- Update names (Fr/En/Ar)
- Update description (set/unset)
- Update displayOrder
- Update isActive (toggle)
- Partial updates (only some fields)
- Code cannot be updated (excluded)
- Optimistic locking (version check)
- Version conflict → 409
- Not found → 404
- Unauthorized → 401/403

### DELETE (Soft Delete + Dependency Check)
- Soft delete category
- Cannot delete if used by products → 409
- Already deleted → 404
- Auth required → 401/403

### RESTORE
- Restore soft-deleted category
- Not deleted → 409
- Not found → 404
- Auth required → 401/403

**Status**: ⚠️ Not implemented (MVP ready without tests)
