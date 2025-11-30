# Active Substances - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 7 | Test Cases: 70+

## Endpoints
1. POST /api/v1/active-substances (create)
2. GET /api/v1/active-substances (findAll + pagination + search + sort)
3. GET /api/v1/active-substances/code/:code (findByCode)
4. GET /api/v1/active-substances/:id (findOne)
5. PATCH /api/v1/active-substances/:id (update)
6. DELETE /api/v1/active-substances/:id (soft delete)
7. POST /api/v1/active-substances/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid substance with all fields (including atcCode)
- Valid substance with minimal fields (code, name only)
- Restore soft-deleted on duplicate code
- Duplicate active code → 409
- Missing required fields (code, name) → 400
- Invalid code format → 400
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Filters + Search + Sort)
- Default pagination (page 1, limit 20)
- Custom pagination (page 2, limit 10)
- Filter by isActive (true/false)
- Search in 5 fields (code, name, nameFr/En/Ar)
- Case-insensitive search
- Sort by name, code, atcCode, createdAt
- Order ASC/DESC
- Default sort: name ASC
- Combined filters (isActive + search)
- Empty results (no match)

### FINDBYCODE
- Find existing substance by code
- Case-insensitive code lookup
- Not found → 404
- Soft-deleted → 404

### FINDONE (By ID)
- Find existing substance
- Not found → 404
- Soft-deleted → 404

### UPDATE (Partial Updates)
- Update name (international DCI)
- Update names (Fr/En/Ar)
- Update atcCode (set/unset)
- Update description (set/unset)
- Update isActive (toggle)
- Partial updates (only some fields)
- Code cannot be updated (excluded)
- Optimistic locking (version check)
- Version conflict → 409
- Not found → 404
- Unauthorized → 401/403

### DELETE (Soft Delete + Dependency Check)
- Soft delete substance
- Cannot delete if used by products → 409
- Already deleted → 404
- Auth required → 401/403

### RESTORE
- Restore soft-deleted substance
- Not deleted → 409
- Not found → 404
- Auth required → 401/403

**Status**: ⚠️ Not implemented (MVP ready without tests)
