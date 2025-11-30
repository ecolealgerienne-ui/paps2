# Veterinarians Migration Checklist

## Entity: Veterinarian (16/16 - Phase 3 - Scope Pattern)

### Schema ✅
- [x] 30 fields: id, scope, farmId, firstName, lastName, title, licenseNumber, specialties, clinic, phone, mobile, email, address, city, postalCode, country, department, commune, isAvailable, emergencyService, workingHours, consultationFee, emergencyFee, currency, notes, isPreferred, isDefault, rating, totalInterventions, lastInterventionDate, isActive
- [x] Metadata: version, deletedAt, createdAt, updatedAt
- [x] Relations: farm (FK), treatments, farmPreferences
- [x] Indexes: scope, farmId, department, isActive, deletedAt
- [x] Scope pattern: DataScope enum (global/local)
- [x] No unique constraints (except id)

### DTOs ✅
- [x] CreateVeterinarianDto (local, full validation)
- [x] CreateGlobalVeterinarianDto (admin, requires licenseNumber + department)
- [x] UpdateVeterinarianDto (excludes scope/farmId, includes version)
- [x] VeterinarianResponseDto (all fields, nullable types as `| null`)
- [x] Separated into individual files

### Controller ✅
- [x] Endpoint at `/api/v1` (dual structure)
- [x] 14 endpoints total (9 farm-scoped + 5 global)
- [x] Guards: AuthGuard on create/update/delete/restore/setDefault
- [x] Guards: AuthGuard + AdminGuard on admin endpoints
- [x] Pagination query params (page, limit)
- [x] Filter query params (scope, department, isActive, isAvailable, emergencyService)
- [x] Search query param
- [x] Sort query params (sort, order)
- [x] Specialized endpoints: active, default, search/department/:dept
- [x] Full Swagger documentation
- [x] ApiBearerAuth on protected routes
- [x] Returns DTOs directly (not wrapped)
- [x] ParseUUIDPipe for ID validation
- [x] PATCH instead of PUT
- [x] DELETE returns entity (not NO_CONTENT)

### Service ✅
- [x] Pagination (FindAllOptions, PaginatedResponse)
- [x] Exported interfaces
- [x] Search in 2 fields (firstName, lastName combined)
- [x] Sort whitelist: lastName, firstName, createdAt
- [x] Default sort: lastName
- [x] AppLogger throughout (existing)
- [x] Soft delete + restore (dual: farm + admin)
- [x] Dependency check (treatments)
- [x] Optimistic locking (version)
- [x] update() handles undefined properly (ternaries for 20+ fields)
- [x] No restore on duplicate (no unique constraints)
- [x] Proper Prisma types imported (not `any`)
- [x] Specialized methods: findByFarm, findDefault, findByDepartment, setDefault

### Scope Pattern ✅
- [x] Dual create: create() for local, createGlobal() for admin
- [x] Dual findAll: findAll(farmId) and findAllGlobal()
- [x] Dual restore: restore(farmId) and restoreGlobal()
- [x] Scope-aware queries (global + farm's local)
- [x] Global veterinarians: licenseNumber + department required, farmId=null
- [x] Local veterinarians: phone required, farmId set
- [x] Cannot modify/delete global veterinarians from farm endpoints

### Default Veterinarian Logic ✅
- [x] setDefault() sets isDefault=true on specified veterinarian
- [x] setDefault() clears previous default (isDefault=false)
- [x] findDefault() returns the default veterinarian for farm
- [x] Only one veterinarian can be default per farm

### Documentation ✅
- [x] I18N_KEYS.md (82 keys)
- [x] TESTS_PLAN.md (100+ test cases, 14 endpoints)
- [x] VETERINARIANS_MIGRATION_CHECKLIST.md

## Completion: 36/36 (100%) ✅

## Notes
- Scope pattern with dual endpoint structure
- No unique constraints (unlike Products with code)
- Global veterinarians form a directory accessible to all farms
- Local veterinarians are farm-specific contacts
- Department search enables discovery of global veterinarians by location
- Default veterinarian: only one per farm, used for automatic assignment
- Dependency check prevents deletion if veterinarian has treatments
- Farm-scoped endpoints: /api/v1/farms/:farmId/veterinarians/*
- Global endpoints: /api/v1/veterinarians/* and /api/v1/admin/veterinarians/*
- Special endpoint: /api/v1/veterinarians/search/department/:dept for discovery
