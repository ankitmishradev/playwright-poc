import { toNumber } from './conversion.js';

/**
 * Restricts value within a range [min, max]
 */
export const clamp = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

/**
 * Rounds number to given decimal places
 */
export const round = (num: number, precision = 0): number => {
    const factor = 10 ** precision;
    return Math.round(num * factor) / factor;
};

/**
 * Safe division avoiding divide by zero
 */
export const safeDivide = (a: number, b: number): number =>
    b === 0 ? 0 : a / b;

/**
 * Ensures value is within safe numeric bounds
 */
export const safeNumber = (
    v: unknown,
    fallback: number | undefined = undefined
) => {
    const n = toNumber(v);
    return Number.isFinite(n) ? n : fallback;
};
