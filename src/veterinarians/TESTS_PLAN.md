# Veterinarians Tests Plan

## Entity: Veterinarian (16/16 - Phase 3 - Scope Pattern)

---

## Farm-Scoped Endpoints (Local Veterinarians)

### POST /api/v1/farms/:farmId/veterinarians
**Create a local veterinarian for a farm**

- [ ] ✅ Should create veterinarian with scope=local
- [ ] ✅ Should auto-assign farmId
- [ ] ✅ Should accept optional client-generated id
- [ ] ✅ Should set isActive=true by default
- [ ] ✅ Should set isDefault=false by default
- [ ] ✅ Should handle all optional fields
- [ ] ✅ Should return 201 with veterinarian data
- [ ] ❌ Should return 400 if firstName is missing
- [ ] ❌ Should return 400 if lastName is missing
- [ ] ❌ Should return 400 if phone is missing
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated

### GET /api/v1/farms/:farmId/veterinarians
**Get all veterinarians with pagination, filters, search, sorting**

- [ ] ✅ Should return paginated veterinarians (global + local)
- [ ] ✅ Should filter by scope (global/local/all, default: all)
- [ ] ✅ Should filter by department
- [ ] ✅ Should filter by isActive
- [ ] ✅ Should filter by isAvailable
- [ ] ✅ Should filter by emergencyService
- [ ] ✅ Should search in firstName/lastName
- [ ] ✅ Should sort by lastName (default)
- [ ] ✅ Should sort by firstName, createdAt
- [ ] ✅ Should paginate (page, limit, default 50, max 100)
- [ ] ✅ Should return meta (total, page, limit, totalPages)
- [ ] ❌ Should exclude deletedAt veterinarians

### GET /api/v1/farms/:farmId/veterinarians/active
**Get active veterinarians for a farm (convenience endpoint)**

- [ ] ✅ Should return only active veterinarians
- [ ] ✅ Should return global + farm's local veterinarians
- [ ] ❌ Should exclude deletedAt veterinarians

### GET /api/v1/farms/:farmId/veterinarians/default
**Get default veterinarian for a farm**

- [ ] ✅ Should return the default veterinarian
- [ ] ✅ Should return null if no default set
- [ ] ❌ Should exclude deletedAt veterinarians

### GET /api/v1/farms/:farmId/veterinarians/:id
**Get a veterinarian by ID (farm-scoped)**

- [ ] ✅ Should return global veterinarian
- [ ] ✅ Should return farm's local veterinarian
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian belongs to other farm

### PATCH /api/v1/farms/:farmId/veterinarians/:id
**Update a local veterinarian**

- [ ] ✅ Should update local veterinarian fields
- [ ] ✅ Should increment version
- [ ] ✅ Should use ternaries for undefined fields
- [ ] ✅ Should support optimistic locking (version)
- [ ] ✅ Should return updated veterinarian
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if trying to update global veterinarian
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian belongs to other farm
- [ ] ❌ Should return 409 if version mismatch

### DELETE /api/v1/farms/:farmId/veterinarians/:id
**Soft delete a local veterinarian**

- [ ] ✅ Should set deletedAt timestamp
- [ ] ✅ Should increment version
- [ ] ✅ Should return deleted veterinarian
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if trying to delete global veterinarian
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian belongs to other farm
- [ ] ❌ Should return 409 if veterinarian has treatments

### POST /api/v1/farms/:farmId/veterinarians/:id/restore
**Restore a soft-deleted local veterinarian**

- [ ] ✅ Should restore deletedAt to null
- [ ] ✅ Should increment version
- [ ] ✅ Should return restored veterinarian
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian belongs to other farm
- [ ] ❌ Should return 409 if veterinarian is not deleted

### PATCH /api/v1/farms/:farmId/veterinarians/:id/set-default
**Set a veterinarian as default for the farm**

- [ ] ✅ Should set isDefault=true on specified veterinarian
- [ ] ✅ Should set isDefault=false on previous default
- [ ] ✅ Should return updated veterinarian
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian belongs to other farm

---

## Global Endpoints (Admin)

### GET /api/v1/veterinarians
**Get all global veterinarians**

- [ ] ✅ Should return paginated global veterinarians
- [ ] ✅ Should support all filters (department, isActive, isAvailable, emergencyService)
- [ ] ✅ Should support search
- [ ] ✅ Should support sorting
- [ ] ✅ Should return pagination meta
- [ ] ❌ Should exclude deletedAt veterinarians

### GET /api/v1/veterinarians/search/department/:dept
**Search global veterinarians by department (discovery endpoint)**

- [ ] ✅ Should return veterinarians in specified department
- [ ] ✅ Should only return global veterinarians
- [ ] ✅ Should only return active veterinarians
- [ ] ❌ Should exclude deletedAt veterinarians
- [ ] ❌ Should return empty array if department not found

### GET /api/v1/veterinarians/:id
**Get a global veterinarian by ID**

- [ ] ✅ Should return global veterinarian
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian is local

### POST /api/v1/admin/veterinarians
**Create a global veterinarian (Admin only)**

- [ ] ✅ Should create veterinarian with scope=global
- [ ] ✅ Should set farmId=null
- [ ] ✅ Should require licenseNumber
- [ ] ✅ Should require department
- [ ] ✅ Should return 201 with veterinarian data
- [ ] ❌ Should return 400 if licenseNumber is missing
- [ ] ❌ Should return 400 if department is missing
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin

### POST /api/v1/admin/veterinarians/:id/restore
**Restore a soft-deleted global veterinarian (Admin only)**

- [ ] ✅ Should restore global veterinarian
- [ ] ✅ Should increment version
- [ ] ✅ Should return restored veterinarian
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if veterinarian not found
- [ ] ❌ Should return 404 if veterinarian is local
- [ ] ❌ Should return 409 if veterinarian is not deleted

---

## Service-Level Tests

### Scope Logic
- [ ] ✅ Farm queries return global + farm's local veterinarians
- [ ] ✅ Global queries return only global veterinarians
- [ ] ✅ Local veterinarians are isolated by farm
- [ ] ✅ Scope filter works correctly (global/local/all)

### Search Logic
- [ ] ✅ Search combines firstName and lastName with OR
- [ ] ✅ Search is case-insensitive
- [ ] ✅ Search uses contains/startsWith

### Dependency Checks
- [ ] ✅ Cannot delete if treatments exist
- [ ] ✅ Dependency count is accurate

### Optimistic Locking
- [ ] ✅ Version increments on update
- [ ] ✅ Version increments on delete
- [ ] ✅ Version increments on restore
- [ ] ✅ Version increments on setDefault
- [ ] ✅ Version conflict throws 409

### Default Veterinarian Logic
- [ ] ✅ Only one veterinarian can be default per farm
- [ ] ✅ setDefault clears previous default
- [ ] ✅ findDefault returns correct veterinarian
- [ ] ✅ isDefault persists across updates

### Department Search
- [ ] ✅ findByDepartment returns global veterinarians
- [ ] ✅ findByDepartment filters by department code
- [ ] ✅ findByDepartment excludes inactive/deleted

---

## Summary

**Total Endpoints:** 14 (9 farm-scoped + 5 global)
**Total Test Cases:** 100+
**Coverage Areas:**
- ✅ CRUD operations (dual: farm + admin)
- ✅ Scope pattern (global vs local)
- ✅ Pagination and filtering
- ✅ Search (name-based)
- ✅ Soft delete and restore
- ✅ Dependency checks (treatments)
- ✅ Optimistic locking
- ✅ Default veterinarian management
- ✅ Department-based discovery
- ✅ Guards (AuthGuard + AdminGuard)
- ✅ Validation and error handling

## Dependencies
- Depends on: None (independent entity)
- Used by: Treatment, FarmVeterinarianPreference
- Special: Department search enables discovery of global veterinarians
