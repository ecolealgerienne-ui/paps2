# National Campaigns Testing Plan

## Overview
Admin-only entity for managing national veterinary campaigns (vaccination, deworming, etc.).
- **Total Endpoints:** 8
- **Test Categories:** CRUD, Pagination, Filters, Search, Date validation, Optimistic locking, Restore
- **Estimated Test Cases:** 95+

---

## 1. POST /api/v1/national-campaigns (Create Campaign)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Create without authentication
- [ ] ❌ 403 - Create without admin role
- [ ] ✅ 201 - Create with admin authentication

### Validation (20 tests)
- [ ] ❌ 400 - Missing code
- [ ] ❌ 400 - code too short (< 2 chars)
- [ ] ❌ 400 - code too long (> 50 chars)
- [ ] ❌ 400 - Missing nameFr
- [ ] ❌ 400 - nameFr too short
- [ ] ❌ 400 - nameFr too long
- [ ] ❌ 400 - Missing nameEn
- [ ] ❌ 400 - Missing nameAr
- [ ] ❌ 400 - description too long (> 500 chars)
- [ ] ❌ 400 - Missing type
- [ ] ❌ 400 - Invalid type (not in enum)
- [ ] ❌ 400 - Missing startDate
- [ ] ❌ 400 - Missing endDate
- [ ] ❌ 400 - Invalid startDate format
- [ ] ❌ 400 - Invalid endDate format
- [ ] ❌ 400 - startDate after endDate
- [ ] ❌ 400 - startDate equals endDate
- [ ] ❌ 400 - isActive not boolean
- [ ] ❌ 409 - Duplicate code (active campaign)
- [ ] ✅ 201 - All optional fields omitted (description, isActive defaults to true)

### Business Logic (8 tests)
- [ ] ✅ 201 - Create with all valid fields
- [ ] ✅ 201 - Create with each campaign type (vaccination, deworming, screening, treatment, census, other)
- [ ] ✅ Verify createdAt set automatically
- [ ] ✅ Verify version defaults to 1
- [ ] ✅ Verify isActive defaults to true
- [ ] ✅ Verify deletedAt is null
- [ ] ✅ 201 - Auto-restore deleted campaign with same code
- [ ] ✅ Verify version increments on restore

### Data Integrity (3 tests)
- [ ] ✅ Verify unique constraint on code
- [ ] ✅ Verify dates stored as DateTime
- [ ] ✅ Verify all multilingual names stored correctly

---

## 2. GET /api/v1/national-campaigns (Get All with Pagination)

### Pagination (6 tests)
- [ ] ✅ 200 - Default pagination (page=1, limit=20)
- [ ] ✅ 200 - Custom pagination (page=2, limit=10)
- [ ] ✅ 200 - Limit max capped at 100
- [ ] ✅ 200 - Page minimum is 1 (negative becomes 1)
- [ ] ✅ Verify meta.total, meta.page, meta.limit, meta.pages
- [ ] ✅ Verify empty array when no results

### Filters (4 tests)
- [ ] ✅ 200 - Filter by type (vaccination)
- [ ] ✅ 200 - Filter by type (deworming)
- [ ] ✅ 200 - Filter by isActive=true
- [ ] ✅ 200 - Filter by isActive=false
- [ ] ✅ 200 - Combined filters (type + isActive)
- [ ] ✅ Filter excludes soft-deleted campaigns

### Search (4 tests)
- [ ] ✅ 200 - Search in code
- [ ] ✅ 200 - Search in nameFr
- [ ] ✅ 200 - Search in nameEn
- [ ] ✅ 200 - Search in nameAr
- [ ] ✅ Search is case-insensitive

### Sorting (8 tests)
- [ ] ✅ 200 - Default sort: startDate DESC, code ASC
- [ ] ✅ 200 - Sort by nameFr ASC
- [ ] ✅ 200 - Sort by nameFr DESC
- [ ] ✅ 200 - Sort by code
- [ ] ✅ 200 - Sort by startDate
- [ ] ✅ 200 - Sort by endDate
- [ ] ✅ 200 - Sort by type
- [ ] ✅ 200 - Sort by createdAt
- [ ] ✅ Invalid orderBy falls back to default

---

## 3. GET /api/v1/national-campaigns/current (Get Current Campaigns)

### Success Cases (5 tests)
- [ ] ✅ 200 - Returns campaigns where today is between startDate and endDate
- [ ] ✅ Only returns isActive=true campaigns
- [ ] ✅ Excludes soft-deleted campaigns
- [ ] ✅ Sorted by endDate ASC, then code ASC
- [ ] ✅ Returns empty array if no current campaigns

### Edge Cases (4 tests)
- [ ] ✅ Campaign starts today (included)
- [ ] ✅ Campaign ends today (included)
- [ ] ✅ Campaign starts tomorrow (excluded)
- [ ] ✅ Campaign ended yesterday (excluded)

---

## 4. GET /api/v1/national-campaigns/code/:code (Get by Code)

### Success Cases (2 tests)
- [ ] ✅ 200 - Get campaign by code
- [ ] ✅ Code search is case-sensitive

### Error Cases (3 tests)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 404 - Campaign soft-deleted
- [ ] ❌ 400 - Invalid code format (empty string)

---

## 5. GET /api/v1/national-campaigns/:id (Get One by ID)

### Success Cases (2 tests)
- [ ] ✅ 200 - Get campaign by UUID
- [ ] ✅ Includes all fields

### Error Cases (3 tests)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 404 - Campaign soft-deleted
- [ ] ❌ 400 - Invalid UUID format

---

## 6. PATCH /api/v1/national-campaigns/:id (Update Campaign)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Update without authentication
- [ ] ❌ 403 - Update without admin role
- [ ] ✅ 200 - Update with admin authentication

### Validation (10 tests)
- [ ] ❌ 400 - code modification attempt (immutable)
- [ ] ❌ 400 - nameFr too short
- [ ] ❌ 400 - nameEn too short
- [ ] ❌ 400 - description too long
- [ ] ❌ 400 - Invalid type
- [ ] ❌ 400 - Invalid startDate format
- [ ] ❌ 400 - Invalid endDate format
- [ ] ❌ 400 - startDate after endDate
- [ ] ❌ 400 - isActive not boolean
- [ ] ❌ 404 - Campaign not found

### Optimistic Locking (4 tests)
- [ ] ❌ 409 - Version mismatch (expected 1, got 2)
- [ ] ✅ 200 - Update with correct version
- [ ] ✅ Verify version increments on update
- [ ] ✅ 200 - Update without version (allowed, no conflict check)

### Partial Updates (8 tests)
- [ ] ✅ 200 - Update only nameFr (other fields unchanged)
- [ ] ✅ 200 - Update only nameEn
- [ ] ✅ 200 - Update only nameAr
- [ ] ✅ 200 - Update only description
- [ ] ✅ 200 - Update only type
- [ ] ✅ 200 - Update only dates
- [ ] ✅ 200 - Update only isActive
- [ ] ✅ 200 - Update multiple fields

### Date Validation (5 tests)
- [ ] ❌ 400 - Update startDate to after endDate
- [ ] ❌ 400 - Update endDate to before startDate
- [ ] ✅ 200 - Update both startDate and endDate (valid)
- [ ] ✅ 200 - Update only startDate (still before existing endDate)
- [ ] ✅ 200 - Update only endDate (still after existing startDate)

---

## 7. DELETE /api/v1/national-campaigns/:id (Soft Delete)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Delete without authentication
- [ ] ❌ 403 - Delete without admin role
- [ ] ✅ 200 - Delete with admin authentication

### Success Cases (5 tests)
- [ ] ✅ 200 - Soft delete campaign
- [ ] ✅ Verify deletedAt timestamp set
- [ ] ✅ Verify isActive set to false
- [ ] ✅ Verify version increments
- [ ] ✅ Returns the deleted campaign

### Error Cases (3 tests)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 404 - Campaign already soft-deleted
- [ ] ❌ 400 - Invalid UUID format

### Dependency Check (2 tests)
- [ ] ❌ 409 - Cannot delete: has campaign-country associations
- [ ] ❌ 409 - Cannot delete: has farm preferences

---

## 8. POST /api/v1/national-campaigns/:id/restore (Restore Soft-Deleted)

### Authentication & Authorization (3 tests)
- [ ] ❌ 401 - Restore without authentication
- [ ] ❌ 403 - Restore without admin role
- [ ] ✅ 200 - Restore with admin authentication

### Success Cases (4 tests)
- [ ] ✅ 200 - Restore soft-deleted campaign
- [ ] ✅ Verify deletedAt set to null
- [ ] ✅ Verify version increments
- [ ] ✅ Returns the restored campaign

### Error Cases (4 tests)
- [ ] ❌ 404 - Campaign not found
- [ ] ❌ 409 - Campaign is not deleted
- [ ] ❌ 400 - Invalid UUID format
- [ ] ✅ isActive remains unchanged (not auto-reactivated)

---

## Integration Tests (8 tests)

### Cascade Operations
- [ ] ✅ Soft-deleting campaign cascades to CampaignCountry (database level)
- [ ] ✅ Restoring campaign does NOT restore CampaignCountry

### Unique Constraint
- [ ] ✅ Cannot have duplicate codes (active campaigns)
- [ ] ✅ Can create after deleting campaign with same code

### Date Logic
- [ ] ✅ findCurrent() correctly identifies campaigns in progress
- [ ] ✅ Date comparison uses inclusive boundaries (start <= today <= end)

### Version Control
- [ ] ✅ Concurrent updates detected by version mismatch
- [ ] ✅ Version increments on create, update, delete, restore

---

## Performance Tests (3 tests)

### Query Performance
- [ ] ⚡ findAll with 1000+ campaigns < 200ms
- [ ] ⚡ findCurrent with 100+ campaigns < 100ms
- [ ] ⚡ Search across all text fields < 300ms

---

## Summary

| Endpoint | Auth | Validation | Business | Success | Total |
|----------|------|------------|----------|---------|-------|
| POST (Create) | 3 | 20 | 8 | 3 | 34 |
| GET (All) | 0 | 0 | 0 | 22 | 22 |
| GET (Current) | 0 | 0 | 0 | 9 | 9 |
| GET (By Code) | 0 | 0 | 0 | 5 | 5 |
| GET (By ID) | 0 | 0 | 0 | 5 | 5 |
| PATCH (Update) | 3 | 10 | 17 | 5 | 35 |
| DELETE | 3 | 3 | 5 | 2 | 13 |
| POST (Restore) | 3 | 4 | 4 | 0 | 11 |
| Integration | - | - | - | 8 | 8 |
| Performance | - | - | - | 3 | 3 |

**Total Test Cases: 145**

---

## Testing Notes

### Critical Scenarios
1. **Date validation** - startDate must always be before endDate
2. **Optimistic locking** - Version conflicts must be detected
3. **Restore on duplicate** - Creating with deleted code restores the campaign
4. **findCurrent()** - Must use inclusive date boundaries
5. **Dependency check** - Cannot delete if has related records (future implementation)

### Edge Cases
- [ ] Campaign spanning multiple years
- [ ] Campaign with identical start and end dates (should fail)
- [ ] Update startDate and endDate in same request
- [ ] Restore campaign then immediately delete again
- [ ] Search with special characters in names
- [ ] Filter by non-existent type (returns empty)
- [ ] Pagination beyond total pages (returns empty)
- [ ] Concurrent updates causing version conflict

### Security Tests
- [ ] Non-admin cannot create/update/delete campaigns
- [ ] Non-authenticated user can read campaigns
- [ ] Admin can manage any campaign

---

## Test Data Requirements

### Minimum Test Data
- 5+ campaigns (different types)
- 2+ current campaigns (today between start/end)
- 2+ upcoming campaigns (start > today)
- 2+ past campaigns (end < today)
- 1+ soft-deleted campaign
- 1+ campaign with country associations (for dependency test)

### Test Scenarios
1. Current vaccination campaign
2. Upcoming deworming campaign
3. Past screening campaign
4. Deleted census campaign
5. Campaign with multiple countries
6. Campaign with farm preferences
7. Campaign with Arabic/French/English names
8. Long-running campaign (> 1 year)

---

## Special Validation Rules

### Date Validation
```typescript
// startDate < endDate (exclusive)
// Both dates must be valid ISO strings
// findCurrent uses: startDate <= today <= endDate (inclusive)
```

### Code Uniqueness
```typescript
// Unique among active campaigns
// Can reuse code after deletion (auto-restore)
// Case-sensitive
```

### Optimistic Locking
```typescript
// version increments on: create (1), update (+1), delete (+1), restore (+1)
// Update fails if version mismatch (409 Conflict)
// Optional version check (can update without version)
```

### Campaign Types
```typescript
enum CampaignType {
  vaccination
  deworming
  screening
  treatment
  census
  other
}
```
