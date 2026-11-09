export const compareNumbers = (a: unknown, b: unknown): number => {
    const numberA = Number(a);
    const numberB = Number(b);

    if (!Number.isFinite(numberA) && !Number.isFinite(numberB)) return 0;
    if (!Number.isFinite(numberA)) return 1;
    if (!Number.isFinite(numberB)) return -1;

    return numberA - numberB;
};

export const compareStrings = (a: unknown, b: unknown): number =>
    String(a).localeCompare(String(b), undefined, {
        sensitivity: 'base',
        numeric: true
    });
