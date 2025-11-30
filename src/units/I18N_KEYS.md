# Units - I18n Keys Required

## Error Messages

### errors.unit_not_found
**Usage**: `units.service.ts` (multiple locations)
**English**: "Unit with ID '{id}' not found"
**French**: "Unité avec l'ID '{id}' introuvable"
**Arabic**: "الوحدة بالمعرف '{id}' غير موجودة"

### errors.unit_code_not_found
**Usage**: `units.service.ts:187`
**English**: "Unit with code '{code}' not found"
**French**: "Unité avec le code '{code}' introuvable"
**Arabic**: "الوحدة بالرمز '{code}' غير موجودة"

### errors.unit_code_duplicate
**Usage**: `units.service.ts:53`
**English**: "Unit with code '{code}' already exists"
**French**: "L'unité avec le code '{code}' existe déjà"
**Arabic**: "الوحدة بالرمز '{code}' موجودة بالفعل"

### errors.unit_incompatible_types
**Usage**: `units.service.ts:290`
**English**: "Cannot convert between {fromType} and {toType}"
**French**: "Impossible de convertir entre {fromType} et {toType}"
**Arabic**: "لا يمكن التحويل بين {fromType} و {toType}"

### errors.unit_in_use
**Usage**: Future - when checking Product/Treatment references
**English**: "Cannot delete unit '{code}': used in {count} related entities. Please deactivate instead."
**French**: "Impossible de supprimer l'unité '{code}' : utilisée dans {count} entités liées. Veuillez plutôt la désactiver."
**Arabic**: "لا يمكن حذف الوحدة '{code}': مستخدمة في {count} كيانات ذات صلة. يرجى إلغاء التنشيط بدلاً من ذلك."

## Validation Messages

### validation.code_format_invalid
**Usage**: `create-unit.dto.ts:20`
**English**: "Code must contain only lowercase letters, numbers, underscores, and slashes"
**French**: "Le code doit contenir uniquement des lettres minuscules, des chiffres, des underscores et des slashes"
**Arabic**: "يجب أن يحتوي الرمز على أحرف صغيرة وأرقام وشرطات سفلية وشرطات مائلة فقط"

### validation.code_required
**Usage**: `create-unit.dto.ts:17`
**English**: "Unit code is required"
**French**: "Le code de l'unité est requis"
**Arabic**: "رمز الوحدة مطلوب"

### validation.symbol_required
**Usage**: `create-unit.dto.ts:30`
**English**: "Unit symbol is required"
**French**: "Le symbole de l'unité est requis"
**Arabic**: "رمز الوحدة مطلوب"

### validation.name_fr_required
**Usage**: `create-unit.dto.ts:42`
**English**: "French name is required"
**French**: "Le nom en français est requis"
**Arabic**: "الاسم بالفرنسية مطلوب"

### validation.name_en_required
**Usage**: `create-unit.dto.ts:54`
**English**: "English name is required"
**French**: "Le nom en anglais est requis"
**Arabic**: "الاسم بالإنجليزية مطلوب"

### validation.name_ar_required
**Usage**: `create-unit.dto.ts:66`
**English**: "Arabic name is required"
**French**: "Le nom en arabe est requis"
**Arabic**: "الاسم بالعربية مطلوب"

### validation.unit_type_required
**Usage**: `create-unit.dto.ts:75`
**English**: "Unit type is required"
**French**: "Le type d'unité est requis"
**Arabic**: "نوع الوحدة مطلوب"

### validation.unit_type_invalid
**Usage**: `create-unit.dto.ts:75`
**English**: "Unit type must be one of: mass, volume, concentration, count, percentage, other"
**French**: "Le type d'unité doit être l'un des suivants : mass, volume, concentration, count, percentage, other"
**Arabic**: "يجب أن يكون نوع الوحدة أحد القيم التالية: mass, volume, concentration, count, percentage, other"

### validation.conversion_factor_min
**Usage**: `create-unit.dto.ts:99`
**English**: "Conversion factor must be at least 0"
**French**: "Le facteur de conversion doit être au moins 0"
**Arabic**: "يجب أن يكون معامل التحويل على الأقل 0"

## Implementation TODO

1. Create `src/i18n/en.json` with English messages
2. Create `src/i18n/fr.json` with French messages
3. Create `src/i18n/ar.json` with Arabic messages
4. Replace hard-coded strings in service with i18n calls
5. Update DTO validation messages with i18n keys

**Status**: ⚠️ TODO - Currently using hard-coded English strings
