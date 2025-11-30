# National Campaigns Translation Keys

## Entity Name (3 keys)
```
national_campaigns.entity.singular
national_campaigns.entity.plural
national_campaigns.entity.campaign
```

## Fields (13 keys)
```
national_campaigns.field.id
national_campaigns.field.code
national_campaigns.field.nameFr
national_campaigns.field.nameEn
national_campaigns.field.nameAr
national_campaigns.field.description
national_campaigns.field.type
national_campaigns.field.startDate
national_campaigns.field.endDate
national_campaigns.field.isActive
national_campaigns.field.version
national_campaigns.field.deletedAt
national_campaigns.field.createdAt
national_campaigns.field.updatedAt
```

## Campaign Types (7 keys)
```
national_campaigns.type.vaccination
national_campaigns.type.deworming
national_campaigns.type.screening
national_campaigns.type.treatment
national_campaigns.type.census
national_campaigns.type.other
national_campaigns.type.label
```

## Operations (9 keys)
```
national_campaigns.operation.create
national_campaigns.operation.update
national_campaigns.operation.delete
national_campaigns.operation.restore
national_campaigns.operation.findAll
national_campaigns.operation.findOne
national_campaigns.operation.findByCode
national_campaigns.operation.findCurrent
national_campaigns.operation.search
```

## Validation Messages (25 keys)
```
national_campaigns.validation.code.required
national_campaigns.validation.code.minLength
national_campaigns.validation.code.maxLength
national_campaigns.validation.code.unique

national_campaigns.validation.nameFr.required
national_campaigns.validation.nameFr.minLength
national_campaigns.validation.nameFr.maxLength

national_campaigns.validation.nameEn.required
national_campaigns.validation.nameEn.minLength
national_campaigns.validation.nameEn.maxLength

national_campaigns.validation.nameAr.required
national_campaigns.validation.nameAr.minLength
national_campaigns.validation.nameAr.maxLength

national_campaigns.validation.description.maxLength

national_campaigns.validation.type.required
national_campaigns.validation.type.enum

national_campaigns.validation.startDate.required
national_campaigns.validation.startDate.format
national_campaigns.validation.startDate.invalid

national_campaigns.validation.endDate.required
national_campaigns.validation.endDate.format
national_campaigns.validation.endDate.invalid
national_campaigns.validation.endDate.beforeStart

national_campaigns.validation.isActive.boolean
national_campaigns.validation.version.number
```

## Success Messages (9 keys)
```
national_campaigns.success.created
national_campaigns.success.updated
national_campaigns.success.deleted
national_campaigns.success.restored
national_campaigns.success.found
national_campaigns.success.list
national_campaigns.success.current
national_campaigns.success.empty
national_campaigns.success.restoredOnDuplicate
```

## Error Messages (15 keys)
```
national_campaigns.error.notFound
national_campaigns.error.notFoundById
national_campaigns.error.notFoundByCode
national_campaigns.error.codeExists
national_campaigns.error.alreadyDeleted
national_campaigns.error.notDeleted
national_campaigns.error.versionConflict
national_campaigns.error.invalidDates
national_campaigns.error.startAfterEnd
national_campaigns.error.invalidStartDate
national_campaigns.error.invalidEndDate
national_campaigns.error.createFailed
national_campaigns.error.updateFailed
national_campaigns.error.deleteFailed
national_campaigns.error.restoreFailed
national_campaigns.error.hasDependencies
```

## Filter Labels (5 keys)
```
national_campaigns.filter.type
national_campaigns.filter.isActive
national_campaigns.filter.search
national_campaigns.filter.orderBy
national_campaigns.filter.dateRange
```

## Sort Options (7 keys)
```
national_campaigns.sort.nameFr
national_campaigns.sort.nameEn
national_campaigns.sort.code
national_campaigns.sort.startDate
national_campaigns.sort.endDate
national_campaigns.sort.type
national_campaigns.sort.createdAt
```

## Status Labels (5 keys)
```
national_campaigns.status.active
national_campaigns.status.inactive
national_campaigns.status.deleted
national_campaigns.status.current
national_campaigns.status.upcoming
national_campaigns.status.past
```

## Help Text (10 keys)
```
national_campaigns.help.create
national_campaigns.help.update
national_campaigns.help.delete
national_campaigns.help.restore
national_campaigns.help.code
national_campaigns.help.type
national_campaigns.help.dates
national_campaigns.help.current
national_campaigns.help.search
national_campaigns.help.pagination
```

## Dependency Messages (2 keys)
```
national_campaigns.dependency.campaignCountries
national_campaigns.dependency.farmPreferences
```

## Total: 115 Translation Keys

### Usage Examples

**French:**
```json
{
  "national_campaigns.entity.singular": "Campagne Nationale",
  "national_campaigns.entity.plural": "Campagnes Nationales",
  "national_campaigns.type.vaccination": "Vaccination",
  "national_campaigns.type.deworming": "Déparasitage",
  "national_campaigns.operation.create": "Créer une campagne nationale",
  "national_campaigns.success.created": "Campagne nationale créée avec succès",
  "national_campaigns.error.codeExists": "Le code de campagne existe déjà",
  "national_campaigns.error.versionConflict": "Conflit de version : la campagne a été modifiée par un autre utilisateur",
  "national_campaigns.validation.endDate.beforeStart": "La date de fin doit être après la date de début",
  "national_campaigns.status.current": "En cours",
  "national_campaigns.help.current": "Campagnes dont la date actuelle est entre la date de début et de fin",
  "national_campaigns.dependency.campaignCountries": "Cette campagne est liée à {count} pays"
}
```

**English:**
```json
{
  "national_campaigns.entity.singular": "National Campaign",
  "national_campaigns.entity.plural": "National Campaigns",
  "national_campaigns.type.vaccination": "Vaccination",
  "national_campaigns.type.deworming": "Deworming",
  "national_campaigns.operation.create": "Create a national campaign",
  "national_campaigns.success.created": "National campaign created successfully",
  "national_campaigns.error.codeExists": "Campaign code already exists",
  "national_campaigns.error.versionConflict": "Version conflict: campaign was modified by another user",
  "national_campaigns.validation.endDate.beforeStart": "End date must be after start date",
  "national_campaigns.status.current": "Current",
  "national_campaigns.help.current": "Campaigns where today is between start date and end date",
  "national_campaigns.dependency.campaignCountries": "This campaign is linked to {count} countries"
}
```

**Arabic:**
```json
{
  "national_campaigns.entity.singular": "حملة وطنية",
  "national_campaigns.entity.plural": "حملات وطنية",
  "national_campaigns.type.vaccination": "تلقيح",
  "national_campaigns.type.deworming": "إزالة الديدان",
  "national_campaigns.operation.create": "إنشاء حملة وطنية",
  "national_campaigns.success.created": "تم إنشاء الحملة الوطنية بنجاح",
  "national_campaigns.error.codeExists": "رمز الحملة موجود بالفعل",
  "national_campaigns.error.versionConflict": "تعارض في الإصدار: تم تعديل الحملة من قبل مستخدم آخر",
  "national_campaigns.validation.endDate.beforeStart": "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء",
  "national_campaigns.status.current": "جارية",
  "national_campaigns.help.current": "الحملات التي يكون اليوم بين تاريخ البدء والانتهاء",
  "national_campaigns.dependency.campaignCountries": "هذه الحملة مرتبطة بـ {count} دولة"
}
```
