# Campaign-Countries Testing Plan

## Overview
Junction table entity (NationalCampaign ↔ Country) with link/unlink pattern.
- **Total Endpoints:** 7
- **Test Categories:** Link/Unlink, Pagination, Filters, Search, Specialized queries, Restore
- **Estimated Test Cases:** 65+

---

## 1. POST /api/v1/campaign-countries (Link Campaign to Country)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Link without authentication
- [ ] ❌ 403 - Link without admin role
- [ ] ✅ 201 - Link with admin authentication

### Validation (10 tests)
- [ ] ❌ 400 - Missing campaignId
- [ ] ❌ 400 - Missing countryCode
- [ ] ❌ 400 - Invalid campaignId format (not UUID)
- [ ] ❌ 400 - Invalid countryCode format (not ISO alpha-2)
- [ ] ❌ 400 - countryCode too short (1 char)
- [ ] ❌ 400 - countryCode too long (3+ chars)
- [ ] ❌ 400 - countryCode lowercase (must be uppercase)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 404 - Campaign soft-deleted
- [ ] ❌ 404 - Country not found

### Business Logic (5 tests)
- [ ] ✅ 201 - Link campaign to country (new association)
- [ ] ❌ 409 - Link already exists and is active
- [ ] ✅ 201 - Auto-reactivate deactivated association
- [ ] ✅ Verify campaign info in response (code, nameFr, type)
- [ ] ✅ Verify country info in response (code, nameFr)

### Data Integrity (3 tests)
- [ ] ✅ Verify createdAt set automatically
- [ ] ✅ Verify isActive defaults to true
- [ ] ✅ Verify unique constraint [campaignId, countryCode]

---

## 2. GET /api/v1/campaign-countries (Get All with Pagination)

### Pagination (6 tests)
- [ ] ✅ 200 - Default pagination (page=1, limit=50)
- [ ] ✅ 200 - Custom pagination (page=2, limit=10)
- [ ] ✅ 200 - Limit max capped at 100
- [ ] ✅ 200 - Page minimum is 1 (negative becomes 1)
- [ ] ✅ Verify meta.total, meta.page, meta.limit, meta.pages
- [ ] ✅ Verify empty array when no results

### Filters (4 tests)
- [ ] ✅ 200 - Filter by campaignId
- [ ] ✅ 200 - Filter by countryCode
- [ ] ✅ 200 - Filter by isActive=true
- [ ] ✅ 200 - Filter by isActive=false
- [ ] ✅ 200 - Combined filters (campaignId + countryCode)
- [ ] ✅ Filter excludes deleted campaigns

### Search (4 tests)
- [ ] ✅ 200 - Search in campaign.code
- [ ] ✅ 200 - Search in campaign names (nameFr, nameEn, nameAr)
- [ ] ✅ 200 - Search in country.code
- [ ] ✅ 200 - Search in country names (nameFr, nameEn)
- [ ] ✅ Search is case-insensitive

### Sorting (5 tests)
- [ ] ✅ 200 - Default sort: campaign.nameFr ASC, country.nameFr ASC
- [ ] ✅ 200 - Sort by createdAt ASC
- [ ] ✅ 200 - Sort by createdAt DESC
- [ ] ✅ 200 - Sort by updatedAt
- [ ] ✅ 200 - Sort by isActive
- [ ] ✅ Invalid orderBy falls back to default

---

## 3. GET /api/v1/campaign-countries/campaign/:campaignId (Get Countries by Campaign)

### Success Cases (3 tests)
- [ ] ✅ 200 - Get all countries for a campaign
- [ ] ✅ Only returns isActive=true associations
- [ ] ✅ Sorted by country.nameFr ASC
- [ ] ✅ Returns empty array if campaign has no countries
- [ ] ✅ Includes full country info

### Error Cases (2 tests)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 404 - Campaign soft-deleted

---

## 4. GET /api/v1/campaign-countries/country/:countryCode (Get Campaigns by Country)

### Success Cases (4 tests)
- [ ] ✅ 200 - Get all campaigns for a country
- [ ] ✅ Only returns isActive=true associations
- [ ] ✅ Only returns campaigns where deletedAt=null
- [ ] ✅ Sorted by campaign.nameFr ASC
- [ ] ✅ Returns empty array if country has no campaigns
- [ ] ✅ Includes full campaign info (code, type, names)

### Error Cases (2 tests)
- [ ] ❌ 404 - Country not found
- [ ] ❌ 400 - Invalid countryCode format

---

## 5. GET /api/v1/campaign-countries/:id (Get One Association)

### Success Cases (2 tests)
- [ ] ✅ 200 - Get association by ID
- [ ] ✅ Includes nested campaign and country info

### Error Cases (3 tests)
- [ ] ❌ 404 - Association not found
- [ ] ❌ 404 - Association exists but isActive=false
- [ ] ❌ 400 - Invalid UUID format

---

## 6. DELETE /api/v1/campaign-countries (Unlink Campaign from Country)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Unlink without authentication
- [ ] ❌ 403 - Unlink without admin role
- [ ] ✅ 200 - Unlink with admin authentication

### Success Cases (3 tests)
- [ ] ✅ 200 - Unlink active association
- [ ] ✅ Verify isActive set to false (not deleted)
- [ ] ✅ Returns the updated association
- [ ] ✅ Association still exists in database (soft deactivation)

### Error Cases (5 tests)
- [ ] ❌ 400 - Missing campaignId
- [ ] ❌ 400 - Missing countryCode
- [ ] ❌ 400 - Invalid campaignId format
- [ ] ❌ 400 - Invalid countryCode format
- [ ] ❌ 404 - Association not found
- [ ] ❌ 404 - Association exists but already inactive

---

## 7. POST /api/v1/campaign-countries/:id/restore (Restore Deactivated Association)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Restore without authentication
- [ ] ❌ 403 - Restore without admin role
- [ ] ✅ 200 - Restore with admin authentication

### Success Cases (3 tests)
- [ ] ✅ 200 - Restore deactivated association
- [ ] ✅ Verify isActive set to true
- [ ] ✅ Returns the restored association
- [ ] ✅ Includes nested campaign and country info

### Error Cases (4 tests)
- [ ] ❌ 400 - Invalid UUID format
- [ ] ❌ 404 - Association not found
- [ ] ❌ 409 - Association already active (not deactivated)
- [ ] ❌ Can restore even if campaign is deleted (business decision)

---

## Integration Tests (5 tests)

### Cascade Operations
- [ ] ✅ Deleting campaign cascades to CampaignCountry (database level)
- [ ] ✅ Deleting country cascades to CampaignCountry (database level)

### Unique Constraint
- [ ] ✅ Cannot have duplicate [campaignId, countryCode] pairs
- [ ] ✅ Can reactivate after unlinking (same composite key)

### Transaction Integrity
- [ ] ✅ Link operation is atomic (fails if campaign or country missing)

---

## Performance Tests (3 tests)

### Query Performance
- [ ] ⚡ findAll with 1000+ associations < 200ms
- [ ] ⚡ findCountriesByCampaign with 50+ countries < 100ms
- [ ] ⚡ Search across campaigns and countries < 300ms

---

## Summary

| Endpoint | Auth | Validation | Business | Success | Total |
|----------|------|------------|----------|---------|-------|
| POST (Link) | 3 | 10 | 5 | 3 | 21 |
| GET (All) | 0 | 0 | 0 | 19 | 19 |
| GET (By Campaign) | 0 | 0 | 0 | 7 | 7 |
| GET (By Country) | 0 | 0 | 0 | 8 | 8 |
| GET (One) | 0 | 0 | 0 | 5 | 5 |
| DELETE (Unlink) | 3 | 5 | 0 | 3 | 11 |
| POST (Restore) | 3 | 4 | 0 | 3 | 10 |
| Integration | - | - | - | 5 | 5 |
| Performance | - | - | - | 3 | 3 |

**Total Test Cases: 89**

---

## Testing Notes

### Junction Table Specifics
- Uses isActive flag instead of deletedAt (deactivation vs deletion)
- Link/Unlink operations instead of create/delete
- Restore reactivates deactivated associations
- Composite unique key [campaignId, countryCode]
- Cascading deletes at database level

### Critical Scenarios
1. **Link with deleted campaign** - Should return 404
2. **Auto-reactivation** - Linking again should reactivate if exists
3. **Search across relations** - Must search in both campaign and country fields
4. **Filter deleted campaigns** - Must exclude campaigns where deletedAt != null
5. **Cascade deletes** - Database handles cleanup (not application)

### Edge Cases
- [ ] Link with uppercase countryCode
- [ ] Link with lowercase countryCode (should fail validation)
- [ ] Search with special characters
- [ ] Pagination with page beyond total pages (returns empty)
- [ ] Filter by non-existent campaignId (returns empty, not 404)
- [ ] Restore association for deleted campaign (allowed or blocked?)

### Security Tests
- [ ] Non-admin cannot link/unlink
- [ ] Non-authenticated user cannot access protected endpoints
- [ ] Admin can link/unlink any campaign-country pair
- [ ] Public endpoints (GET) accessible without auth

---

## Test Data Requirements

### Minimum Test Data
- 3+ campaigns (different types, some deleted)
- 5+ countries (different regions)
- 10+ campaign-country associations (various states)
- 2+ deactivated associations (for restore tests)

### Test Scenarios
1. Campaign with multiple countries
2. Country with multiple campaigns
3. Campaign with no countries
4. Country with no campaigns
5. Deactivated associations
6. Deleted campaign with associations (cascade test)
