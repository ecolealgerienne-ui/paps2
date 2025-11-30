# Countries - E2E Tests Plan

## Test Coverage Requirements

**Target**: Minimum 80% coverage for countries module

---

## 1. CREATE Country (POST /api/v1/countries)

### ✅ Success Cases
- **Test**: Create country with valid data
  - **Given**: Valid CreateCountryDto (code: "DZ", names fr/en/ar, region)
  - **When**: POST /api/v1/countries with admin auth
  - **Then**: Returns 201, country created with uppercase code

- **Test**: Create country with optional fields
  - **Given**: CreateCountryDto with only required fields (no region)
  - **When**: POST /api/v1/countries
  - **Then**: Returns 201, isActive defaults to true

### ❌ Error Cases
- **Test**: Create duplicate country
  - **Given**: Country "FR" already exists
  - **When**: POST /api/v1/countries with code "FR"
  - **Then**: Returns 409 Conflict

- **Test**: Create with invalid ISO code
  - **Given**: CreateCountryDto with code "ABC" (3 letters)
  - **When**: POST /api/v1/countries
  - **Then**: Returns 400 Bad Request

- **Test**: Create without authentication
  - **Given**: No Bearer token
  - **When**: POST /api/v1/countries
  - **Then**: Returns 401 Unauthorized

- **Test**: Create without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: POST /api/v1/countries
  - **Then**: Returns 403 Forbidden

- **Test**: Create with missing required fields
  - **Given**: CreateCountryDto without nameFr
  - **When**: POST /api/v1/countries
  - **Then**: Returns 400 with validation errors

---

## 2. GET ALL Countries (GET /api/v1/countries)

### ✅ Success Cases
- **Test**: Get all countries with default pagination
  - **Given**: 50 countries in database
  - **When**: GET /api/v1/countries
  - **Then**: Returns 200, data array (max 20), meta (total: 50, page: 1, pages: 3)

- **Test**: Get countries page 2
  - **Given**: 50 countries in database
  - **When**: GET /api/v1/countries?page=2&limit=10
  - **Then**: Returns 200, 10 countries, meta (page: 2, pages: 5)

- **Test**: Filter by region
  - **Given**: Countries in Africa and Europe
  - **When**: GET /api/v1/countries?region=Africa
  - **Then**: Returns 200, only African countries

- **Test**: Filter by active status
  - **Given**: Active and inactive countries
  - **When**: GET /api/v1/countries?isActive=false
  - **Then**: Returns 200, only inactive countries

- **Test**: Search by country name
  - **Given**: Countries "Algeria", "France", "Germany"
  - **When**: GET /api/v1/countries?search=alg
  - **Then**: Returns 200, only "Algeria" (case-insensitive)

- **Test**: Sort by name ascending
  - **Given**: Multiple countries
  - **When**: GET /api/v1/countries?orderBy=nameFr&order=ASC
  - **Then**: Returns 200, countries sorted alphabetically by French name

- **Test**: Sort by createdAt descending
  - **Given**: Multiple countries
  - **When**: GET /api/v1/countries?orderBy=createdAt&order=DESC
  - **Then**: Returns 200, newest countries first

- **Test**: Combined filters
  - **Given**: Multiple countries
  - **When**: GET /api/v1/countries?region=Africa&isActive=true&search=al&orderBy=nameFr
  - **Then**: Returns 200, active African countries matching "al", sorted

### ❌ Error Cases
- **Test**: Invalid page number
  - **Given**: 10 countries
  - **When**: GET /api/v1/countries?page=0
  - **Then**: Returns 400 Bad Request

- **Test**: Limit exceeds maximum
  - **Given**: Request limit > 100
  - **When**: GET /api/v1/countries?limit=500
  - **Then**: Automatically caps to 100, returns 200

---

## 3. GET Country by Code (GET /api/v1/countries/:code)

### ✅ Success Cases
- **Test**: Get existing country
  - **Given**: Country "DZ" exists
  - **When**: GET /api/v1/countries/DZ
  - **Then**: Returns 200, country details

- **Test**: Get country with lowercase code
  - **Given**: Country "FR" exists
  - **When**: GET /api/v1/countries/fr (lowercase)
  - **Then**: Returns 200, finds "FR" (case-insensitive)

### ❌ Error Cases
- **Test**: Get non-existent country
  - **Given**: Country "ZZ" does not exist
  - **When**: GET /api/v1/countries/ZZ
  - **Then**: Returns 404 Not Found

---

## 4. UPDATE Country (PATCH /api/v1/countries/:code)

### ✅ Success Cases
- **Test**: Update country name
  - **Given**: Country "DZ" exists
  - **When**: PATCH /api/v1/countries/DZ with { nameFr: "Algérie" }
  - **Then**: Returns 200, country updated

- **Test**: Update partial fields
  - **Given**: Country exists
  - **When**: PATCH /api/v1/countries/DZ with { region: "Africa" }
  - **Then**: Returns 200, only region updated

### ❌ Error Cases
- **Test**: Update non-existent country
  - **Given**: Country "ZZ" does not exist
  - **When**: PATCH /api/v1/countries/ZZ
  - **Then**: Returns 404 Not Found

- **Test**: Update without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/countries/DZ
  - **Then**: Returns 401 Unauthorized

- **Test**: Update without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: PATCH /api/v1/countries/DZ
  - **Then**: Returns 403 Forbidden

- **Test**: Update code (should not be allowed)
  - **Given**: UpdateDto has `code` field excluded
  - **When**: PATCH /api/v1/countries/DZ with { code: "FR" }
  - **Then**: Code is ignored (not updatable)

---

## 5. TOGGLE Active Status (PATCH /api/v1/countries/:code/toggle-active)

### ✅ Success Cases
- **Test**: Deactivate country
  - **Given**: Country "DZ" is active
  - **When**: PATCH /api/v1/countries/DZ/toggle-active with { isActive: false }
  - **Then**: Returns 200, country deactivated

- **Test**: Reactivate country
  - **Given**: Country "DZ" is inactive
  - **When**: PATCH /api/v1/countries/DZ/toggle-active with { isActive: true }
  - **Then**: Returns 200, country activated

### ❌ Error Cases
- **Test**: Toggle without authentication
  - **Given**: No Bearer token
  - **When**: PATCH /api/v1/countries/DZ/toggle-active
  - **Then**: Returns 401 Unauthorized

- **Test**: Toggle non-existent country
  - **Given**: Country "ZZ" does not exist
  - **When**: PATCH /api/v1/countries/ZZ/toggle-active
  - **Then**: Returns 404 Not Found

---

## 6. DELETE Country (DELETE /api/v1/countries/:code)

### ✅ Success Cases
- **Test**: Delete unused country
  - **Given**: Country "DZ" exists and is not used in any entity
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 200, country deleted (hard delete)

### ❌ Error Cases
- **Test**: Delete country in use (BreedCountry)
  - **Given**: Country "DZ" is linked to breeds
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 409 Conflict with usage count

- **Test**: Delete country in use (CampaignCountry)
  - **Given**: Country "DZ" is linked to campaigns
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 409 Conflict

- **Test**: Delete country in use (ProductPackaging)
  - **Given**: Country "DZ" is used in product packaging
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 409 Conflict

- **Test**: Delete without authentication
  - **Given**: No Bearer token
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 401 Unauthorized

- **Test**: Delete without admin role
  - **Given**: Authenticated as farm_owner
  - **When**: DELETE /api/v1/countries/DZ
  - **Then**: Returns 403 Forbidden

- **Test**: Delete non-existent country
  - **Given**: Country "ZZ" does not exist
  - **When**: DELETE /api/v1/countries/ZZ
  - **Then**: Returns 404 Not Found

---

## 7. GET Regions (GET /api/v1/countries/regions)

### ✅ Success Cases
- **Test**: Get all regions
  - **Given**: Countries with regions: Africa, Europe, Asia
  - **When**: GET /api/v1/countries/regions
  - **Then**: Returns 200, ["Africa", "Asia", "Europe"] (sorted)

- **Test**: Get regions (only active countries)
  - **Given**: Active countries in Africa, inactive in Europe
  - **When**: GET /api/v1/countries/regions
  - **Then**: Returns 200, ["Africa"] (excludes inactive)

---

## 8. GET Countries by Region (GET /api/v1/countries/region/:region)

### ✅ Success Cases
- **Test**: Get countries in Africa
  - **Given**: Countries DZ (Africa), FR (Europe)
  - **When**: GET /api/v1/countries/region/Africa
  - **Then**: Returns 200, only DZ

- **Test**: Get countries (only active)
  - **Given**: Active "DZ" and inactive "TN" in Africa
  - **When**: GET /api/v1/countries/region/Africa
  - **Then**: Returns 200, only "DZ" (active)

---

## Test Implementation Files

### Structure
```
test/
  ├── countries.e2e-spec.ts          # Main E2E test file
  ├── fixtures/
  │   └── countries.fixture.ts       # Test data seeding
  └── helpers/
      └── auth.helper.ts             # Auth token helpers
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

# Run countries E2E tests only
npm run test:e2e -- --testPathPattern=countries

# Run with coverage
npm run test:e2e -- --coverage
```

---

## Status

**Current**: ⚠️ Tests not implemented yet
**Priority**: 🟡 Medium (MVP can proceed without, but should be done before production)
**Estimated effort**: 4-6 hours

---

## Next Steps

1. Implement test fixtures (seed data)
2. Write E2E tests following this plan
3. Ensure 80%+ coverage
4. Integrate into CI/CD pipeline
