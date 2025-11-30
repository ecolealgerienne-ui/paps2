# Age Categories - I18n Keys Required

## Error Messages

### errors.age_category_not_found
**Usage**: `age-categories.service.ts` (multiple locations)
**English**: "Age category with ID '{id}' not found"
**French**: "Catégorie d'âge avec l'ID '{id}' introuvable"
**Arabic**: "فئة العمر بالمعرف '{id}' غير موجودة"

### errors.species_not_found
**Usage**: `age-categories.service.ts:48, 173`
**English**: "Species with ID '{id}' not found"
**French**: "Espèce avec l'ID '{id}' introuvable"
**Arabic**: "النوع بالمعرف '{id}' غير موجود"

### errors.age_category_duplicate
**Usage**: `age-categories.service.ts:61`
**English**: "Age category with code '{code}' already exists for this species"
**French**: "La catégorie d'âge avec le code '{code}' existe déjà pour cette espèce"
**Arabic**: "فئة العمر بالرمز '{code}' موجودة بالفعل لهذا النوع"

### errors.age_category_in_use
**Usage**: Future - when checking Animal references
**English**: "Cannot delete age category '{code}': used in {count} animals. Please deactivate instead."
**French**: "Impossible de supprimer la catégorie d'âge '{code}' : utilisée dans {count} animaux. Veuillez plutôt la désactiver."
**Arabic**: "لا يمكن حذف فئة العمر '{code}': مستخدمة في {count} حيوانات. يرجى إلغاء التنشيط بدلاً من ذلك."

## Validation Messages

### validation.code_format_invalid
**Usage**: `create-age-category.dto.ts:19`
**English**: "Code must contain only uppercase letters, numbers, and underscores"
**French**: "Le code doit contenir uniquement des lettres majuscules, des chiffres et des underscores"
**Arabic**: "يجب أن يحتوي الرمز على أحرف كبيرة وأرقام وشرطات سفلية فقط"

### validation.species_id_required
**Usage**: `create-age-category.dto.ts:30`
**English**: "Species ID is required"
**French**: "L'ID de l'espèce est requis"
**Arabic**: "معرف النوع مطلوب"

### validation.name_fr_required
**Usage**: `create-age-category.dto.ts:42`
**English**: "French name is required"
**French**: "Le nom en français est requis"
**Arabic**: "الاسم بالفرنسية مطلوب"

### validation.name_en_required
**Usage**: `create-age-category.dto.ts:54`
**English**: "English name is required"
**French**: "Le nom en anglais est requis"
**Arabic**: "الاسم بالإنجليزية مطلوب"

### validation.name_ar_required
**Usage**: `create-age-category.dto.ts:66`
**English**: "Arabic name is required"
**French**: "Le nom en arabe est requis"
**Arabic**: "الاسم بالعربية مطلوب"

### validation.age_min_days_required
**Usage**: `create-age-category.dto.ts:85`
**English**: "Minimum age in days is required"
**French**: "L'âge minimum en jours est requis"
**Arabic**: "الحد الأدنى للعمر بالأيام مطلوب"

### validation.age_min_days_min
**Usage**: `create-age-category.dto.ts:86`
**English**: "Minimum age must be at least 0"
**French**: "L'âge minimum doit être au moins 0"
**Arabic**: "يجب أن يكون الحد الأدنى للعمر على الأقل 0"

### validation.age_max_days_min
**Usage**: `create-age-category.dto.ts:95`
**English**: "Maximum age must be at least 0"
**French**: "L'âge maximum doit être au moins 0"
**Arabic**: "يجب أن يكون الحد الأقصى للعمر على الأقل 0"

## Implementation TODO

1. Create `src/i18n/en.json` with English messages
2. Create `src/i18n/fr.json` with French messages
3. Create `src/i18n/ar.json` with Arabic messages
4. Replace hard-coded strings in service with i18n calls
5. Update DTO validation messages with i18n keys

**Status**: ⚠️ TODO - Currently using hard-coded English strings
