# Version Conflict Handling Guide

## Overview

AniTra uses **optimistic locking** with version fields to handle concurrent updates safely.

## How It Works

### Version Field
Every entity has a `version` field:
- Incremented on each successful update
- Sent by client in UPDATE request as `clientVersion`
- Compared with server version for conflict detection

### Conflict Detection
```json
Client sends:
{
  "id": "animal-123",
  "name": "Updated Name",
  "version": 2
}

Server has version: 3

Response: 409 Conflict
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

## Client Handling Strategy

### Step 1: Detect Conflict
```javascript
if (response.status === 409) {
  const { serverVersion, entityId } = response.error.context;
  // Conflict detected - need to resolve
}
```

### Step 2: Fetch Latest Data
```javascript
const latest = await GET `/farms/:farmId/animals/:id`;
const latestData = latest.data;
const latestVersion = latestData.version;
```

### Step 3: Merge Changes
```javascript
// Option A: Server-wins (simplest)
const merged = latestData;
merged.name = "Updated Name";  // Apply your change on top

// Option B: Client-wins (ask user)
// Show dialog: "Your change vs Server change"
// Let user pick what to keep
```

### Step 4: Retry with New Version
```javascript
const result = await PUT `/farms/:farmId/animals/:id` with {
  ...merged,
  version: latestVersion
};
```

## Error Response Format

### Success (200)
```json
{
  "success": true,
  "data": {
    "id": "animal-123",
    "version": 3,
    "name": "Updated Name"
  },
  "timestamp": "2025-11-24T10:30:45.123Z"
}
```

### Conflict (409)
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

## When Conflicts Occur

1. **Concurrent updates** - Multiple users editing same animal
2. **Offline sync** - Client updates while offline, server changes meanwhile
3. **Slow network** - User retries before first request completes

## Recommended Strategies

### For Mobile (Offline-First)
```
1. Fetch latest (get new version)
2. Merge: Apply user's change on top of latest
3. Retry automatically (user doesn't see conflict)
4. Show toast if merge affects what user entered
```

### For Web (Online-Only)
```
1. Fetch latest
2. Show merge dialog: "Your change vs Server change"
3. User picks: Keep local, Keep remote, Manual merge
4. Retry with user's choice
```

## Best Practices

✅ Always include `version` when sending UPDATE
✅ Implement conflict retry logic
✅ Show informative messages to user
✅ Test conflict scenarios

❌ Don't ignore 409 errors
❌ Don't use stale version on retry
❌ Don't lose user's changes without confirmation

## Implementation Checklist

- [ ] Parse `error.code` === 'VERSION_CONFLICT' to detect conflicts
- [ ] Extract `serverVersion` from error context
- [ ] Fetch entity at latest version
- [ ] Implement merge logic (server-wins or user-decides)
- [ ] Retry with new version number
- [ ] Log conflicts for debugging
- [ ] Test with concurrent update scenarios
