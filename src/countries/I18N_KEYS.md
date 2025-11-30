# Countries - I18n Keys Required

## Error Messages

### errors.country_not_found
**Usage**: `countries.service.ts:123`
**English**: "Country with code '{code}' not found"
**French**: "Pays avec le code '{code}' introuvable"
**Arabic**: "البلد بالرمز '{code}' غير موجود"

### errors.country_code_duplicate
**Usage**: `countries.service.ts:38`
**English**: "Country with code '{code}' already exists"
**French**: "Le pays avec le code '{code}' existe déjà"
**Arabic**: "البلد بالرمز '{code}' موجود بالفعل"

### errors.country_in_use
**Usage**: `countries.service.ts:157`
**English**: "Cannot delete country '{code}': used in {count} related entities (breeds, campaigns, products). Please deactivate instead."
**French**: "Impossible de supprimer le pays '{code}' : utilisé dans {count} entités liées (races, campagnes, produits). Veuillez plutôt le désactiver."
**Arabic**: "لا يمكن حذف البلد '{code}': مستخدم في {count} كيانات ذات صلة (سلالات، حملات، منتجات). يرجى إلغاء التنشيط بدلاً من ذلك."

## Validation Messages

### validation.code_format_invalid
**Usage**: `create-country.dto.ts:11`
**English**: "Code must be ISO 3166-1 alpha-2 (2 uppercase letters)"
**French**: "Le code doit être au format ISO 3166-1 alpha-2 (2 lettres majuscules)"
**Arabic**: "يجب أن يكون الرمز بتنسيق ISO 3166-1 alpha-2 (حرفان كبيران)"

### validation.name_fr_required
**Usage**: `create-country.dto.ts:17`
**English**: "French name is required"
**French**: "Le nom en français est requis"
**Arabic**: "الاسم بالفرنسية مطلوب"

### validation.name_en_required
**Usage**: `create-country.dto.ts:23`
**English**: "English name is required"
**French**: "Le nom en anglais est requis"
**Arabic**: "الاسم بالإنجليزية مطلوب"

### validation.name_ar_required
**Usage**: `create-country.dto.ts:29`
**English**: "Arabic name is required"
**French**: "Le nom en arabe est requis"
**Arabic**: "الاسم بالعربية مطلوب"

## Implementation TODO

1. Create `src/i18n/en.json` with English messages
2. Create `src/i18n/fr.json` with French messages
3. Create `src/i18n/ar.json` with Arabic messages
4. Replace hard-coded strings in service with i18n calls
5. Update DTO validation messages with i18n keys

**Status**: ⚠️ TODO - Currently using hard-coded English strings
