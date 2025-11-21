import { Language, DEFAULT_LANGUAGE } from '../enums/language.enum';

/**
 * Maps language code to Prisma column name
 * @param lang - Language code (fr, en, ar)
 * @returns Prisma column name (nameFr, nameEn, nameAr)
 */
export function getLangColumn(lang: string): 'nameFr' | 'nameEn' | 'nameAr' {
  switch (lang) {
    case Language.FR:
      return 'nameFr';
    case Language.EN:
      return 'nameEn';
    case Language.AR:
      return 'nameAr';
    default:
      return 'nameFr'; // Default to French
  }
}

/**
 * Validates and normalizes language code
 * @param lang - Language code to validate
 * @returns Valid language code or default
 */
export function validateLanguage(lang?: string): Language {
  if (!lang) return DEFAULT_LANGUAGE;

  const normalized = lang.toLowerCase().substring(0, 2);

  if (Object.values(Language).includes(normalized as Language)) {
    return normalized as Language;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Extracts localized name from an entity with i18n fields
 * @param entity - Entity with nameFr, nameEn, nameAr fields
 * @param lang - Language code
 * @returns Localized name
 */
export function getLocalizedName(
  entity: { nameFr: string; nameEn: string; nameAr: string },
  lang: string
): string {
  const column = getLangColumn(lang);
  return entity[column];
}

/**
 * Creates update data object for a single language field
 * @param name - The name value to set
 * @param lang - Language code
 * @returns Partial update object with the appropriate language field
 */
export function createLangUpdateData(
  name: string,
  lang: string
): Partial<{ nameFr: string; nameEn: string; nameAr: string }> {
  const column = getLangColumn(lang);
  return { [column]: name };
}
