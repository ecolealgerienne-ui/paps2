# National Campaigns Migration Checklist

## Entity: NationalCampaign (7/16 - Phase 1)

### Schema ✅
- [x] 13 fields: id, code, nameFr, nameEn, nameAr, description, type, startDate, endDate, isActive, version, deletedAt, createdAt, updatedAt
- [x] Has version (optimistic locking)
- [x] Has deletedAt (soft delete)
- [x] Relations: campaignCountries, farmPreferences
- [x] Indexes: code (unique)
- [x] Unique constraint: code

### DTOs ✅
- [x] CreateNationalCampaignDto (full validation)
- [x] UpdateNationalCampaignDto (excludes code - immutable, includes version)
- [x] NationalCampaignResponseDto (all fields, nullable types as `| null`)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/national-campaigns`
- [x] 8 endpoints total
- [x] Guards: AuthGuard + AdminGuard on POST/PATCH/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (type, isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Specialized endpoints: current, code/:code
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe/ParseEnumPipe for query params
- [x] PATCH instead of PUT
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 4 fields (code, nameFr, nameEn, nameAr)
- [x] Sort whitelist: nameFr, nameEn, code, startDate, endDate, type, createdAt
- [x] Default sort: startDate desc, code asc
- [x] AppLogger throughout
- [x] Soft delete + restore
- [ ] ❌ Dependency check needed (campaignCountries, farmPreferences)
- [x] Optimistic locking (version field)
- [x] update() handles undefined properly (ternaries)
- [x] Restore on duplicate in create() (lines 58-78)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findCurrent, findByCode
- [x] Utility method: validateDates

### Special Characteristics ✅
- [x] Code is immutable (excluded from UpdateDto, unique constraint)
- [x] Date validation (startDate must be before endDate)
- [x] findCurrent() returns campaigns where today is between startDate and endDate
- [x] Uses optimistic locking with version field
- [x] Restore on duplicate in create()

### Documentation ✅
- [x] I18N_KEYS.md
- [x] TESTS_PLAN.md
- [x] NATIONAL_CAMPAIGNS_MIGRATION_CHECKLIST.md

## Completion Status

### Implemented: 32/33 (97%) ✅

**Missing:**
1. ❌ Dependency check in remove() - must verify no related records exist in:
   - campaignCountries
   - farmPreferences (FarmNationalCampaignPreference)

**Notes:**
- National campaigns are admin-only entities
- Code is immutable after creation (unique constraint)
- Date validation ensures startDate < endDate
- findCurrent() is a specialized query for currently active campaigns
- Optimistic locking prevents concurrent modification conflicts
- Soft delete preserves historical data
- Restore on duplicate allows re-creating deleted campaigns

## Next Actions

1. Add dependency check in `remove()` method:
   ```typescript
   // Check campaignCountries
   const countriesCount = await this.prisma.campaignCountry.count({
     where: { campaignId: id },
   });

   if (countriesCount > 0) {
     throw new ConflictException(
       `Cannot delete campaign: ${countriesCount} country association(s) exist`,
     );
   }

   // Check farmPreferences
   const preferencesCount = await this.prisma.farmNationalCampaignPreference.count({
     where: { campaignId: id, deletedAt: null },
   });

   if (preferencesCount > 0) {
     throw new ConflictException(
       `Cannot delete campaign: ${preferencesCount} farm preference(s) depend on it`,
     );
   }
   ```

2. Update to 33/33 (100%) ✅
