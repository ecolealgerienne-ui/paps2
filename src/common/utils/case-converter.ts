/**
 * Utility functions for converting between camelCase and snake_case
 * Used for normalizing payloads between Flutter app (camelCase) and Prisma (snake_case)
 */

/**
 * Convert camelCase/snake_case object keys to snake_case recursively
 * @param obj - Object with camelCase or snake_case keys
 * @returns Object with snake_case keys
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  return camelToSnake(obj);
}

/**
 * Convert camelCase object keys to snake_case recursively
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' && item !== null ? camelToSnake(item) : item
    );
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convert the key from camelCase to snake_case
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

        const value = obj[key];

        // Recursion for nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          result[snakeKey] = camelToSnake(value);
        } else if (Array.isArray(value)) {
          result[snakeKey] = value.map(item =>
            typeof item === 'object' && item !== null && !(item instanceof Date) ? camelToSnake(item) : item
          );
        } else {
          result[snakeKey] = value;
        }
      }
    }

    return result;
  }

  return obj;
}

/**
 * Convert snake_case object keys to camelCase recursively
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' && item !== null ? snakeToCamel(item) : item
    );
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convert the key from snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        const value = obj[key];

        // Recursion for nested objects
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          result[camelKey] = snakeToCamel(value);
        } else if (Array.isArray(value)) {
          result[camelKey] = value.map(item =>
            typeof item === 'object' && item !== null && !(item instanceof Date) ? snakeToCamel(item) : item
          );
        } else {
          result[camelKey] = value;
        }
      }
    }

    return result;
  }

  return obj;
}
