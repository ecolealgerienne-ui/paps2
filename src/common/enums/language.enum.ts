/**
 * Supported languages in the system
 */
export enum Language {
  FR = 'fr',
  EN = 'en',
  AR = 'ar',
}

/**
 * Default language if none specified
 */
export const DEFAULT_LANGUAGE = Language.FR;

/**
 * All supported languages as array
 */
export const SUPPORTED_LANGUAGES = Object.values(Language);
