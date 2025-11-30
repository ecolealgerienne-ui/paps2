# Breed-Country Association Tests Plan

Comprehensive test plan for the Breed-Country association feature (PHASE_16).

## Test Categories

### 1. Controller Tests (breed-countries.controller.spec.ts)

#### POST /api/v1/breed-countries (Link)
- ✅ Should link a breed to a country with valid data
- ✅ Should return 401 when not authenticated
- ✅ Should return 403 when not admin
- ✅ Should return 404 when breed not found
- ✅ Should return 404 when country not found
- ✅ Should return 409 when association already exists
- ✅ Should reactivate deactivated association
- ✅ Should validate breedId format (UUID)
- ✅ Should validate countryCode format (ISO 3166-1)
- ✅ Should return BreedCountryResponseDto
- ✅ Should include breed and country relations in response

#### GET /api/v1/breed-countries (Find All)
- ✅ Should return paginated list with default pagination (page 1, limit 50)
- ✅ Should return empty list when no associations exist
- ✅ Should respect pagination parameters (page, limit)
- ✅ Should filter by breedId
- ✅ Should filter by countryCode
- ✅ Should filter by isActive status
- ✅ Should filter out deleted breeds
- ✅ Should search in breed code
- ✅ Should search in breed names (Fr, En, Ar)
- ✅ Should search in country code
- ✅ Should search in country names (Fr, En)
- ✅ Should search case-insensitively
- ✅ Should sort by createdAt ASC
- ✅ Should sort by createdAt DESC
- ✅ Should sort by updatedAt
- ✅ Should sort by isActive
- ✅ Should default sort by breed name, then country name
- ✅ Should limit max page size to 100
- ✅ Should include breed and country relations
- ✅ Should return correct pagination metadata

#### GET /api/v1/breed-countries/breed/:breedId (Find Countries by Breed)
- ✅ Should return all countries for a breed
- ✅ Should return 404 when breed not found
- ✅ Should return 404 when breed is deleted
- ✅ Should filter only active associations
- ✅ Should sort by country name (Fr)
- ✅ Should include breed and country relations
- ✅ Should validate breedId format

#### GET /api/v1/breed-countries/country/:countryCode (Find Breeds by Country)
- ✅ Should return all breeds for a country
- ✅ Should return 404 when country not found
- ✅ Should filter only active associations
- ✅ Should filter out deleted breeds
- ✅ Should sort by breed name (Fr)
- ✅ Should include breed and country relations
- ✅ Should validate countryCode format

#### GET /api/v1/breed-countries/:id (Find One)
- ✅ Should return association by ID
- ✅ Should return 404 when association not found
- ✅ Should return 404 when association is inactive
- ✅ Should include breed and country relations
- ✅ Should validate ID format (UUID)

#### DELETE /api/v1/breed-countries (Unlink)
- ✅ Should deactivate association with valid data
- ✅ Should return 401 when not authenticated
- ✅ Should return 403 when not admin
- ✅ Should return 404 when association not found
- ✅ Should return 404 when already inactive
- ✅ Should set isActive to false
- ✅ Should preserve association record
- ✅ Should return updated BreedCountryResponseDto
- ✅ Should include breed and country relations

#### POST /api/v1/breed-countries/:id/restore (Restore)
- ✅ Should restore deactivated association
- ✅ Should return 401 when not authenticated
- ✅ Should return 403 when not admin
- ✅ Should return 404 when association not found
- ✅ Should return 409 when already active
- ✅ Should set isActive to true
- ✅ Should return restored BreedCountryResponseDto
- ✅ Should include breed and country relations

### 2. Service Tests (breed-countries.service.spec.ts)

#### link()
- ✅ Should create new association
- ✅ Should throw NotFoundException when breed not found
- ✅ Should throw NotFoundException when breed is deleted
- ✅ Should throw NotFoundException when country not found
- ✅ Should throw ConflictException when association already exists and is active
- ✅ Should reactivate when association exists but is inactive
- ✅ Should use breedId_countryCode unique constraint
- ✅ Should include breed and country relations
- ✅ Should log audit event on creation
- ✅ Should log audit event on reactivation

#### findAll()
- ✅ Should return paginated list
- ✅ Should apply default pagination (page 1, limit 50)
- ✅ Should apply custom pagination
- ✅ Should filter by breedId
- ✅ Should filter by countryCode
- ✅ Should filter by isActive
- ✅ Should filter out deleted breeds
- ✅ Should search in breed code
- ✅ Should search in breed names
- ✅ Should search in country code
- ✅ Should search in country names
- ✅ Should search case-insensitively
- ✅ Should combine filters and search
- ✅ Should sort by createdAt
- ✅ Should sort by updatedAt
- ✅ Should sort by isActive
- ✅ Should default sort by breed name, country name
- ✅ Should limit max page size to 100
- ✅ Should calculate correct pagination metadata
- ✅ Should include breed and country relations

#### findCountriesByBreed()
- ✅ Should return countries for a breed
- ✅ Should throw NotFoundException when breed not found
- ✅ Should throw NotFoundException when breed is deleted
- ✅ Should filter only active associations
- ✅ Should sort by country name (Fr)
- ✅ Should include relations
- ✅ Should log debug messages

#### findBreedsByCountry()
- ✅ Should return breeds for a country
- ✅ Should throw NotFoundException when country not found
- ✅ Should filter only active associations
- ✅ Should filter out deleted breeds
- ✅ Should sort by breed name (Fr)
- ✅ Should include relations
- ✅ Should log debug messages

#### findOne()
- ✅ Should return association by ID
- ✅ Should throw NotFoundException when not found
- ✅ Should throw NotFoundException when inactive
- ✅ Should include relations

#### unlink()
- ✅ Should deactivate association
- ✅ Should throw NotFoundException when not found
- ✅ Should throw NotFoundException when already inactive
- ✅ Should set isActive to false
- ✅ Should preserve record
- ✅ Should include relations
- ✅ Should log audit event

#### restore()
- ✅ Should restore deactivated association
- ✅ Should throw NotFoundException when not found
- ✅ Should throw ConflictException when already active
- ✅ Should set isActive to true
- ✅ Should include relations
- ✅ Should log audit event

### 3. Integration Tests (breed-countries.e2e.spec.ts)

#### Complete Workflow
- ✅ Should link breed to country
- ✅ Should list all associations
- ✅ Should find countries by breed
- ✅ Should find breeds by country
- ✅ Should search associations
- ✅ Should filter associations
- ✅ Should paginate associations
- ✅ Should unlink breed from country
- ✅ Should restore association
- ✅ Should prevent duplicate active links
- ✅ Should allow reactivating inactive links

#### Edge Cases
- ✅ Should handle non-existent breed
- ✅ Should handle non-existent country
- ✅ Should handle deleted breed
- ✅ Should handle pagination beyond available pages
- ✅ Should handle empty search results
- ✅ Should handle special characters in search

#### Authorization
- ✅ Should require authentication for POST
- ✅ Should require authentication for DELETE
- ✅ Should require authentication for restore
- ✅ Should require admin role for POST
- ✅ Should require admin role for DELETE
- ✅ Should require admin role for restore
- ✅ Should allow public access to GET endpoints

### 4. Performance Tests

#### Pagination Performance
- ✅ Should handle large datasets (1000+ associations)
- ✅ Should maintain performance with filters
- ✅ Should maintain performance with search
- ✅ Should optimize database queries (no N+1)

#### Index Usage
- ✅ Should use breedId index
- ✅ Should use countryCode index
- ✅ Should use isActive index
- ✅ Should use composite breedId_countryCode unique constraint

### 5. Database Tests

#### Constraints
- ✅ Should enforce unique constraint [breedId, countryCode]
- ✅ Should allow multiple inactive associations for same pair
- ✅ Should cascade delete when breed is deleted
- ✅ Should cascade delete when country is deleted

#### Relations
- ✅ Should maintain referential integrity with breeds
- ✅ Should maintain referential integrity with countries
- ✅ Should load breed relation correctly
- ✅ Should load country relation correctly

### 6. Validation Tests

#### DTO Validation (LinkBreedCountryDto)
- ✅ Should validate breedId is required
- ✅ Should validate breedId is string
- ✅ Should validate breedId is UUID format
- ✅ Should validate countryCode is required
- ✅ Should validate countryCode is string
- ✅ Should validate countryCode is ISO 3166-1 alpha-2 format

#### Query Parameter Validation
- ✅ Should validate page is number
- ✅ Should validate limit is number
- ✅ Should validate isActive is boolean
- ✅ Should validate order is ASC or DESC
- ✅ Should handle invalid page gracefully
- ✅ Should handle invalid limit gracefully

## Test Data Requirements

### Breeds
```typescript
const testBreeds = [
  { id: 'uuid-1', code: 'holstein', nameFr: 'Holstein', nameEn: 'Holstein', nameAr: 'هولشتاين', speciesId: 'bovine' },
  { id: 'uuid-2', code: 'lacaune', nameFr: 'Lacaune', nameEn: 'Lacaune', nameAr: 'لاكون', speciesId: 'ovine' },
  { id: 'uuid-3', code: 'saanen', nameFr: 'Saanen', nameEn: 'Saanen', nameAr: 'ساانن', speciesId: 'caprine', deletedAt: new Date() }
];
```

### Countries
```typescript
const testCountries = [
  { code: 'DZ', nameFr: 'Algérie', nameEn: 'Algeria', nameAr: 'الجزائر', region: 'Africa' },
  { code: 'FR', nameFr: 'France', nameEn: 'France', nameAr: 'فرنسا', region: 'Europe' },
  { code: 'MA', nameFr: 'Maroc', nameEn: 'Morocco', nameAr: 'المغرب', region: 'Africa' }
];
```

### Associations
```typescript
const testAssociations = [
  { breedId: 'uuid-1', countryCode: 'DZ', isActive: true },
  { breedId: 'uuid-1', countryCode: 'FR', isActive: true },
  { breedId: 'uuid-2', countryCode: 'FR', isActive: false }
];
```

## Mock Strategies

### PrismaService Mocks
- ✅ Mock `breedCountry.create()`
- ✅ Mock `breedCountry.findMany()`
- ✅ Mock `breedCountry.findUnique()`
- ✅ Mock `breedCountry.findFirst()`
- ✅ Mock `breedCountry.update()`
- ✅ Mock `breedCountry.count()`
- ✅ Mock `breed.findFirst()` for validation
- ✅ Mock `country.findUnique()` for validation

### AppLogger Mocks
- ✅ Mock `debug()`
- ✅ Mock `warn()`
- ✅ Mock `audit()`
- ✅ Mock `error()`

### Guard Mocks
- ✅ Mock AuthGuard
- ✅ Mock AdminGuard

## Coverage Goals
- Line Coverage: > 90%
- Branch Coverage: > 85%
- Function Coverage: > 95%

## Total Test Cases: ~140
