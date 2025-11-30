# Campaign-Countries Translation Keys

## Entity Name (4 keys)
```
campaign_countries.entity.singular
campaign_countries.entity.plural
campaign_countries.entity.association
campaign_countries.entity.link
```

## Fields (6 keys)
```
campaign_countries.field.id
campaign_countries.field.campaignId
campaign_countries.field.countryCode
campaign_countries.field.isActive
campaign_countries.field.createdAt
campaign_countries.field.updatedAt
```

## Nested Objects (10 keys)
```
campaign_countries.nested.campaign
campaign_countries.nested.campaign.id
campaign_countries.nested.campaign.code
campaign_countries.nested.campaign.nameFr
campaign_countries.nested.campaign.nameEn
campaign_countries.nested.campaign.nameAr
campaign_countries.nested.campaign.type
campaign_countries.nested.country
campaign_countries.nested.country.code
campaign_countries.nested.country.name
```

## Operations (7 keys)
```
campaign_countries.operation.link
campaign_countries.operation.unlink
campaign_countries.operation.restore
campaign_countries.operation.findAll
campaign_countries.operation.findOne
campaign_countries.operation.findByCampaign
campaign_countries.operation.findByCountry
```

## Validation Messages (15 keys)
```
campaign_countries.validation.campaignId.required
campaign_countries.validation.campaignId.uuid
campaign_countries.validation.campaignId.notFound
campaign_countries.validation.campaignId.deleted

campaign_countries.validation.countryCode.required
campaign_countries.validation.countryCode.format
campaign_countries.validation.countryCode.length
campaign_countries.validation.countryCode.notFound

campaign_countries.validation.unique.alreadyLinked
campaign_countries.validation.unique.alreadyActive
campaign_countries.validation.isActive.boolean

campaign_countries.validation.page.min
campaign_countries.validation.limit.min
campaign_countries.validation.limit.max
campaign_countries.validation.order.enum
```

## Success Messages (7 keys)
```
campaign_countries.success.linked
campaign_countries.success.unlinked
campaign_countries.success.restored
campaign_countries.success.reactivated
campaign_countries.success.found
campaign_countries.success.list
campaign_countries.success.empty
```

## Error Messages (12 keys)
```
campaign_countries.error.notFound
campaign_countries.error.alreadyLinked
campaign_countries.error.notActive
campaign_countries.error.alreadyActive
campaign_countries.error.campaignNotFound
campaign_countries.error.campaignDeleted
campaign_countries.error.countryNotFound
campaign_countries.error.invalidCampaignId
campaign_countries.error.invalidCountryCode
campaign_countries.error.linkFailed
campaign_countries.error.unlinkFailed
campaign_countries.error.restoreFailed
```

## Filter Labels (5 keys)
```
campaign_countries.filter.campaignId
campaign_countries.filter.countryCode
campaign_countries.filter.isActive
campaign_countries.filter.search
campaign_countries.filter.orderBy
```

## Sort Options (3 keys)
```
campaign_countries.sort.createdAt
campaign_countries.sort.updatedAt
campaign_countries.sort.isActive
```

## Status Labels (2 keys)
```
campaign_countries.status.active
campaign_countries.status.inactive
```

## Help Text (8 keys)
```
campaign_countries.help.link
campaign_countries.help.unlink
campaign_countries.help.restore
campaign_countries.help.campaignId
campaign_countries.help.countryCode
campaign_countries.help.isActive
campaign_countries.help.search
campaign_countries.help.pagination
```

## Total: 79 Translation Keys

### Usage Examples

**French:**
```json
{
  "campaign_countries.entity.singular": "Association Campagne-Pays",
  "campaign_countries.entity.plural": "Associations Campagne-Pays",
  "campaign_countries.operation.link": "Lier une campagne à un pays",
  "campaign_countries.success.linked": "Campagne liée au pays avec succès",
  "campaign_countries.error.alreadyLinked": "Cette campagne est déjà liée à ce pays",
  "campaign_countries.validation.countryCode.format": "Le code pays doit être au format ISO 3166-1 alpha-2"
}
```

**English:**
```json
{
  "campaign_countries.entity.singular": "Campaign-Country Association",
  "campaign_countries.entity.plural": "Campaign-Country Associations",
  "campaign_countries.operation.link": "Link campaign to country",
  "campaign_countries.success.linked": "Campaign successfully linked to country",
  "campaign_countries.error.alreadyLinked": "This campaign is already linked to this country",
  "campaign_countries.validation.countryCode.format": "Country code must be in ISO 3166-1 alpha-2 format"
}
```

**Arabic:**
```json
{
  "campaign_countries.entity.singular": "ربط الحملة بالبلد",
  "campaign_countries.entity.plural": "روابط الحملات بالبلدان",
  "campaign_countries.operation.link": "ربط حملة ببلد",
  "campaign_countries.success.linked": "تم ربط الحملة بالبلد بنجاح",
  "campaign_countries.error.alreadyLinked": "هذه الحملة مرتبطة بالفعل بهذا البلد",
  "campaign_countries.validation.countryCode.format": "يجب أن يكون رمز البلد بتنسيق ISO 3166-1 alpha-2"
}
```
