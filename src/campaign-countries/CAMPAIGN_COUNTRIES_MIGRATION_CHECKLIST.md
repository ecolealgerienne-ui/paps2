# Campaign-Countries Migration Checklist

## Entity: CampaignCountry (13/16 - Phase 1)

### Schema ✅
- [x] 6 fields: id, campaignId, countryCode, isActive, createdAt, updatedAt
- [x] No version (no optimistic locking needed - junction table)
- [x] No deletedAt (uses isActive for soft deactivation)
- [x] Relations: campaign (FK), country (FK)
- [x] Indexes: campaignId, countryCode, isActive
- [x] Unique constraint: [campaignId, countryCode]

### DTOs ✅
- [x] LinkCampaignCountryDto (campaignId, countryCode validation)
- [x] No UpdateDto (junction tables use link/unlink pattern)
- [x] CampaignCountryResponseDto (all fields, nested campaign/country info)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1/campaign-countries`
- [x] 7 endpoints total
- [x] Guards: AuthGuard + AdminGuard on POST/DELETE/restore
- [x] Pagination query params (page, limit)
- [x] Filter query params (campaignId, countryCode, isActive)
- [x] Search query param
- [x] Sort query params (orderBy, order)
- [x] Specialized endpoints: campaign/:campaignId, country/:countryCode
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseIntPipe/ParseBoolPipe for query params
- [x] No PATCH (junction tables use link/unlink)
- [x] DELETE deactivates (returns entity, not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 7 fields (campaign code, nameFr, nameEn, nameAr, country code, nameFr, nameEn)
- [x] Sort whitelist: createdAt, updatedAt, isActive
- [x] Default sort: campaign.nameFr, country.nameFr
- [x] AppLogger throughout
- [x] Soft deactivation (isActive flag instead of deletedAt)
- [x] No dependency check (junction tables typically have no dependencies)
- [x] No optimistic locking (no version field - junction table)
- [x] Link/Unlink pattern instead of create/delete
- [x] Restore on duplicate in link() method (lines 298-325)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findCountriesByCampaign, findCampaignsByCountry

### Special Characteristics ✅
- [x] Junction table pattern (many-to-many: NationalCampaign ↔ Country)
- [x] Uses isActive instead of deletedAt
- [x] Link/Unlink operations instead of create/delete
- [x] Restore reactivates deactivated associations
- [x] Composite unique constraint: [campaignId, countryCode]
- [x] Validates existence of both campaign and country before linking
- [x] Filters out deleted campaigns in queries

### Documentation ✅
- [x] I18N_KEYS.md
- [x] TESTS_PLAN.md
- [x] CAMPAIGN_COUNTRIES_MIGRATION_CHECKLIST.md

## Completion Status

### Implemented: 33/33 (100%) ✅

**All Requirements Met:**
- Junction table pattern fully implemented
- Link/Unlink operations with proper validation
- Restore on duplicate (auto-reactivate)
- AppLogger integration
- Pagination, search, filters, sorting
- Specialized endpoints for campaign and country queries
- Admin-only mutations with Guards
- Full Swagger documentation

**Notes:**
- Junction tables follow different patterns than regular entities:
  - No version field (optimistic locking not needed)
  - Uses isActive instead of deletedAt (deactivation vs deletion)
  - Link/Unlink pattern instead of create/delete
  - No dependency checks (junction tables are dependencies themselves)
- Composite unique key prevents duplicate associations
- isActive flag allows temporary deactivation without losing history
- Restore operation reactivates deactivated associations
- Cascading deletes configured at database level (onDelete: Cascade)
- Filters out soft-deleted campaigns from queries

## Migration Complete ✅

This entity follows the junction table pattern and meets all 33 points of the standard migration checklist with appropriate adaptations for junction table semantics.
