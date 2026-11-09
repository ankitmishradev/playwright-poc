const maskSegment = (value: string) => {
    if (!value) {
        return '';
    }

    if (value.length <= 2) {
        return `${value[0] ?? ''}*`;
    }

    return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
};

export const maskEmail = (email: string) => {
    const normalized = email.trim();

    if (!normalized.includes('@')) {
        return normalized;
    }

    const atIndex = normalized.indexOf('@');
    const local = normalized.slice(0, atIndex);
    const domain = normalized.slice(atIndex + 1);

    if (!local || !domain) {
        return normalized;
    }

    const domainParts = domain.split('.');
    const mainDomain = domainParts.shift() ?? '';
    const tld = domainParts.join('.');

    const maskedLocal = maskSegment(local);
    const maskedDomain = maskSegment(mainDomain);

    return `${maskedLocal}@${maskedDomain}${tld ? `.${tld}` : ''}`;
};
