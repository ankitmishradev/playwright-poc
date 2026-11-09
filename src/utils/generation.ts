export const generateFileName = (
    segments: (string | number)[],
    extension: string
): string => {
    const timestamp = new Date()
        .toISOString()
        .replace('T', '_')
        .replace(/\..+/, '')
        .replace(/:/g, '-');

    const baseName = segments
        .map((segment) =>
            String(segment)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '')
        )
        .filter(Boolean)
        .join('_');

    return `${baseName}_${timestamp}.${extension}`;
};
