# Species - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 5 | Test Cases: 60+

## Endpoints
1. POST /api/v1/species (create)
2. GET /api/v1/species (findAll + pagination + search + sort)
3. GET /api/v1/species/:id (findOne)
4. PATCH /api/v1/species/:id (update)
5. DELETE /api/v1/species/:id (soft delete)
6. POST /api/v1/species/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid species with all fields (including scientificName)
- Restore soft-deleted on duplicate id
- Duplicate active id → 409
- Missing required fields (id, nameFr, nameEn, nameAr) → 400
- Invalid id format (special characters) → 400
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Search + Sort)
- Default pagination (page 1, limit 20)
- Custom pagination (page 2, limit 10)
- Search in names (Fr/En/Ar) + scientificName
- Case-insensitive search
- Sort by nameFr, nameEn, id, displayOrder, createdAt
- Order ASC/DESC
- Default sort: displayOrder → nameFr
- Empty results (no match)

### FINDONE (By ID)
- Find existing species
- Not found → 404
- Soft-deleted → 404

### UPDATE (Partial Updates)
- Update names (Fr/En/Ar)
- Update icon
- Update displayOrder
- Update description (set/unset)
- Update scientificName (set/unset)
- Partial updates (only some fields)
- Optimistic locking (version check)
- Version conflict → 409
- Not found → 404
- Unauthorized → 401/403

### DELETE (Soft Delete)
- Soft delete species
- Cannot delete if used by breeds → 409
- Already deleted → 404
- Auth required → 401/403

### RESTORE
- Restore soft-deleted species
- Not deleted → 409
- Not found → 404
- Auth required → 401/403

**Status**: ⚠️ Not implemented (MVP ready without tests)
