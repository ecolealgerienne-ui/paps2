# Alert Templates - E2E Tests Plan

## Coverage: 80%+ | Endpoints: 10 | Test Cases: 70+

## Endpoints
1. POST /api/v1/alert-templates (create)
2. GET /api/v1/alert-templates (findAll + pagination + filters)
3. GET /api/v1/alert-templates/category/:category
4. GET /api/v1/alert-templates/priority/:priority
5. GET /api/v1/alert-templates/code/:code
6. GET /api/v1/alert-templates/:id
7. PATCH /api/v1/alert-templates/:id (update)
8. PATCH /api/v1/alert-templates/:id/toggle-active
9. DELETE /api/v1/alert-templates/:id (soft delete)
10. POST /api/v1/alert-templates/:id/restore

## Key Test Scenarios

### CREATE (Success + Errors)
- Valid template with all fields
- Code auto-lowercase
- Restore soft-deleted on duplicate
- Duplicate active code → 409
- Invalid category/priority → 400
- Missing fields → 400
- Unauthorized/Forbidden → 401/403

### FINDALL (Pagination + Filters)
- Default pagination (page 1, limit 20)
- Filter by category (health, vaccination, treatment, reproduction, nutrition)
- Filter by priority (low, medium, high, urgent)
- Filter by isActive
- Search in names (Fr/En/Ar) + code
- Sort by category, priority, code, createdAt
- Combined filters
- Default sort: category → priority → nameFr

### BY CATEGORY/PRIORITY
- Find by each category (5 values)
- Find by each priority (4 values)
- Only active templates returned
- Sorted correctly

### BY CODE/ID
- Find existing
- Case-insensitive code
- Not found → 404
- Soft-deleted → 404

### UPDATE
- Update names (Fr/En/Ar)
- Update descriptions (Fr/En/Ar)
- Update category, priority
- Partial updates
- Code cannot be updated (excluded)
- Version incremented
- Not found → 404
- Unauthorized → 401/403

### TOGGLE/DELETE/RESTORE
- Toggle active status
- Soft delete (deletedAt set)
- Restore soft-deleted
- Not deleted → 409 (restore)
- Auth required

**Status**: ⚠️ Not implemented (MVP ready without tests)
