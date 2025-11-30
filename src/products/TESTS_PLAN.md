# Products Tests Plan

## Entity: Product (15/16 - Phase 3 - Scope Pattern)

---

## Farm-Scoped Endpoints (Local Products)

### POST /api/v1/farms/:farmId/products
**Create a local product for a farm**

- [ ] ✅ Should create product with scope=local
- [ ] ✅ Should auto-assign farmId
- [ ] ✅ Should accept optional client-generated id
- [ ] ✅ Should set isActive=true by default
- [ ] ✅ Should handle all optional fields
- [ ] ✅ Should return 201 with product data
- [ ] ❌ Should return 400 if nameFr is missing
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 404 if category doesn't exist
- [ ] ❌ Should return 404 if substance doesn't exist

### GET /api/v1/farms/:farmId/products
**Get all products with pagination, filters, search, sorting**

- [ ] ✅ Should return paginated products (global + local)
- [ ] ✅ Should filter by scope (global/local/all, default: all)
- [ ] ✅ Should filter by type
- [ ] ✅ Should filter by categoryId
- [ ] ✅ Should filter by isActive
- [ ] ✅ Should filter vaccinesOnly
- [ ] ✅ Should search in nameFr/nameEn/nameAr/commercialName/manufacturer
- [ ] ✅ Should sort by nameFr (default)
- [ ] ✅ Should sort by createdAt
- [ ] ✅ Should paginate (page, limit, default 50, max 100)
- [ ] ✅ Should return meta (total, page, limit, totalPages)
- [ ] ✅ Should include category and substance relations
- [ ] ❌ Should exclude deletedAt products

### GET /api/v1/farms/:farmId/products/vaccines
**Get vaccines for a farm (convenience endpoint)**

- [ ] ✅ Should return only vaccines
- [ ] ✅ Should support pagination
- [ ] ✅ Should return global + local vaccines
- [ ] ❌ Should exclude deletedAt products

### GET /api/v1/farms/:farmId/products/search
**Search products by name (autocomplete)**

- [ ] ✅ Should search in nameFr/nameEn/nameAr/commercialName
- [ ] ✅ Should limit results (default 10)
- [ ] ✅ Should return matching products
- [ ] ❌ Should exclude deletedAt products
- [ ] ❌ Should return 400 if term is missing

### GET /api/v1/farms/:farmId/products/type/:type
**Get products by type**

- [ ] ✅ Should return products of specified type
- [ ] ✅ Should return global + local products
- [ ] ❌ Should exclude deletedAt products
- [ ] ❌ Should return 400 if type is invalid

### GET /api/v1/farms/:farmId/products/:id
**Get a product by ID (farm-scoped)**

- [ ] ✅ Should return global product
- [ ] ✅ Should return farm's local product
- [ ] ✅ Should include category and substance
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product belongs to other farm

### PATCH /api/v1/farms/:farmId/products/:id
**Update a local product**

- [ ] ✅ Should update local product fields
- [ ] ✅ Should increment version
- [ ] ✅ Should use ternaries for undefined fields
- [ ] ✅ Should support optimistic locking (version)
- [ ] ✅ Should return updated product
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if trying to update global product
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product belongs to other farm
- [ ] ❌ Should return 409 if version mismatch

### DELETE /api/v1/farms/:farmId/products/:id
**Soft delete a local product**

- [ ] ✅ Should set deletedAt timestamp
- [ ] ✅ Should increment version
- [ ] ✅ Should return deleted product
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if trying to delete global product
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product belongs to other farm
- [ ] ❌ Should return 409 if product has therapeutic indications
- [ ] ❌ Should return 409 if product has lots

### POST /api/v1/farms/:farmId/products/:id/restore
**Restore a soft-deleted local product**

- [ ] ✅ Should restore deletedAt to null
- [ ] ✅ Should increment version
- [ ] ✅ Should return restored product
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product belongs to other farm
- [ ] ❌ Should return 409 if product is not deleted

---

## Global Endpoints (Admin)

### GET /api/v1/products
**Get all global products**

- [ ] ✅ Should return paginated global products
- [ ] ✅ Should support all filters (type, categoryId, isActive, vaccinesOnly)
- [ ] ✅ Should support search
- [ ] ✅ Should support sorting
- [ ] ✅ Should return pagination meta
- [ ] ❌ Should exclude deletedAt products

### GET /api/v1/products/search
**Search global products**

- [ ] ✅ Should search in names and commercialName
- [ ] ✅ Should limit results
- [ ] ❌ Should exclude deletedAt products

### GET /api/v1/products/:id
**Get a global product by ID**

- [ ] ✅ Should return global product
- [ ] ✅ Should include relations
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product is local

### POST /api/v1/admin/products
**Create a global product (Admin only)**

- [ ] ✅ Should create product with scope=global
- [ ] ✅ Should set farmId=null
- [ ] ✅ Should require code (unique)
- [ ] ✅ Should restore if code exists but deletedAt set
- [ ] ✅ Should return 201 with product data
- [ ] ❌ Should return 400 if code is missing
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 409 if code already exists (not deleted)

### POST /api/v1/admin/products/:id/restore
**Restore a soft-deleted global product (Admin only)**

- [ ] ✅ Should restore global product
- [ ] ✅ Should increment version
- [ ] ✅ Should return restored product
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if product not found
- [ ] ❌ Should return 404 if product is local
- [ ] ❌ Should return 409 if product is not deleted

---

## Service-Level Tests

### Scope Logic
- [ ] ✅ Farm queries return global + farm's local products
- [ ] ✅ Global queries return only global products
- [ ] ✅ Local products are isolated by farm
- [ ] ✅ Scope filter works correctly (global/local/all)

### Search Logic
- [ ] ✅ Search combines multiple fields with OR
- [ ] ✅ Search is case-insensitive
- [ ] ✅ Search works in Fr/En/Ar/commercialName/manufacturer

### Dependency Checks
- [ ] ✅ Cannot delete if therapeutic indications exist
- [ ] ✅ Cannot delete if lots exist
- [ ] ✅ Dependency count is accurate

### Optimistic Locking
- [ ] ✅ Version increments on update
- [ ] ✅ Version increments on delete
- [ ] ✅ Version increments on restore
- [ ] ✅ Version conflict throws 409

### Restore on Duplicate
- [ ] ✅ createGlobal restores if code exists but deleted
- [ ] ✅ createGlobal updates all fields on restore
- [ ] ✅ createGlobal creates new if code doesn't exist
- [ ] ✅ createGlobal throws 409 if code exists and not deleted

---

## Summary

**Total Endpoints:** 14 (9 farm-scoped + 5 global)
**Total Test Cases:** 95+
**Coverage Areas:**
- ✅ CRUD operations (dual: farm + admin)
- ✅ Scope pattern (global vs local)
- ✅ Pagination and filtering
- ✅ Search and autocomplete
- ✅ Soft delete and restore
- ✅ Dependency checks
- ✅ Optimistic locking
- ✅ Restore on duplicate
- ✅ Guards (AuthGuard + AdminGuard)
- ✅ Validation and error handling

## Dependencies
- Depends on: ProductCategory, ActiveSubstance (optional relations)
- Used by: TherapeuticIndication, Treatment, FarmerProductLot
