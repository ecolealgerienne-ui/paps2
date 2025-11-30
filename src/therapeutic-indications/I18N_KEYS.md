# Therapeutic Indications I18n Keys

## Entity: TherapeuticIndication (10/16 - Phase 2)

### Common Labels (20 keys)
```
therapeuticIndication.id
therapeuticIndication.productId
therapeuticIndication.countryCode
therapeuticIndication.speciesId
therapeuticIndication.ageCategoryId
therapeuticIndication.routeId
therapeuticIndication.doseMin
therapeuticIndication.doseMax
therapeuticIndication.doseUnitId
therapeuticIndication.doseOriginalText
therapeuticIndication.protocolDurationDays
therapeuticIndication.withdrawalMeatDays
therapeuticIndication.withdrawalMilkDays
therapeuticIndication.isVerified
therapeuticIndication.validationNotes
therapeuticIndication.isActive
therapeuticIndication.version
therapeuticIndication.deletedAt
therapeuticIndication.createdAt
therapeuticIndication.updatedAt
```

### UI Labels (10 keys)
```
therapeuticIndication.list.title
therapeuticIndication.list.empty
therapeuticIndication.create.title
therapeuticIndication.edit.title
therapeuticIndication.delete.confirm
therapeuticIndication.delete.success
therapeuticIndication.restore.confirm
therapeuticIndication.restore.success
therapeuticIndication.filter.product
therapeuticIndication.filter.species
therapeuticIndication.filter.country
therapeuticIndication.filter.verified
```

### Sections (5 keys)
```
therapeuticIndication.section.dosage
therapeuticIndication.section.withdrawal
therapeuticIndication.section.validation
therapeuticIndication.section.restrictions
therapeuticIndication.section.matching
```

### Validation Messages (12 keys)
```
therapeuticIndication.validation.productRequired
therapeuticIndication.validation.speciesRequired
therapeuticIndication.validation.routeRequired
therapeuticIndication.validation.productNotFound
therapeuticIndication.validation.speciesNotFound
therapeuticIndication.validation.routeNotFound
therapeuticIndication.validation.doseMinPositive
therapeuticIndication.validation.doseMaxGreaterThanMin
therapeuticIndication.validation.withdrawalMeatRequired
therapeuticIndication.validation.withdrawalMeatPositive
therapeuticIndication.validation.protocolDurationPositive
therapeuticIndication.validation.versionConflict
```

### Error Messages (6 keys)
```
therapeuticIndication.error.notFound
therapeuticIndication.error.createFailed
therapeuticIndication.error.updateFailed
therapeuticIndication.error.deleteFailed
therapeuticIndication.error.restoreFailed
therapeuticIndication.error.hasDependencies
```

### Success Messages (5 keys)
```
therapeuticIndication.success.created
therapeuticIndication.success.updated
therapeuticIndication.success.deleted
therapeuticIndication.success.restored
therapeuticIndication.success.verified
```

### Help Text (10 keys)
```
therapeuticIndication.help.countryCode
therapeuticIndication.help.ageCategory
therapeuticIndication.help.dosage
therapeuticIndication.help.doseOriginalText
therapeuticIndication.help.protocolDuration
therapeuticIndication.help.withdrawalMeat
therapeuticIndication.help.withdrawalMilk
therapeuticIndication.help.isVerified
therapeuticIndication.help.priorityMatching
therapeuticIndication.help.universalRule
```

### Matching Priority (4 keys)
```
therapeuticIndication.matching.priority1
therapeuticIndication.matching.priority2
therapeuticIndication.matching.priority3
therapeuticIndication.matching.priority4
```

## Total: 72 keys

## Notes
- Unique constraint: [productId, countryCode, speciesId, ageCategoryId, routeId]
- countryCode=null means universal rule (applies to all countries)
- ageCategoryId=null means all ages
- withdrawalMeatDays is required (critical for food safety)
- withdrawalMilkDays is optional (null if not applicable)
- Priority matching logic for treatment creation
- isVerified flag indicates expert validation
- doseOriginalText preserves original RCP text
