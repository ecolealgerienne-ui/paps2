# Products I18n Keys

## Entity: Product (15/16 - Phase 3)

### Common Labels (14 keys)
```
product.id
product.scope
product.farmId
product.code
product.nameFr
product.nameEn
product.nameAr
product.commercialName
product.description
product.type
product.categoryId
product.substanceId
product.atcVetCode
product.manufacturer
product.form
product.targetDisease
product.immunityDurationDays
product.notes
product.isActive
product.version
product.deletedAt
product.createdAt
product.updatedAt
```

### Product Types (8 keys)
```
product.type.antibiotic
product.type.vaccine
product.type.antiparasitic
product.type.antiinflammatory
product.type.hormone
product.type.vitamin
product.type.supplement
product.type.other
```

### UI Labels (10 keys)
```
product.list.title
product.list.empty
product.create.title
product.edit.title
product.delete.confirm
product.delete.success
product.restore.confirm
product.restore.success
product.search.placeholder
product.filter.scope
```

### Validation Messages (12 keys)
```
product.validation.nameRequired
product.validation.nameMaxLength
product.validation.codeRequired
product.validation.codeUnique
product.validation.codeFormat
product.validation.typeInvalid
product.validation.categoryNotFound
product.validation.substanceNotFound
product.validation.immunityDaysMin
product.validation.versionConflict
product.validation.cannotDeleteGlobal
product.validation.cannotModifyGlobal
```

### Error Messages (6 keys)
```
product.error.notFound
product.error.createFailed
product.error.updateFailed
product.error.deleteFailed
product.error.restoreFailed
product.error.hasDependencies
```

### Success Messages (5 keys)
```
product.success.created
product.success.updated
product.success.deleted
product.success.restored
product.success.imported
```

### Help Text (8 keys)
```
product.help.code
product.help.scope
product.help.type
product.help.category
product.help.substance
product.help.atcVetCode
product.help.immunityDuration
product.help.targetDisease
```

## Total: 63 keys

## Notes
- Scope pattern: global (admin) vs local (farm-specific)
- code is required and unique for global products
- code is optional for local products
- Products support multiple languages (Fr, En, Ar)
- ProductType enum values need translations
