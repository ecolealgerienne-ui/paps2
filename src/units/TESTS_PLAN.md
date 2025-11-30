# Units - E2E Tests Plan

## Test Coverage Requirements

**Target**: Minimum 80% coverage for units module

---

## 1. CREATE Unit (POST /api/v1/units)

### ✅ Success Cases
- **Test**: Create unit with valid data
  - **Given**: Valid CreateUnitDto (code: "mg", symbol: "mg", names fr/en/ar, unitType: mass)
  - **When**: POST /api/v1/units with admin auth
  - **Then**: Returns 201, unit created with lowercase code

- **Test**: Create unit with conversion factors
  - **Given**: CreateUnitDto with baseUnitCode: "g", conversionFactor: 0.001
  - **When**: POST /api/v1/units
  - **Then**: Returns 201, conversion fields saved correctly

- **Test**: Create unit with optional description
  - **Given**: CreateUnitDto with description field
  - **When**: POST /api/v1/units
  - **Then**: Returns 201, description saved

### ❌ Error Cases
- **Test**: Create duplicate unit code
  - **Given**: Unit "mg" already exists
  - **When**: POST /api/v1/units with code "mg"
  - **Then**: Returns 409 Conflict

- **Test**: Create with invalid code format
  - **Given**: CreateUnitDto with code "MG-test" (uppercase + dash)
  - **When**: POST /api/v1/units
  - **Then**: Returns 400 Bad Request (validation error)

- **Test**: Create with invalid unitType
  - **Given**: CreateUnitDto with unitType "invalid"
  - **When**: POST /api/v1/units
  - **Then**: Returns 400 Bad Request

- **Test**: Create without authentication
  - **Given**: No Bearer token
  - **When**: POST /api/v1/units
  - **Then**: Returns 401 Unauthorized

- **Test**: Create without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: POST /api/v1/units
  - **Then**: Returns 403 Forbidden

- **Test**: Create with missing required fields
  - **Given**: CreateUnitDto without nameFr
  - **When**: POST /api/v1/units
  - **Then**: Returns 400 with validation errors

---

## 2. GET ALL Units (GET /api/v1/units)

### ✅ Success Cases
- **Test**: Get all units with default pagination
  - **Given**: 50 units in database
  - **When**: GET /api/v1/units
  - **Then**: Returns 200, data array (max 20), meta (total: 50, page: 1, pages: 3)

- **Test**: Get units page 2
  - **Given**: 50 units in database
  - **When**: GET /api/v1/units?page=2&limit=10
  - **Then**: Returns 200, 10 units, meta (page: 2, pages: 5)

- **Test**: Filter by unitType
  - **Given**: Units of type mass, volume, concentration
  - **When**: GET /api/v1/units?unitType=mass
  - **Then**: Returns 200, only mass units

- **Test**: Filter by active status
  - **Given**: Active and inactive units
  - **When**: GET /api/v1/units?isActive=false
  - **Then**: Returns 200, only inactive units

- **Test**: Search by unit name
  - **Given**: Units "Milligramme", "Gramme", "Kilogramme"
  - **When**: GET /api/v1/units?search=gram
  - **Then**: Returns 200, all matching units (case-insensitive)

- **Test**: Search by code
  - **Given**: Units with codes "mg", "g", "kg"
  - **When**: GET /api/v1/units?search=g
  - **Then**: Returns 200, matching units

- **Test**: Search by symbol
  - **Given**: Unit with symbol "mg/ml"
  - **When**: GET /api/v1/units?search=mg/ml
  - **Then**: Returns 200, unit found by symbol

- **Test**: Sort by code ascending
  - **Given**: Multiple units
  - **When**: GET /api/v1/units?orderBy=code&order=ASC
  - **Then**: Returns 200, units sorted alphabetically by code

- **Test**: Sort by unitType
  - **Given**: Multiple units
  - **When**: GET /api/v1/units?orderBy=unitType&order=ASC
  - **Then**: Returns 200, units grouped by type

- **Test**: Default sorting (unitType → displayOrder → code)
  - **Given**: Multiple units
  - **When**: GET /api/v1/units
  - **Then**: Returns 200, units sorted by default criteria

- **Test**: Combined filters
  - **Given**: Multiple units
  - **When**: GET /api/v1/units?unitType=mass&isActive=true&search=gram&orderBy=displayOrder
  - **Then**: Returns 200, active mass units matching "gram", sorted

### ❌ Error Cases
- **Test**: Invalid page number
  - **Given**: Multiple units
  - **When**: GET /api/v1/units?page=0
  - **Then**: Returns 200 (page defaults to 1)

- **Test**: Limit exceeds maximum
  - **Given**: Request limit > 100
  - **When**: GET /api/v1/units?limit=500
  - **Then**: Automatically caps to 100, returns 200

---

## 3. GET Units by Type (GET /api/v1/units/type/:type)

### ✅ Success Cases
- **Test**: Get mass units
  - **Given**: 10 mass units (5 active, 5 inactive)
  - **When**: GET /api/v1/units/type/mass
  - **Then**: Returns 200, only 5 active mass units, sorted by displayOrder

- **Test**: Get concentration units
  - **Given**: Units of type concentration
  - **When**: GET /api/v1/units/type/concentration
  - **Then**: Returns 200, only active concentration units

### ❌ Error Cases
- **Test**: Get units with invalid type
  - **Given**: Request with invalid unitType
  - **When**: GET /api/v1/units/type/invalid
  - **Then**: Returns 400 Bad Request

---

## 4. GET Unit by Code (GET /api/v1/units/code/:code)

### ✅ Success Cases
- **Test**: Get unit by code
  - **Given**: Unit "mg" exists
  - **When**: GET /api/v1/units/code/mg
  - **Then**: Returns 200, unit details

- **Test**: Get unit by code (case-insensitive)
  - **Given**: Unit "mg" exists (lowercase in DB)
  - **When**: GET /api/v1/units/code/MG (uppercase)
  - **Then**: Returns 200, finds "mg"

### ❌ Error Cases
- **Test**: Get non-existent unit by code
  - **Given**: Unit "xyz" does not exist
  - **When**: GET /api/v1/units/code/xyz
  - **Then**: Returns 404 Not Found

---

## 5. GET Unit Conversion (GET /api/v1/units/convert)

### ✅ Success Cases
- **Test**: Convert between units (mg to g)
  - **Given**: Units "mg" (factor: 0.001) and "g" (factor: 1) exist
  - **When**: GET /api/v1/units/convert?value=1000&from=mg&to=g
  - **Then**: Returns 200, { value: 1000, from: "mg", to: "g", result: 1 }

- **Test**: Convert same unit (no conversion)
  - **Given**: Unit "g" exists
  - **When**: GET /api/v1/units/convert?value=100&from=g&to=g
  - **Then**: Returns 200, result: 100

- **Test**: Convert with default factor (1)
  - **Given**: Units without conversionFactor
  - **When**: GET /api/v1/units/convert?value=50&from=unit1&to=unit2
  - **Then**: Returns 200, result based on default factor 1

### ❌ Error Cases
- **Test**: Convert incompatible unit types
  - **Given**: Unit "mg" (mass) and "ml" (volume)
  - **When**: GET /api/v1/units/convert?value=100&from=mg&to=ml
  - **Then**: Returns 409 Conflict (incompatible types)

- **Test**: Convert from non-existent unit
  - **Given**: Unit "xyz" does not exist
  - **When**: GET /api/v1/units/convert?value=100&from=xyz&to=g
  - **Then**: Returns 404 Not Found

- **Test**: Convert to non-existent unit
  - **Given**: Unit "xyz" does not exist
  - **When**: GET /api/v1/units/convert?value=100&from=g&to=xyz
  - **Then**: Returns 404 Not Found

---

## 6. GET Unit by ID (GET /api/v1/units/:id)

### ✅ Success Cases
- **Test**: Get existing unit
  - **Given**: Unit with ID exists
  - **When**: GET /api/v1/units/{valid-uuid}
  - **Then**: Returns 200, unit details

### ❌ Error Cases
- **Test**: Get non-existent unit
  - **Given**: Unit "invalid-uuid" does not exist
  - **When**: GET /api/v1/units/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Get soft-deleted unit
  - **Given**: Unit exists but deletedAt is not null
  - **When**: GET /api/v1/units/{deleted-uuid}
  - **Then**: Returns 404 Not Found

---

## 7. UPDATE Unit (PATCH /api/v1/units/:id)

### ✅ Success Cases
- **Test**: Update unit name
  - **Given**: Unit exists
  - **When**: PATCH /api/v1/units/{id} with { nameFr: "Milligramme (nouveau)" }
  - **Then**: Returns 200, unit updated, version incremented

- **Test**: Update partial fields
  - **Given**: Unit exists
  - **When**: PATCH /api/v1/units/{id} with { description: "Updated description" }
  - **Then**: Returns 200, only description updated

- **Test**: Update conversion factors
  - **Given**: Unit exists
  - **When**: PATCH /api/v1/units/{id} with { conversionFactor: 0.002 }
  - **Then**: Returns 200, factor updated

### ❌ Error Cases
- **Test**: Update non-existent unit
  - **Given**: Unit "invalid-uuid" does not exist
  - **When**: PATCH /api/v1/units/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Update without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/units/{id}
  - **Then**: Returns 401 Unauthorized

- **Test**: Update without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: PATCH /api/v1/units/{id}
  - **Then**: Returns 403 Forbidden

- **Test**: Update code (should not be allowed)
  - **Given**: UpdateDto has `code` excluded
  - **When**: PATCH /api/v1/units/{id} with { code: "new_code" }
  - **Then**: Code is ignored (not updatable)

- **Test**: Update unitType (should not be allowed)
  - **Given**: UpdateDto has `unitType` excluded
  - **When**: PATCH /api/v1/units/{id} with { unitType: "volume" }
  - **Then**: unitType is ignored (not updatable)

---

## 8. TOGGLE Active Status (PATCH /api/v1/units/:id/toggle-active)

### ✅ Success Cases
- **Test**: Deactivate unit
  - **Given**: Unit is active
  - **When**: PATCH /api/v1/units/{id}/toggle-active with { isActive: false }
  - **Then**: Returns 200, unit deactivated, version incremented

- **Test**: Reactivate unit
  - **Given**: Unit is inactive
  - **When**: PATCH /api/v1/units/{id}/toggle-active with { isActive: true }
  - **Then**: Returns 200, unit activated

### ❌ Error Cases
- **Test**: Toggle without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/units/{id}/toggle-active
  - **Then**: Returns 401 Unauthorized

- **Test**: Toggle non-existent unit
  - **Given**: Unit "invalid-uuid" does not exist
  - **When**: PATCH /api/v1/units/invalid-uuid/toggle-active
  - **Then**: Returns 404 Not Found

---

## 9. DELETE Unit (DELETE /api/v1/units/:id)

### ✅ Success Cases
- **Test**: Delete unused unit (soft delete)
  - **Given**: Unit exists and is not used
  - **When**: DELETE /api/v1/units/{id}
  - **Then**: Returns 200, unit soft deleted (deletedAt set)

### ❌ Error Cases
- **Test**: Delete unit in use (ProductPackaging)
  - **Given**: Unit is linked to ProductPackaging records (future check)
  - **When**: DELETE /api/v1/units/{id}
  - **Then**: Returns 409 Conflict with usage count (future implementation)

- **Test**: Delete unit in use (TherapeuticIndication)
  - **Given**: Unit is linked to TherapeuticIndication records (future check)
  - **When**: DELETE /api/v1/units/{id}
  - **Then**: Returns 409 Conflict

- **Test**: Delete without authentication
  - **Given**: No Bearer token
  - **When**: DELETE /api/v1/units/{id}
  - **Then**: Returns 401 Unauthorized

- **Test**: Delete without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: DELETE /api/v1/units/{id}
  - **Then**: Returns 403 Forbidden

- **Test**: Delete non-existent unit
  - **Given**: Unit "invalid-uuid" does not exist
  - **When**: DELETE /api/v1/units/invalid-uuid
  - **Then**: Returns 404 Not Found

- **Test**: Delete already soft-deleted unit
  - **Given**: Unit has deletedAt set
  - **When**: DELETE /api/v1/units/{deleted-uuid}
  - **Then**: Returns 404 Not Found

---

## Test Implementation Files

### Structure
```
test/
  ├── units.e2e-spec.ts          # Main E2E test file
  ├── fixtures/
  │   └── units.fixture.ts       # Test data seeding
  └── helpers/
      └── auth.helper.ts         # Auth token helpers
```

### Test Setup
1. Use test database (separate from dev)
2. Seed initial data before each test
3. Clean database after each test
4. Mock authentication in MVP mode

### Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run units E2E tests only
npm run test:e2e -- --testPathPattern=units

# Run with coverage
npm run test:e2e -- --coverage
```

---

## Status

**Current**: ⚠️ Tests not implemented yet
**Priority**: 🟡 Medium (MVP can proceed without, but should be done before production)
**Estimated effort**: 6-8 hours

---

## Next Steps

1. Implement test fixtures (unit seed data with all types)
2. Write E2E tests following this plan
3. Ensure 80%+ coverage
4. Integrate into CI/CD pipeline

---

## Notes

- Units have enum UnitType (6 values: mass, volume, concentration, count, percentage, other)
- Special endpoint GET /convert requires testing with various unit combinations
- Conversion logic depends on conversionFactor and baseUnitCode
- Future enhancement: Check ProductPackaging, TherapeuticIndication, Treatment references before delete (conflict 409)
- Code is automatically lowercased on create/update
