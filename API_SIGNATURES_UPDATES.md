# API Signatures Updates - Phase 3 (P2) Improvements

**Version:** 1.1
**Last Updated:** 2025-11-24
**Phase:** P2 - Quality & Standardization

---

## Table of Contents

1. [Overview of Changes](#overview-of-changes)
2. [Error Response Format (Breaking Change)](#error-response-format-breaking-change)
3. [New Validation Rules](#new-validation-rules)
4. [Sync Service Error Codes](#sync-service-error-codes)
5. [Version Conflict Handling](#version-conflict-handling)
6. [Migration Guide for Clients](#migration-guide-for-clients)

---

## Overview of Changes

Phase 3 introduces **critical improvements** to API quality, validation, and error handling:

### ✅ Implemented:
- [x] **Structured Error Responses** - Standardized error format with ERROR_CODES
- [x] **Cross-Field Validation** - Complex business logic validation
- [x] **Error Code Standardization** - Machine-readable error codes for i18n
- [x] **Conflict Resolution Guide** - Optimistic locking documentation
- [x] **Batch Operations** - Atomic transactions for consistency

### 📊 Impact:
- **Breaking Changes:** YES - Error format and some validation payloads
- **Backward Compatible:** NO - Clients must update parsing logic
- **Deployment:** Coordinated with mobile/web app updates required

---

## Error Response Format (Breaking Change)

### BEFORE (Old Format)
```json
{
  "statusCode": 404,
  "message": "NotFoundException: Animal not found"
}
```

### AFTER (New Format) ✅
```json
{
  "success": false,
  "error": {
    "code": "ANIMAL_NOT_FOUND",
    "statusCode": 404,
    "message": "Animal with ID 'animal-123' not found",
    "context": {
      "animalId": "animal-123",
      "farmId": "farm-456"
    }
  },
  "timestamp": "2025-11-24T10:30:45.123Z"
}
```

### Format Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | boolean | Yes | Always `false` for errors |
| `error.code` | string | Yes | Machine-readable error code (for i18n) |
| `error.statusCode` | number | Yes | HTTP status code |
| `error.message` | string | Yes | Human-readable error message |
| `error.context` | object | No | Additional debugging context |
| `timestamp` | string | Yes | ISO 8601 timestamp |

### Error Codes (Complete List)

**Animals**
- `ANIMAL_NOT_FOUND` (404)
- `ANIMAL_MUST_BE_FEMALE` (400)
- `ANIMAL_MUST_BE_MALE` (400)

**Lots**
- `LOT_NOT_FOUND` (404)

**Treatments**
- `TREATMENT_NOT_FOUND` (404)
- `TREATMENT_ANIMAL_NOT_FOUND` (400)

**Vaccinations**
- `VACCINATION_NOT_FOUND` (404)
- `VACCINATION_ANIMAL_NOT_FOUND` (400)

**Sync Operations**
- `SYNC_CREATE_FAILED` (400)
- `SYNC_UPDATE_FAILED` (400)
- `SYNC_DELETE_FAILED` (400)
- `SYNC_CONFLICT` (409)

**Generic**
- `VALIDATION_FAILED` (400)
- `VERSION_CONFLICT` (409)
- `ENTITY_NOT_FOUND` (404)
- `ENTITY_ALREADY_EXISTS` (409)
- `UNAUTHORIZED` (401)
- `FARM_ACCESS_DENIED` (403)
- `INTERNAL_SERVER_ERROR` (500)
- `DATABASE_ERROR` (500)

### Example: 400 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "statusCode": 400,
    "message": "Validation failed",
    "errors": [
      {
        "field": "sex",
        "message": "sex must be one of: male, female"
      },
      {
        "field": "birthDate",
        "message": "birthDate must be a valid ISO8601 date string"
      }
    ]
  },
  "timestamp": "2025-11-24T10:30:45.123Z"
}
```

### Example: 409 Conflict (Version Conflict)

```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "statusCode": 409,
    "message": "Version conflict detected",
    "context": {
      "entityId": "animal-123",
      "serverVersion": 3,
      "clientVersion": 2
    }
  },
  "timestamp": "2025-11-24T10:30:45.123Z"
}
```

---

## New Validation Rules

### ✅ Animals (CreateAnimalDto)

#### Rule 1: Mother Must Be Female ❌ BREAKING
```
If motherId is provided:
  - animal sex MUST be 'female'
  - Reason: Only female animals can be mothers

Status Code: 400 VALIDATION_FAILED
Error Code: ANIMAL_MUST_BE_FEMALE
```

**Example: INVALID Request**
```json
POST /farms/:farmId/animals
{
  "id": "uuid",
  "sex": "male",
  "motherId": "mother-uuid",
  "birthDate": "2025-01-01"
}
```

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "An animal with a motherId must have sex='female'"
  }
}
```

---

### ✅ Vaccinations (CreateVaccinationDto)

#### Rule 2: Animal IDs Must Be XOR ❌ BREAKING
```
Exactly ONE of these must be provided (not zero, not both):
  - animal_ids (array of UUIDs) - for batch vaccination
  - animalId (single UUID) - for single vaccination
  - animalIds (legacy string) - deprecated format

Status Code: 400 VALIDATION_FAILED
Error Code: VALIDATION_FAILED (isXorField)
```

**Example: INVALID Request (No animal source)**
```json
POST /farms/:farmId/vaccinations
{
  "vaccinationDate": "2025-11-24",
  "vaccine_id": "vaccine-123"
}
```

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Exactly one of these fields must be provided: animal_ids, animalId, animalIds"
  }
}
```

#### Rule 3: Next Due Date >= Vaccination Date ✅ NEW
```
If nextDueDate is provided:
  - Must be >= vaccinationDate
  - Date format: ISO 8601 string

Status Code: 400 VALIDATION_FAILED
```

**Example: INVALID Request**
```json
{
  "vaccinationDate": "2025-11-24",
  "nextDueDate": "2025-11-20"  // Before vaccination!
}
```

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "This date must be after or equal to vaccinationDate"
  }
}
```

---

### ✅ Treatments (CreateTreatmentDto)

#### Rule 4: Animal IDs Must Be XOR ❌ BREAKING
```
Exactly ONE of these must be provided (not zero, not both):
  - animal_ids (array of UUIDs) - for batch treatment
  - animalId (single UUID) - for single treatment

Status Code: 400 VALIDATION_FAILED
```

#### Rule 5: Withdrawal End Date >= Treatment Date ✅ NEW
```
withdrawalEndDate MUST be >= treatmentDate

Reason: Withdrawal period cannot end before treatment starts

Status Code: 400 VALIDATION_FAILED
```

**Example: INVALID Request**
```json
{
  "treatmentDate": "2025-11-20",
  "withdrawalEndDate": "2025-11-15"  // Before treatment!
}
```

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "This date must be after or equal to treatmentDate"
  }
}
```

---

### ✅ Farm Preferences (CreateFarmProductPreferenceDto)

#### Rule 6: Product ID Must Be XOR ✅ ENHANCED
```
Exactly ONE of these must be provided (not zero, not both):
  - globalProductId - Product from global catalog
  - customProductId - Farm-specific custom product

Status Code: 400 VALIDATION_FAILED
Reason: A preference must reference exactly one product source
```

**Example: INVALID Request (Both provided)**
```json
{
  "globalProductId": "product-1",
  "customProductId": "product-2"
}
```

**Response: 400 Bad Request**
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Exactly one of these fields must be provided: globalProductId, customProductId"
  }
}
```

---

### ✅ Farm Vaccine Preferences (CreateFarmVaccinePreferenceDto)

#### Rule 7: Vaccine ID Must Be XOR ✅ ENHANCED
```
Exactly ONE of these must be provided:
  - globalVaccineId - Vaccine from global catalog
  - customVaccineId - Farm-specific custom vaccine

Same validation logic as Product Preferences
```

---

## Sync Service Error Codes

### New ERROR_CODES for Sync Operations

```typescript
SYNC_CREATE_FAILED = 'SYNC_CREATE_FAILED'    // Create operation failed
SYNC_UPDATE_FAILED = 'SYNC_UPDATE_FAILED'    // Update operation failed
SYNC_DELETE_FAILED = 'SYNC_DELETE_FAILED'    // Delete operation failed
SYNC_CONFLICT = 'SYNC_CONFLICT'              // Conflict detected during sync
```

### Sync Error Response Example

```json
{
  "success": true,
  "results": [
    {
      "entityId": "animal-123",
      "success": false,
      "error": {
        "code": "SYNC_CREATE_FAILED",
        "message": "Failed to create vaccination: Animal not found",
        "context": {
          "entityType": "vaccination"
        }
      }
    }
  ]
}
```

### Sync Summary with Conflict Detection

```json
{
  "success": true,
  "results": [ /* ... */ ],
  "summary": {
    "total": 10,
    "synced": 7,
    "conflicts": 2,  // Detected via error.code === VERSION_CONFLICT
    "failed": 1
  }
}
```

---

## Version Conflict Handling

### Detection

**Server Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "statusCode": 409,
    "message": "Version conflict detected",
    "context": {
      "entityId": "animal-123",
      "serverVersion": 3,
      "clientVersion": 2
    }
  }
}
```

### Client Handling Strategy

**Step 1: Detect Conflict**
```javascript
if (response.status === 409 && response.error?.code === 'VERSION_CONFLICT') {
  // Handle conflict
}
```

**Step 2: Fetch Latest**
```javascript
const latest = await GET `/farms/:farmId/animals/:id`;
const latestVersion = latest.data.version;
```

**Step 3: Merge**
```javascript
// Server-wins strategy
const merged = latestData;
merged.name = userUpdatedValue;
```

**Step 4: Retry**
```javascript
await PUT `/farms/:farmId/animals/:id` with {
  ...merged,
  version: latestVersion
};
```

---

## Migration Guide for Clients

### For Mobile App Developers

#### 1. Update Error Parsing
**BEFORE:**
```dart
if (response.statusCode == 404) {
  showError(response.body);
}
```

**AFTER:**
```dart
final json = jsonDecode(response.body);
if (json['error']['code'] == 'ANIMAL_NOT_FOUND') {
  final message = Translations.get(json['error']['code']);  // i18n key
  showError(message);
}
```

#### 2. Add Validation Before Sending
**BEFORE:**
```dart
// Send anything, backend validates later
api.createVaccination(vaccination);
```

**AFTER:**
```dart
// Validate XOR fields BEFORE sending
if ((vaccination.animal_ids?.isEmpty ?? true) &&
    vaccination.animalId == null &&
    vaccination.animalIds == null) {
  showError("Select animal(s) for vaccination");
  return;
}

// Only one source allowed
final sources = [
  vaccination.animal_ids != null,
  vaccination.animalId != null,
  vaccination.animalIds != null,
].where((x) => x).length;

if (sources > 1) {
  showError("Provide only one animal source");
  return;
}

api.createVaccination(vaccination);
```

#### 3. Handle Version Conflicts
```dart
try {
  await api.updateAnimal(animal);
} on ApiException catch (e) {
  if (e.code == 'VERSION_CONFLICT') {
    final latest = await api.getAnimal(animal.id);

    // Show merge dialog to user
    final choice = await showMergeDialog(
      yourChange: animal.name,
      serverChange: latest.name,
    );

    if (choice == MergeChoice.useYours) {
      animal.version = latest.version;
      await api.updateAnimal(animal);
    } else if (choice == MergeChoice.useServer) {
      // Use latest from server
      updateUI(latest);
    }
  }
}
```

### For Web App Developers

#### 1. Update Axios/Fetch Error Handling
```typescript
try {
  await api.post('/farms/:farmId/animals', animalData);
} catch (error) {
  const errorCode = error.response?.data?.error?.code;

  if (errorCode === 'VALIDATION_FAILED') {
    const errors = error.response.data.error.errors;
    errors.forEach(e => {
      displayFieldError(e.field, e.message);
    });
  } else if (errorCode === 'VERSION_CONFLICT') {
    showConflictDialog(error.response.data.error.context);
  } else {
    showToast(errorCode);  // Use code as i18n key
  }
}
```

#### 2. Add Client-Side Validation
```typescript
function validateVaccination(vac: Vaccination): string[] {
  const errors = [];

  // Check XOR: exactly one animal source
  const animalSources = [
    vac.animal_ids?.length > 0,
    !!vac.animalId,
    !!vac.animalIds
  ].filter(Boolean).length;

  if (animalSources !== 1) {
    errors.push("Select animal(s) for vaccination");
  }

  // Check date range
  if (vac.nextDueDate && vac.nextDueDate < vac.vaccinationDate) {
    errors.push("Next due date must be after vaccination date");
  }

  return errors;
}
```

#### 3. Handle Conflicts with Merge Dialog
```typescript
async function updateWithConflictHandling(
  resource: string,
  id: string,
  data: any
) {
  try {
    return await api.put(`${resource}/${id}`, data);
  } catch (error) {
    if (error.response?.status === 409) {
      const conflictData = error.response.data;
      const serverVersion = conflictData.error.context.serverVersion;

      // Fetch latest
      const latest = await api.get(`${resource}/${id}`);

      // Show merge modal
      const userChoice = await showMergeModal({
        clientData: data,
        serverData: latest.data,
      });

      if (userChoice === 'useClient') {
        // Retry with server version
        return await api.put(`${resource}/${id}`, {
          ...data,
          version: serverVersion
        });
      }
      return latest.data;
    }
    throw error;
  }
}
```

---

## Summary of Breaking Changes

| Change | Impact | Action Required |
|--------|--------|-----------------|
| **Error Format** | All error responses changed | Update error parsing in all clients |
| **Error Codes** | New machine-readable codes | Map codes to i18n translations |
| **Animal motherId** | Now validates sex=female | Add validation before sending |
| **Vaccination animal_ids** | Now XOR required | Provide exactly one animal source |
| **Treatment animal_ids** | Now XOR required | Provide exactly one animal source |
| **Date Range Validation** | New validations on dates | Validate date ranges before sending |
| **Product/Vaccine Preferences** | XOR now enforced | Provide exactly one source (global or custom) |

---

## Timeline

- **Phase 3 Release:** 2025-11-24
- **Client Update Required:** Before using Phase 3 APIs
- **Recommended Strategy:** Deploy backend + client updates together

---

**For detailed error code mapping and i18n setup, see:** [VERSION_CONFLICT_HANDLING.md](./docs/VERSION_CONFLICT_HANDLING.md)
