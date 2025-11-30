# Therapeutic Indications Tests Plan

## Entity: TherapeuticIndication (10/16 - Phase 2)

---

## Endpoints

### POST /api/v1/therapeutic-indications
**Create a therapeutic indication (Admin only)**

- [ ] ✅ Should create indication with all required fields
- [ ] ✅ Should accept optional client-generated id
- [ ] ✅ Should set isVerified=false by default
- [ ] ✅ Should set isActive=true by default
- [ ] ✅ Should handle all optional fields (countryCode, ageCategoryId, doses, withdrawal milk)
- [ ] ✅ Should return 201 with indication data
- [ ] ❌ Should return 400 if productId is missing
- [ ] ❌ Should return 400 if speciesId is missing
- [ ] ❌ Should return 400 if routeId is missing
- [ ] ❌ Should return 400 if withdrawalMeatDays is missing
- [ ] ❌ Should return 400 if doseMin > doseMax
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if product doesn't exist
- [ ] ❌ Should return 404 if species doesn't exist
- [ ] ❌ Should return 404 if route doesn't exist
- [ ] ❌ Should return 409 if unique constraint violated

### GET /api/v1/therapeutic-indications
**Get all indications with filters and pagination**

- [ ] ✅ Should return paginated indications
- [ ] ✅ Should filter by productId
- [ ] ✅ Should filter by speciesId
- [ ] ✅ Should filter by countryCode
- [ ] ✅ Should filter by routeId
- [ ] ✅ Should filter by isVerified
- [ ] ✅ Should filter by isActive
- [ ] ✅ Should paginate (page, limit, default 50, max 100)
- [ ] ✅ Should return meta (total, page, limit, totalPages)
- [ ] ✅ Should sort by createdAt desc (default)
- [ ] ❌ Should exclude deletedAt indications

### GET /api/v1/therapeutic-indications/product/:productId
**Get indications for a product**

- [ ] ✅ Should return all indications for specified product
- [ ] ✅ Should only return active indications
- [ ] ✅ Should sort by createdAt asc
- [ ] ❌ Should exclude deletedAt indications
- [ ] ❌ Should return empty array if product has no indications
- [ ] ❌ Should return empty array if productId invalid

### GET /api/v1/therapeutic-indications/match
**Find best matching indication for treatment**

- [ ] ✅ Should return best matching indication using priority logic
- [ ] ✅ Should prioritize country+age specific
- [ ] ✅ Should fall back to country+all ages
- [ ] ✅ Should fall back to universal+age specific
- [ ] ✅ Should fall back to universal+all ages
- [ ] ✅ Should return null if no match found
- [ ] ✅ Should only consider active indications
- [ ] ❌ Should exclude deletedAt indications
- [ ] ❌ Should return 400 if productId missing
- [ ] ❌ Should return 400 if speciesId missing
- [ ] ❌ Should return 400 if routeId missing

### GET /api/v1/therapeutic-indications/:id
**Get indication by ID**

- [ ] ✅ Should return indication with specified ID
- [ ] ❌ Should return 404 if indication not found
- [ ] ❌ Should return 404 if indication is deleted

### PATCH /api/v1/therapeutic-indications/:id
**Update an indication (Admin only)**

- [ ] ✅ Should update indication fields
- [ ] ✅ Should increment version
- [ ] ✅ Should use ternaries for undefined fields
- [ ] ✅ Should support optimistic locking (version)
- [ ] ✅ Should return updated indication
- [ ] ❌ Should return 400 if validation fails
- [ ] ❌ Should return 400 if doseMin > doseMax
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if indication not found
- [ ] ❌ Should return 409 if version mismatch

### DELETE /api/v1/therapeutic-indications/:id
**Delete an indication (soft delete, Admin only)**

- [ ] ✅ Should set deletedAt timestamp
- [ ] ✅ Should increment version
- [ ] ✅ Should return deleted indication
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if indication not found
- [ ] ❌ Should return 409 if indication has treatments

### POST /api/v1/therapeutic-indications/:id/restore
**Restore a soft-deleted indication (Admin only)**

- [ ] ✅ Should restore deletedAt to null
- [ ] ✅ Should increment version
- [ ] ✅ Should return restored indication
- [ ] ❌ Should return 401 if not authenticated
- [ ] ❌ Should return 403 if not admin
- [ ] ❌ Should return 404 if indication not found
- [ ] ❌ Should return 409 if indication is not deleted

---

## Service-Level Tests

### Priority Matching Logic
- [ ] ✅ Priority 1: country + age category match
- [ ] ✅ Priority 2: country match, age category null
- [ ] ✅ Priority 3: country null, age category match
- [ ] ✅ Priority 4: country null, age category null (universal)
- [ ] ✅ Returns null if no match
- [ ] ✅ Only considers active indications
- [ ] ✅ Excludes deleted indications

### Universal Rules
- [ ] ✅ countryCode=null means applies to all countries
- [ ] ✅ ageCategoryId=null means applies to all ages
- [ ] ✅ Universal rules are lowest priority in matching

### Unique Constraint
- [ ] ✅ Cannot create duplicate [productId, countryCode, speciesId, ageCategoryId, routeId]
- [ ] ✅ Unique constraint allows null values in countryCode and ageCategoryId
- [ ] ❌ Should throw 409 on duplicate creation

### Dependency Checks
- [ ] ✅ Cannot delete if treatments exist
- [ ] ✅ Dependency count is accurate

### Optimistic Locking
- [ ] ✅ Version increments on update
- [ ] ✅ Version increments on delete
- [ ] ✅ Version increments on restore
- [ ] ✅ Version conflict throws 409

### Validation Logic
- [ ] ✅ withdrawalMeatDays is required
- [ ] ✅ withdrawalMilkDays is optional
- [ ] ✅ doseMin and doseMax are optional
- [ ] ✅ doseMax must be >= doseMin if both provided
- [ ] ✅ protocolDurationDays must be positive if provided

### Data Relationships
- [ ] ✅ Product must exist
- [ ] ✅ Species must exist
- [ ] ✅ Route must exist
- [ ] ✅ Country is optional (null for universal)
- [ ] ✅ AgeCategory is optional (null for all ages)
- [ ] ✅ DoseUnit is optional

---

## Summary

**Total Endpoints:** 8
**Total Test Cases:** 75+
**Coverage Areas:**
- ✅ CRUD operations (admin-only)
- ✅ Pagination and filtering
- ✅ Priority-based matching
- ✅ Universal rules (null country/age)
- ✅ Soft delete and restore
- ✅ Dependency checks (treatments)
- ✅ Optimistic locking
- ✅ Unique constraint validation
- ✅ Withdrawal times validation (critical)
- ✅ Guards (AuthGuard + AdminGuard)
- ✅ Validation and error handling

## Dependencies
- Depends on: Product, Species, AdministrationRoute (required), Country, AgeCategory, Unit (optional)
- Used by: Treatment
- Critical field: withdrawalMeatDays (food safety)

## Business Logic Notes
- Therapeutic indications define safe usage parameters for product/species/route combinations
- withdrawal times are critical for food safety compliance
- Priority matching enables flexible rule configuration (universal → specific)
- isVerified flag allows staged validation workflow
- doseOriginalText preserves regulatory source information
