"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelToSnake = camelToSnake;
exports.snakeToCamel = snakeToCamel;
function camelToSnake(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (obj instanceof Date) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => typeof item === 'object' && item !== null ? camelToSnake(item) : item);
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                const value = obj[key];
                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                    result[snakeKey] = camelToSnake(value);
                }
                else if (Array.isArray(value)) {
                    result[snakeKey] = value.map(item => typeof item === 'object' && item !== null && !(item instanceof Date) ? camelToSnake(item) : item);
                }
                else {
                    result[snakeKey] = value;
                }
            }
        }
        return result;
    }
    return obj;
}
function snakeToCamel(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (obj instanceof Date) {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => typeof item === 'object' && item !== null ? snakeToCamel(item) : item);
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                const value = obj[key];
                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                    result[camelKey] = snakeToCamel(value);
                }
                else if (Array.isArray(value)) {
                    result[camelKey] = value.map(item => typeof item === 'object' && item !== null && !(item instanceof Date) ? snakeToCamel(item) : item);
                }
                else {
                    result[camelKey] = value;
                }
            }
        }
        return result;
    }
    return obj;
}
//# sourceMappingURL=case-converter.js.map