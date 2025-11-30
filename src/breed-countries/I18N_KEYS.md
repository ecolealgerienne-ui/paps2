# Breed-Country Association I18N Keys

This document lists all internationalization keys needed for the Breed-Country association feature.

## Feature Overview
Breed-Country associations link breeds to specific countries where they are available or recognized.

## Required Translation Keys

### Actions (8 keys)
```
breedCountry.actions.link
breedCountry.actions.unlink
breedCountry.actions.restore
breedCountry.actions.search
breedCountry.actions.filter
breedCountry.actions.sort
breedCountry.actions.viewCountries
breedCountry.actions.viewBreeds
```

### Labels (10 keys)
```
breedCountry.labels.title
breedCountry.labels.breed
breedCountry.labels.country
breedCountry.labels.active
breedCountry.labels.inactive
breedCountry.labels.createdAt
breedCountry.labels.updatedAt
breedCountry.labels.search
breedCountry.labels.noResults
breedCountry.labels.loading
```

### Messages - Success (5 keys)
```
breedCountry.messages.success.linked
breedCountry.messages.success.unlinked
breedCountry.messages.success.restored
breedCountry.messages.success.loaded
breedCountry.messages.success.searched
```

### Messages - Errors (8 keys)
```
breedCountry.messages.error.notFound
breedCountry.messages.error.breedNotFound
breedCountry.messages.error.countryNotFound
breedCountry.messages.error.alreadyLinked
breedCountry.messages.error.notLinked
breedCountry.messages.error.notDeactivated
breedCountry.messages.error.loadFailed
breedCountry.messages.error.linkFailed
```

### Filters (4 keys)
```
breedCountry.filters.byBreed
breedCountry.filters.byCountry
breedCountry.filters.activeOnly
breedCountry.filters.all
```

### Tooltips (5 keys)
```
breedCountry.tooltips.link
breedCountry.tooltips.unlink
breedCountry.tooltips.restore
breedCountry.tooltips.viewCountries
breedCountry.tooltips.viewBreeds
```

### Dialogs (6 keys)
```
breedCountry.dialogs.confirmLink.title
breedCountry.dialogs.confirmLink.message
breedCountry.dialogs.confirmUnlink.title
breedCountry.dialogs.confirmUnlink.message
breedCountry.dialogs.confirmRestore.title
breedCountry.dialogs.confirmRestore.message
```

### Table Headers (6 keys)
```
breedCountry.table.breed
breedCountry.table.country
breedCountry.table.region
breedCountry.table.status
breedCountry.table.createdAt
breedCountry.table.actions
```

### Pagination (4 keys)
```
breedCountry.pagination.showing
breedCountry.pagination.of
breedCountry.pagination.page
breedCountry.pagination.perPage
```

### Validation (4 keys)
```
breedCountry.validation.breedRequired
breedCountry.validation.countryRequired
breedCountry.validation.breedInvalid
breedCountry.validation.countryInvalid
```

## Total Keys: 60

## Example Translations

### French (fr)
```json
{
  "breedCountry": {
    "actions": {
      "link": "Associer",
      "unlink": "Dissocier",
      "restore": "Restaurer",
      "search": "Rechercher",
      "filter": "Filtrer",
      "viewCountries": "Voir les pays",
      "viewBreeds": "Voir les races"
    },
    "labels": {
      "title": "Associations Race-Pays",
      "breed": "Race",
      "country": "Pays",
      "active": "Actif",
      "inactive": "Inactif",
      "noResults": "Aucune association trouvée"
    },
    "messages": {
      "success": {
        "linked": "Race associée au pays avec succès",
        "unlinked": "Race dissociée du pays avec succès",
        "restored": "Association restaurée avec succès"
      },
      "error": {
        "alreadyLinked": "Cette race est déjà associée à ce pays",
        "notFound": "Association non trouvée"
      }
    }
  }
}
```

### English (en)
```json
{
  "breedCountry": {
    "actions": {
      "link": "Link",
      "unlink": "Unlink",
      "restore": "Restore",
      "search": "Search",
      "filter": "Filter",
      "viewCountries": "View Countries",
      "viewBreeds": "View Breeds"
    },
    "labels": {
      "title": "Breed-Country Associations",
      "breed": "Breed",
      "country": "Country",
      "active": "Active",
      "inactive": "Inactive",
      "noResults": "No associations found"
    },
    "messages": {
      "success": {
        "linked": "Breed successfully linked to country",
        "unlinked": "Breed successfully unlinked from country",
        "restored": "Association successfully restored"
      },
      "error": {
        "alreadyLinked": "This breed is already linked to this country",
        "notFound": "Association not found"
      }
    }
  }
}
```

### Arabic (ar)
```json
{
  "breedCountry": {
    "actions": {
      "link": "ربط",
      "unlink": "إلغاء الربط",
      "restore": "استعادة",
      "search": "بحث",
      "filter": "تصفية",
      "viewCountries": "عرض البلدان",
      "viewBreeds": "عرض السلالات"
    },
    "labels": {
      "title": "ارتباطات السلالة والبلد",
      "breed": "سلالة",
      "country": "بلد",
      "active": "نشط",
      "inactive": "غير نشط",
      "noResults": "لم يتم العثور على ارتباطات"
    },
    "messages": {
      "success": {
        "linked": "تم ربط السلالة بالبلد بنجاح",
        "unlinked": "تم إلغاء ربط السلالة بالبلد بنجاح",
        "restored": "تمت استعادة الارتباط بنجاح"
      },
      "error": {
        "alreadyLinked": "هذه السلالة مرتبطة بالفعل بهذا البلد",
        "notFound": "الارتباط غير موجود"
      }
    }
  }
}
```
