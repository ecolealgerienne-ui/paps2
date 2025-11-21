import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { validateLanguage } from '../utils/i18n.helper';

/**
 * Decorator to extract language from query param ?lang= or Accept-Language header
 * Defaults to 'fr' if not provided or invalid
 *
 * @example
 * ```typescript
 * @Get()
 * findAll(@Lang() lang: string) {
 *   // lang will be 'fr', 'en', or 'ar'
 * }
 * ```
 */
export const Lang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // 1. Try query param ?lang=fr
    const queryLang = request.query.lang;
    if (queryLang) {
      return validateLanguage(queryLang);
    }

    // 2. Try Accept-Language header
    const acceptLang = request.headers['accept-language'];
    if (acceptLang) {
      // Accept-Language can be "fr-FR,fr;q=0.9,en;q=0.8"
      // Extract first language code
      const firstLang = acceptLang.split(',')[0].split('-')[0];
      return validateLanguage(firstLang);
    }

    // 3. Default to French
    return validateLanguage();
  }
);
