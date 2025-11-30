# Age Categories - E2E Tests Plan

## Test Coverage Requirements

**Target**: Minimum 80% coverage for age-categories module

---

## 1. CREATE Age Category (POST /api/v1/age-categories)

### ✅ Success Cases
- **Test**: Create age category with valid data
  - **Given**: Valid CreateAgeCategoryDto (code: "ADULT", speciesId, names fr/en/ar, ageMinDays, ageMaxDays)
  - **When**: POST /api/v1/age-categories with admin auth
  - **Then**: Returns 201, age category created with uppercase code

- **Test**: Create age category without optional fields
  - **Given**: CreateAgeCategoryDto with only required fields (no description, no ageMaxDays)
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 201, displayOrder defaults to 0, isDefault defaults to false, isActive defaults to true

- **Test**: Create age category with description
  - **Given**: CreateAgeCategoryDto with description field
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 201, description saved correctly

### ❌ Error Cases
- **Test**: Create duplicate age category (same code + species)
  - **Given**: Age category "ADULT" already exists for species "bovine"
  - **When**: POST /api/v1/age-categories with code "ADULT" for species "bovine"
  - **Then**: Returns 409 Conflict

- **Test**: Create with invalid code format
  - **Given**: CreateAgeCategoryDto with code "adult-test" (lowercase + dash)
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 400 Bad Request (validation error)

- **Test**: Create with non-existent species
  - **Given**: CreateAgeCategoryDto with speciesId "invalid-uuid"
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 404 Not Found

- **Test**: Create without authentication
  - **Given**: No Bearer token
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 401 Unauthorized

- **Test**: Create without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 403 Forbidden

- **Test**: Create with missing required fields
  - **Given**: CreateAgeCategoryDto without nameFr
  - **When**: POST /api/v1/age-categories
  - **Then**: Returns 400 with validation errors

---

## 2. GET ALL Age Categories (GET /api/v1/age-categories)

### ✅ Success Cases
- **Test**: Get all age categories with default pagination
  - **Given**: 50 age categories in database
  - **When**: GET /api/v1/age-categories
  - **Then**: Returns 200, data array (max 20), meta (total: 50, page: 1, pages: 3)

- **Test**: Get age categories page 2
  - **Given**: 50 age categories in database
  - **When**: GET /api/v1/age-categories?page=2&limit=10
  - **Then**: Returns 200, 10 categories, meta (page: 2, pages: 5)

- **Test**: Filter by species
  - **Given**: Categories for species "bovine" and "ovine"
  - **When**: GET /api/v1/age-categories?speciesId={bovine-uuid}
  - **Then**: Returns 200, only bovine categories

- **Test**: Filter by active status
  - **Given**: Active and inactive categories
  - **When**: GET /api/v1/age-categories?isActive=false
  - **Then**: Returns 200, only inactive categories

- **Test**: Search by category name
  - **Given**: Categories "Veau", "Vache", "Adulte"
  - **When**: GET /api/v1/age-categories?search=vea
  - **Then**: Returns 200, only "Veau" (case-insensitive)

- **Test**: Search by code
  - **Given**: Categories with codes "CALF", "ADULT", "SENIOR"
  - **When**: GET /api/v1/age-categories?search=calf
  - **Then**: Returns 200, only "CALF" (case-insensitive)

- **Test**: Search in description
  - **Given**: Category with description "Young animal"
  - **When**: GET /api/v1/age-categories?search=young
  - **Then**: Returns 200, category found by description

- **Test**: Sort by nameFr ascending
  - **Given**: Multiple categories
  - **When**: GET /api/v1/age-categories?orderBy=nameFr&order=ASC
  - **Then**: Returns 200, categories sorted alphabetically by French name

- **Test**: Sort by ageMinDays descending
  - **Given**: Multiple categories
  - **When**: GET /api/v1/age-categories?orderBy=ageMinDays&order=DESC
  - **Then**: Returns 200, oldest categories first

- **Test**: Sort by displayOrder (default)
  - **Given**: Categories with different displayOrder values
  - **When**: GET /api/v1/age-categories
  - **Then**: Returns 200, categories sorted by displayOrder ASC

- **Test**: Combined filters
  - **Given**: Multiple categories
  - **When**: GET /api/v1/age-categories?speciesId={id}&isActive=true&search=adult&orderBy=displayOrder
  - **Then**: Returns 200, active categories for species matching "adult", sorted

### ❌ Error Cases
- **Test**: Invalid page number
  - **Given**: Multiple categories
  - **When**: GET /api/v1/age-categories?page=0
  - **Then**: Returns 200 (page defaults to 1)

- **Test**: Limit exceeds maximum
  - **Given**: Request limit > 100
  - **When**: GET /api/v1/age-categories?limit=500
  - **Then**: Automatically caps to 100, returns 200

---

## 3. GET Age Categories by Species (GET /api/v1/age-categories/species/:speciesId)

### ✅ Success Cases
- **Test**: Get active categories for a species
  - **Given**: Species "bovine" with 5 active and 2 inactive categories
  - **When**: GET /api/v1/age-categories/species/{bovine-uuid}
  - **Then**: Returns 200, only 5 active categories, sorted by displayOrder

- **Test**: Get categories for species with no categories
  - **Given**: Species "ovine" exists but has no categories
  - **When**: GET /api/v1/age-categories/species/{ovine-uuid}
  - **Then**: Returns 200, empty array []

### ❌ Error Cases
- **Test**: Get categories for non-existent species
  - **Given**: Species "invalid-uuid" does not exist
  - **When**: GET /api/v1/age-categories/species/invalid-uuid
  - **Then**: Returns 404 Not Found

---

## 4. GET Age Category Match (GET /api/v1/age-categories/match)

### ✅ Success Cases
- **Test**: Find category matching age range
  - **Given**: Category "CALF" (ageMin: 0, ageMax: 365) for species "bovine"
  - **When**: GET /api/v1/age-categories/match?speciesId={bovine-uuid}&ageInDays=180
  - **Then**: Returns 200, "CALF" category

- **Test**: Find category with no upper limit (null ageMaxDays)
  - **Given**: Category "ADULT" (ageMin: 366, ageMax: null) for species "bovine"
  - **When**: GET /api/v1/age-categories/match?speciesId={bovine-uuid}&ageInDays=5000
  - **Then**: Returns 200, "ADULT" category

- **Test**: No match, return default category
  - **Given**: No category matches age 10 days, but "CALF" is marked isDefault=true
  - **When**: GET /api/v1/age-categories/match?speciesId={bovine-uuid}&ageInDays=10
  - **Then**: Returns 200, default "CALF" category

### ❌ Error Cases
- **Test**: No match and no default category
  - **Given**: No category matches age, and no default set
  - **When**: GET /api/v1/age-categories/match?speciesId={bovine-uuid}&ageInDays=10
  - **Then**: Returns 200, null (or 404 based on implementation choice)

---

## 5. GET Age Category by ID (GET /api/v1/age-categories/:id)

### ✅ Success Cases
- **Test**: Get existing age category
  - **Given**: Age category with ID exists
  - **When**: GET /api/v1/age-categories/{valid-uuid}
  - **Then**: Returns 200, category details

### ❌ Error Cases
- **Test**: Get non-existent age category
  - **Given**: Age category "invalid-uuid" does not exist
  - **When**: GET /api/v1/age-categories/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Get soft-deleted age category
  - **Given**: Age category exists but deletedAt is not null
  - **When**: GET /api/v1/age-categories/{deleted-uuid}
  - **Then**: Returns 404 Not Found

---

## 6. UPDATE Age Category (PATCH /api/v1/age-categories/:id)

### ✅ Success Cases
- **Test**: Update age category name
  - **Given**: Age category exists
  - **When**: PATCH /api/v1/age-categories/{id} with { nameFr: "Veau Nouveau" }
  - **Then**: Returns 200, category updated, version incremented

- **Test**: Update partial fields
  - **Given**: Age category exists
  - **When**: PATCH /api/v1/age-categories/{id} with { description: "Updated desc" }
  - **Then**: Returns 200, only description updated

- **Test**: Update age ranges
  - **Given**: Age category exists
  - **When**: PATCH /api/v1/age-categories/{id} with { ageMinDays: 0, ageMaxDays: 180 }
  - **Then**: Returns 200, age ranges updated

### ❌ Error Cases
- **Test**: Update non-existent age category
  - **Given**: Age category "invalid-uuid" does not exist
  - **When**: PATCH /api/v1/age-categories/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Update without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/age-categories/{id}
  - **Then**: Returns 401 Unauthorized

- **Test**: Update without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: PATCH /api/v1/age-categories/{id}
  - **Then**: Returns 403 Forbidden

- **Test**: Update code (should not be allowed)
  - **Given**: UpdateDto has `code` excluded
  - **When**: PATCH /api/v1/age-categories/{id} with { code: "NEW_CODE" }
  - **Then**: Code is ignored (not updatable)

- **Test**: Update speciesId (should not be allowed)
  - **Given**: UpdateDto has `speciesId` excluded
  - **When**: PATCH /api/v1/age-categories/{id} with { speciesId: "new-species-id" }
  - **Then**: speciesId is ignored (not updatable)

---

## 7. TOGGLE Active Status (PATCH /api/v1/age-categories/:id/toggle-active)

### ✅ Success Cases
- **Test**: Deactivate age category
  - **Given**: Age category is active
  - **When**: PATCH /api/v1/age-categories/{id}/toggle-active with { isActive: false }
  - **Then**: Returns 200, category deactivated, version incremented

- **Test**: Reactivate age category
  - **Given**: Age category is inactive
  - **When**: PATCH /api/v1/age-categories/{id}/toggle-active with { isActive: true }
  - **Then**: Returns 200, category activated

### ❌ Error Cases
- **Test**: Toggle without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/age-categories/{id}/toggle-active
  - **Then**: Returns 401 Unauthorized

- **Test**: Toggle non-existent age category
  - **Given**: Age category "invalid-uuid" does not exist
  - **When**: PATCH /api/v1/age-categories/invalid-uuid/toggle-active
  - **Then**: Returns 404 Not Found

---

## 8. DELETE Age Category (DELETE /api/v1/age-categories/:id)

### ✅ Success Cases
- **Test**: Delete unused age category (soft delete)
  - **Given**: Age category exists and is not used in any Animal
  - **When**: DELETE /api/v1/age-categories/{id}
  - **Then**: Returns 200, category soft deleted (deletedAt set)

### ❌ Error Cases
- **Test**: Delete age category in use
  - **Given**: Age category is linked to Animal records (future check)
  - **When**: DELETE /api/v1/age-categories/{id}
  - **Then**: Returns 409 Conflict with usage count (future implementation)

- **Test**: Delete without authentication
  - **Given**: No Bearer token
  - **When**: DELETE /api/v1/age-categories/{id}
  - **Then**: Returns 401 Unauthorized

- **Test**: Delete without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: DELETE /api/v1/age-categories/{id}
  - **Then**: Returns 403 Forbidden

- **Test**: Delete non-existent age category
  - **Given**: Age category "invalid-uuid" does not exist
  - **When**: DELETE /api/v1/age-categories/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Delete already soft-deleted category
  - **Given**: Age category has deletedAt set
  - **When**: DELETE /api/v1/age-categories/{deleted-uuid}
  - **Then**: Returns 404 Not Found

---

## Test Implementation Files

### Structure
```
test/
  ├── age-categories.e2e-spec.ts          # Main E2E test file
  ├── fixtures/
  │   ├── species.fixture.ts              # Species test data
  │   └── age-categories.fixture.ts       # Age categories test data
  └── helpers/
      └── auth.helper.ts                  # Auth token helpers
```

### Test Setup
1. Use test database (separate from dev)
2. Seed initial data before each test (species first, then age categories)
3. Clean database after each test
4. Mock authentication in MVP mode

### Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run age-categories E2E tests only
npm run test:e2e -- --testPathPattern=age-categories

# Run with coverage
npm run test:e2e -- --coverage
```

---

## Status

**Current**: ⚠️ Tests not implemented yet
**Priority**: 🟡 Medium (MVP can proceed without, but should be done before production)
**Estimated effort**: 6-8 hours (more complex than Countries due to species relationship)

---

## Next Steps

1. Implement test fixtures (species + age categories seed data)
2. Write E2E tests following this plan
3. Ensure 80%+ coverage
4. Integrate into CI/CD pipeline

---

## Notes

- Age categories have a unique constraint on (speciesId, code), unlike Countries which use just (code)
- The `findForAnimalAge` endpoint is specific to age categories and requires special test coverage
- Future enhancement: Check Animal references before allowing delete (conflict 409)
