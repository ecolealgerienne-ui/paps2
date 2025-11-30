# Therapeutic Indications Migration Checklist

## Entity: TherapeuticIndication (10/16 - Phase 2)

### Schema ✅
- [x] 14 fields: id, productId, countryCode, speciesId, ageCategoryId, routeId, doseMin, doseMax, doseUnitId, doseOriginalText, protocolDurationDays, withdrawalMeatDays, withdrawalMilkDays, isVerified, validationNotes, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: product (FK), country (FK, optional), species (FK), ageCategory (FK, optional), route (FK), doseUnit (FK, optional), treatments
- [x] Indexes: productId, countryCode, speciesId, ageCategoryId, routeId, isActive, deletedAt, composite [productId, speciesId, routeId]
- [x] Unique constraint: [productId, countryCode, speciesId, ageCategoryId, routeId]

### DTOs ✅
- [x] CreateTherapeuticIndicationDto (full validation)
- [x] UpdateTherapeuticIndicationDto (excludes foreign keys, includes version)
- [x] TherapeuticIndicationResponseDto (all fields, nullable types as `| null`)
- [x] QueryTherapeuticIndicationDto (with page/limit)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/therapeutic-indications`
- [x] 8 endpoints total
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (productId, speciesId, countryCode, routeId, isVerified, isActive)
- [x] Specialized endpoints: product/:productId, match
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseUUIDPipe for ID validation
- [x] PATCH instead of PUT (not applicable, no PUT existed)
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (PaginatedResponse)
- [x] Exported interfaces
- [x] No search (not applicable)
- [x] Sort: createdAt desc (default)
- [x] AppLogger throughout (existing)
- [x] Soft delete + restore
- [x] Dependency check (treatments)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly (ternaries)
- [x] No restore on duplicate (complex composite unique constraint)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findByProduct, findForTreatment
- [x] Utility method: calculateWithdrawalDate

### Priority Matching Logic ✅
- [x] Priority 1: country + age category specific
- [x] Priority 2: country specific, all ages
- [x] Priority 3: universal country, age specific
- [x] Priority 4: universal country, all ages
- [x] Falls back through priorities
- [x] Returns null if no match

### Validation ✅
- [x] Product existence check
- [x] Species existence check
- [x] Route existence check
- [x] withdrawalMeatDays is required
- [x] Positive number validations
- [x] Unique constraint handling

### Documentation ✅
- [x] I18N_KEYS.md (72 keys)
- [x] TESTS_PLAN.md (75+ test cases, 8 endpoints)
- [x] THERAPEUTIC_INDICATIONS_MIGRATION_CHECKLIST.md

## Completion: 33/33 (100%) ✅

## Notes
- Admin-only entity (no farm-scoped endpoints)
- Unique constraint on 5 fields: productId, countryCode, speciesId, ageCategoryId, routeId
- countryCode=null means universal rule (all countries)
- ageCategoryId=null means all ages
- withdrawalMeatDays is critical for food safety
- Priority matching logic enables flexible rule configuration
- isVerified flag for staged validation workflow
- doseOriginalText preserves regulatory documentation
- calculateWithdrawalDate utility for treatment planning
- Dependency check prevents deletion if used in treatments
- No restore on duplicate (composite constraint too complex)
