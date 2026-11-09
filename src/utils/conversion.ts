/**
 * Converts unknown value to number
 * - Supports numeric strings with commas/spaces
 * - Returns 0 for invalid values
 */
export const toNumber = (v: unknown) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const n = Number(v.replace(/[, ]+/g, ''));
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
};

/**
 * Converts any value to safe string
 */
export const toText = (value: unknown): string => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value);
};

/**
 * Parses boolean-like values
 * Supports: 'true', '1', 1 → true
 */
export const toBoolean = (v: unknown): boolean => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return ['true', '1'].includes(v.toLowerCase());
    return false;
};

/**
 * Converts value to lowercase string safely
 */
export const safeLower = (v: unknown): string => toText(v).toLowerCase();

/**
 * Converts value to normalized string safely
 */
export const normalize = (v: unknown): string => safeLower(v).trim();
