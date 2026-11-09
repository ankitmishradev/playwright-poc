/**
 * Picks selected keys from object
 */
export const pick = <T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> => {
    const out = {} as Pick<T, K>;
    keys.forEach((k) => {
        if (k in obj) out[k] = obj[k];
    });
    return out;
};

/**
 * Safely accesses nested property
 */
export const get = <T>(
    obj: unknown,
    accessor: (o: unknown) => T,
    fallback?: T
): T | undefined => {
    try {
        return accessor(obj);
    } catch {
        return fallback;
    }
};

export type CamelCaseString<T extends string> =
    T extends `${infer Head}_${infer Tail}`
        ? `${Head}${Capitalize<CamelCaseString<Tail>>}`
        : T;

export type DeepCamelCase<T> = T extends
    string | number | boolean | bigint | symbol | null | undefined
    ? T
    : T extends Date
      ? T
      : T extends Array<infer TValue>
        ? Array<DeepCamelCase<TValue>>
        : T extends object
          ? {
                [
                    TKey in keyof T as TKey extends string
                        ? CamelCaseString<TKey>
                        : TKey
                ]: DeepCamelCase<T[TKey]>;
            }
          : T;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    if (value == null || typeof value !== 'object') {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
};

export const toCamelCaseObject = <T>(value: T): DeepCamelCase<T> => {
    if (Array.isArray(value)) {
        return value.map((item) => toCamelCaseObject(item)) as DeepCamelCase<T>;
    }

    if (!isPlainObject(value)) {
        return value as DeepCamelCase<T>;
    }

    const result: Record<string, unknown> = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
        const camelCaseKey = key.replace(/_([a-z])/g, (_, char: string) =>
            char.toUpperCase()
        );
        result[camelCaseKey] = toCamelCaseObject(nestedValue);
    });

    return result as DeepCamelCase<T>;
};
