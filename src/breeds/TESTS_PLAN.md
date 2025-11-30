# Breeds - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 9 | Test Cases: 75+

## Endpoints
1. POST /api/v1/breeds (create)
2. GET /api/v1/breeds (findAll + pagination + filters + search + sort)
3. GET /api/v1/breeds/species/:speciesId (findBySpecies)
4. GET /api/v1/breeds/code/:code (findByCode)
5. GET /api/v1/breeds/:id (findOne)
6. PATCH /api/v1/breeds/:id (update)
7. DELETE /api/v1/breeds/:id (soft delete)
8. POST /api/v1/breeds/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid breed with all fields
- Valid breed with minimal fields (code, speciesId, names only)
- Restore soft-deleted on duplicate code
- Duplicate active code → 409
- Missing required fields (code, speciesId, names) → 400
- Invalid speciesId → 404 (FK constraint)
- Invalid displayOrder (negative) → 400
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Filters + Search + Sort)
- Default pagination (page 1, limit 20)
- Custom pagination (page 2, limit 10)
- Filter by speciesId
- Filter by isActive (true/false)
- Search in 5 fields (code, nameFr, nameEn, nameAr, description)
- Case-insensitive search
- Sort by nameFr, nameEn, code, displayOrder, createdAt
- Order ASC/DESC
- Default sort: displayOrder → nameFr
- Combined filters (speciesId + isActive + search)
- Empty results (no match)

### FINDBYSPECIES
- Find all breeds for a species
- Filter activeOnly=true (default)
- Filter activeOnly=false
- Sorted by displayOrder → nameFr
- Only non-deleted breeds

### FINDBYCODE
- Find existing breed by code
- Case-insensitive code lookup
- Not found → 404
- Soft-deleted → 404

### FINDONE (By ID)
- Find existing breed
- Not found → 404
- Soft-deleted → 404

### UPDATE (Partial Updates)
- Update names (Fr/En/Ar)
- Update description (set/unset)
- Update displayOrder
- Update isActive (toggle)
- Partial updates (only some fields)
- code and speciesId cannot be updated (excluded)
- Optimistic locking (version check)
- Version conflict → 409
- Not found → 404
- Unauthorized → 401/403

### DELETE (Soft Delete + Dependency Check)
- Soft delete breed
- Cannot delete if used by animals → 409
- Already deleted → 404
- Auth required → 401/403
- Returns deleted entity

### RESTORE
- Restore soft-deleted breed
- Not deleted → 409
- Not found → 404
- Auth required → 401/403

**Status**: ⚠️ Not implemented (MVP ready without tests)

## Special Considerations
- Dependency on Species entity (FK)
- Dependency check: Animals relation
- Species-specific filtering (findBySpecies)
- Composite index usage for performance
