# Administration Routes - E2E Tests Plan

## Test Coverage Requirements
**Target**: Minimum 80% coverage

---

## Endpoints to Test (8 total)
1. POST /api/v1/administration-routes (create)
2. GET /api/v1/administration-routes (findAll with pagination)
3. GET /api/v1/administration-routes/code/:code (findByCode)
4. GET /api/v1/administration-routes/:id (findOne)
5. PATCH /api/v1/administration-routes/:id (update)
6. PATCH /api/v1/administration-routes/:id/toggle-active (toggle)
7. DELETE /api/v1/administration-routes/:id (soft delete)
8. POST /api/v1/administration-routes/:id/restore (restore)

---

## 1. CREATE (POST /api/v1/administration-routes)

### ✅ Success Cases
- Create route with all fields (code, names, abbreviation, description)
- Create route with minimal fields (only code + names)
- Code auto-lowercase (create "ORAL" → stored as "oral")
- Restore soft-deleted route on duplicate code

### ❌ Error Cases
- Duplicate active code → 409 Conflict
- Invalid code format (uppercase, spaces) → 400
- Missing required fields (code, names) → 400
- Unauthorized (no token) → 401
- Forbidden (non-admin) → 403

---

## 2. GET ALL (GET /api/v1/administration-routes)

### ✅ Success Cases
- Default pagination (page 1, limit 20)
- Custom pagination (page 2, limit 10)
- Filter by isActive (true/false)
- Search by names (Fr/En/Ar)
- Search by code
- Search by abbreviation
- Sort by displayOrder ASC/DESC
- Sort by code, createdAt
- Combined filters (search + active + sort)
- Default sort (displayOrder → code)

### ❌ Error Cases
- Invalid page (< 1) → defaults to 1
- Limit > 100 → capped to 100

---

## 3. GET by Code (GET /api/v1/administration-routes/code/:code)

### ✅ Success Cases
- Find existing route by code
- Case-insensitive lookup ("ORAL" finds "oral")

### ❌ Error Cases
- Non-existent code → 404
- Soft-deleted route → 404

---

## 4. GET by ID (GET /api/v1/administration-routes/:id)

### ✅ Success Cases
- Find existing route by UUID

### ❌ Error Cases
- Invalid UUID → 404
- Soft-deleted route → 404

---

## 5. UPDATE (PATCH /api/v1/administration-routes/:id)

### ✅ Success Cases
- Update names (Fr/En/Ar)
- Update abbreviation
- Update description
- Update displayOrder
- Update isActive
- Partial update (only nameFr)
- Version auto-incremented

### ❌ Error Cases
- Non-existent ID → 404
- Code cannot be updated (excluded from UpdateDto)
- Unauthorized → 401
- Forbidden (non-admin) → 403

---

## 6. TOGGLE Active (PATCH /api/v1/administration-routes/:id/toggle-active)

### ✅ Success Cases
- Deactivate route (isActive: false)
- Reactivate route (isActive: true)

### ❌ Error Cases
- Non-existent ID → 404
- Unauthorized → 401
- Forbidden (non-admin) → 403

---

## 7. DELETE (DELETE /api/v1/administration-routes/:id)

### ✅ Success Cases
- Soft delete unused route (deletedAt set)

### ❌ Error Cases
- Route in use by Treatment → 409
- Route in use by TherapeuticIndication → 409
- Non-existent ID → 404
- Already deleted → 404
- Unauthorized → 401
- Forbidden (non-admin) → 403

---

## 8. RESTORE (POST /api/v1/administration-routes/:id/restore)

### ✅ Success Cases
- Restore soft-deleted route (deletedAt = null)

### ❌ Error Cases
- Route not found → 404
- Route not deleted → 409
- Unauthorized → 401
- Forbidden (non-admin) → 403

---

## Test Data Setup

### Seed Data
```typescript
const seedRoutes = [
  { code: 'oral', nameFr: 'Voie orale', nameEn: 'Oral route', nameAr: 'الطريق الفموي', abbreviation: 'PO', displayOrder: 1 },
  { code: 'injectable_im', nameFr: 'Injection intramusculaire', nameEn: 'Intramuscular injection', nameAr: 'الحقن العضلي', abbreviation: 'IM', displayOrder: 2 },
  { code: 'injectable_iv', nameFr: 'Injection intraveineuse', nameEn: 'Intravenous injection', nameAr: 'الحقن الوريدي', abbreviation: 'IV', displayOrder: 3 },
  { code: 'injectable_sc', nameFr: 'Injection sous-cutanée', nameEn: 'Subcutaneous injection', nameAr: 'الحقن تحت الجلد', abbreviation: 'SC', displayOrder: 4 },
  { code: 'topical', nameFr: 'Application topique', nameEn: 'Topical application', nameAr: 'التطبيق الموضعي', abbreviation: 'TOP', displayOrder: 5 },
];
```

---

## Test Structure
```
test/
  ├── administration-routes.e2e-spec.ts
  ├── fixtures/
  │   └── administration-routes.fixture.ts
  └── helpers/
      └── auth.helper.ts
```

---

## Commands
```bash
npm run test:e2e -- --testPathPattern=administration-routes
```

---

## Status
⚠️ **Tests not implemented yet** (MVP can proceed, implement before production)

**Total Test Cases**: 60+

---

**Created**: 2025-11-30
**Last Updated**: 2025-11-30
