/**
 * Returns unique array items
 */
export const unique = <T>(arr: T[]): T[] => [...new Set(arr)];

/**
 * Groups array by key selector
 */
export const groupBy = <T, K extends string | number>(
    arr: T[],
    keyFn: (item: T) => K
): Record<K, T[]> =>
    arr.reduce(
        (acc, item) => {
            const key = keyFn(item);
            (acc[key] ||= []).push(item);
            return acc;
        },
        {} as Record<K, T[]>
    );

/**
 * Filters out null/undefined values
 */
export const compact = <T>(arr: (T | null | undefined)[]): T[] =>
    arr.filter((v): v is T => v != null);
