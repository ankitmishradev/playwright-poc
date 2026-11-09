/**
 * Checks if value is object-like (non-null object)
 */
export const isObjectLike = (
    value: unknown
): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Checks if value is number-like (number or numeric string)
 */
export const isNumberLike = (value: unknown): boolean =>
    typeof value === 'number' ||
    (typeof value === 'string' &&
        value.trim() !== '' &&
        Number.isFinite(Number(value)));

/**
 * Checks if value is empty (null, undefined, '', [], {})
 */
export const isEmpty = (v: unknown): boolean => {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim().length === 0;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'object') return Object.keys(v).length === 0;
    return false;
};

/**
 * Checks if value is a valid finite number
 */
export const isNumber = (v: unknown): v is number =>
    typeof v === 'number' && Number.isFinite(v);

/**
 * Checks if value is a string
 */
export const isString = (v: unknown): v is string => typeof v === 'string';

/**
 * Checks if value is a non-empty string
 */
export const isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;

/**
 * Checks if value is an array
 */
export const isArray = <T = unknown>(v: unknown): v is T[] => Array.isArray(v);

export const isClient = () => typeof window !== 'undefined';
