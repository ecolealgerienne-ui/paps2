# Veterinarians I18n Keys

## Entity: Veterinarian (16/16 - Phase 3)

### Common Labels (28 keys)
```
veterinarian.id
veterinarian.scope
veterinarian.farmId
veterinarian.firstName
veterinarian.lastName
veterinarian.title
veterinarian.licenseNumber
veterinarian.specialties
veterinarian.clinic
veterinarian.phone
veterinarian.mobile
veterinarian.email
veterinarian.address
veterinarian.city
veterinarian.postalCode
veterinarian.country
veterinarian.department
veterinarian.commune
veterinarian.isAvailable
veterinarian.emergencyService
veterinarian.workingHours
veterinarian.consultationFee
veterinarian.emergencyFee
veterinarian.currency
veterinarian.notes
veterinarian.isPreferred
veterinarian.isDefault
veterinarian.rating
veterinarian.totalInterventions
veterinarian.lastInterventionDate
veterinarian.isActive
veterinarian.version
veterinarian.deletedAt
veterinarian.createdAt
veterinarian.updatedAt
```

### UI Labels (12 keys)
```
veterinarian.list.title
veterinarian.list.empty
veterinarian.create.title
veterinarian.edit.title
veterinarian.delete.confirm
veterinarian.delete.success
veterinarian.restore.confirm
veterinarian.restore.success
veterinarian.search.placeholder
veterinarian.filter.scope
veterinarian.filter.department
veterinarian.filter.availability
```

### Actions (6 keys)
```
veterinarian.action.setDefault
veterinarian.action.removeDefault
veterinarian.action.call
veterinarian.action.email
veterinarian.action.viewProfile
veterinarian.action.searchByDepartment
```

### Validation Messages (14 keys)
```
veterinarian.validation.firstNameRequired
veterinarian.validation.lastNameRequired
veterinarian.validation.firstNameMaxLength
veterinarian.validation.lastNameMaxLength
veterinarian.validation.phoneRequired
veterinarian.validation.phoneFormat
veterinarian.validation.emailFormat
veterinarian.validation.licenseRequired
veterinarian.validation.departmentRequired
veterinarian.validation.departmentFormat
veterinarian.validation.communeFormat
veterinarian.validation.versionConflict
veterinarian.validation.cannotDeleteGlobal
veterinarian.validation.cannotModifyGlobal
```

### Error Messages (6 keys)
```
veterinarian.error.notFound
veterinarian.error.createFailed
veterinarian.error.updateFailed
veterinarian.error.deleteFailed
veterinarian.error.restoreFailed
veterinarian.error.hasDependencies
```

### Success Messages (6 keys)
```
veterinarian.success.created
veterinarian.success.updated
veterinarian.success.deleted
veterinarian.success.restored
veterinarian.success.setDefault
veterinarian.success.imported
```

### Help Text (10 keys)
```
veterinarian.help.scope
veterinarian.help.licenseNumber
veterinarian.help.department
veterinarian.help.specialties
veterinarian.help.emergencyService
veterinarian.help.consultationFee
veterinarian.help.workingHours
veterinarian.help.isDefault
veterinarian.help.isPreferred
veterinarian.help.searchByDepartment
```

## Total: 82 keys

## Notes
- Scope pattern: global (admin/directory) vs local (farm-specific)
- Global veterinarians: licenseNumber and department required
- Local veterinarians: phone required, other fields optional
- Department format: 2-3 alphanumeric characters (e.g., "81", "2A")
- Commune format: exactly 5 digits
- isDefault: only one veterinarian per farm can be default
- Department search: allows farmers to discover global veterinarians
