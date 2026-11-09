type TimeInput = Date | string | number;

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;

const toDate = (value: TimeInput) => {
    return value instanceof Date ? new Date(value.getTime()) : new Date(value);
};

const assertValidDate = (value: TimeInput, label = 'date') => {
    const parsed = toDate(value);

    if (Number.isNaN(parsed.getTime())) {
        throw new Error(`Invalid ${label}: ${String(value)}`);
    }

    return parsed;
};

const getTimeNow = () => new Date();

const nowMs = () => Date.now();

const getTimeMs = (value: TimeInput) => {
    return assertValidDate(value).getTime();
};

const addMilliseconds = (value: TimeInput, ms: number) => {
    return new Date(getTimeMs(value) + ms);
};

const addSeconds = (value: TimeInput, seconds: number) => {
    return addMilliseconds(value, seconds * SECOND_IN_MS);
};

const addMinutes = (value: TimeInput, minutes: number) => {
    return addMilliseconds(value, minutes * MINUTE_IN_MS);
};

const addHours = (value: TimeInput, hours: number) => {
    return addMilliseconds(value, hours * HOUR_IN_MS);
};

const addDays = (value: TimeInput, days: number) => {
    return addMilliseconds(value, days * DAY_IN_MS);
};

const addWeeks = (value: TimeInput, weeks: number) => {
    return addMilliseconds(value, weeks * WEEK_IN_MS);
};

const addMonths = (value: TimeInput, months: number) => {
    const result = assertValidDate(value);
    result.setUTCMonth(result.getUTCMonth() + months);
    return result;
};

const addYears = (value: TimeInput, years: number) => {
    const result = assertValidDate(value);
    result.setUTCFullYear(result.getUTCFullYear() + years);
    return result;
};

const subtractMilliseconds = (value: TimeInput, ms: number) => {
    return addMilliseconds(value, -ms);
};

const subtractSeconds = (value: TimeInput, seconds: number) => {
    return addSeconds(value, -seconds);
};

const subtractMinutes = (value: TimeInput, minutes: number) => {
    return addMinutes(value, -minutes);
};

const subtractHours = (value: TimeInput, hours: number) => {
    return addHours(value, -hours);
};

const subtractDays = (value: TimeInput, days: number) => {
    return addDays(value, -days);
};

const subtractWeeks = (value: TimeInput, weeks: number) => {
    return addWeeks(value, -weeks);
};

const subtractMonths = (value: TimeInput, months: number) => {
    return addMonths(value, -months);
};

const subtractYears = (value: TimeInput, years: number) => {
    return addYears(value, -years);
};

const startOfMinuteUtc = (value: TimeInput) => {
    const date = assertValidDate(value);
    date.setUTCSeconds(0, 0);
    return date;
};

const endOfMinuteUtc = (value: TimeInput) => {
    return addMilliseconds(startOfMinuteUtc(value), MINUTE_IN_MS - 1);
};

const startOfHourUtc = (value: TimeInput) => {
    const date = assertValidDate(value);
    date.setUTCMinutes(0, 0, 0);
    return date;
};

const endOfHourUtc = (value: TimeInput) => {
    return addMilliseconds(startOfHourUtc(value), HOUR_IN_MS - 1);
};

const startOfDayUtc = (value: TimeInput) => {
    const date = assertValidDate(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const endOfDayUtc = (value: TimeInput) => {
    return addMilliseconds(startOfDayUtc(value), DAY_IN_MS - 1);
};

const startOfWeekUtc = (value: TimeInput, weekStartsOn: 0 | 1 = 1) => {
    const date = startOfDayUtc(value);
    const day = date.getUTCDay();
    const delta = (day - weekStartsOn + 7) % 7;
    return subtractDays(date, delta);
};

const endOfWeekUtc = (value: TimeInput, weekStartsOn: 0 | 1 = 1) => {
    return addMilliseconds(startOfWeekUtc(value, weekStartsOn), WEEK_IN_MS - 1);
};

const startOfMonthUtc = (value: TimeInput) => {
    const date = assertValidDate(value);
    date.setUTCDate(1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const endOfMonthUtc = (value: TimeInput) => {
    const date = startOfMonthUtc(value);
    date.setUTCMonth(date.getUTCMonth() + 1);
    return subtractMilliseconds(date, 1);
};

const startOfYearUtc = (value: TimeInput) => {
    const date = assertValidDate(value);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
};

const endOfYearUtc = (value: TimeInput) => {
    const date = startOfYearUtc(value);
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    return subtractMilliseconds(date, 1);
};

const compareTime = (a: TimeInput, b: TimeInput) => {
    const left = getTimeMs(a);
    const right = getTimeMs(b);
    if (left === right) return 0;
    return left < right ? -1 : 1;
};

const isBefore = (a: TimeInput, b: TimeInput) => {
    return compareTime(a, b) < 0;
};

const isAfter = (a: TimeInput, b: TimeInput) => {
    return compareTime(a, b) > 0;
};

const isSameTime = (a: TimeInput, b: TimeInput) => {
    return compareTime(a, b) === 0;
};

const isSameDayUtc = (a: TimeInput, b: TimeInput) => {
    const left = startOfDayUtc(a);
    const right = startOfDayUtc(b);
    return isSameTime(left, right);
};

const isBetween = (
    value: TimeInput,
    start: TimeInput,
    end: TimeInput,
    inclusive = true
) => {
    const current = getTimeMs(value);
    const from = getTimeMs(start);
    const to = getTimeMs(end);

    if (from > to) return false;

    if (inclusive) return current >= from && current <= to;

    return current > from && current < to;
};

const minTime = (a: TimeInput, b: TimeInput) => {
    return isBefore(a, b) ? assertValidDate(a) : assertValidDate(b);
};

const maxTime = (a: TimeInput, b: TimeInput) => {
    return isAfter(a, b) ? assertValidDate(a) : assertValidDate(b);
};

const clampTime = (value: TimeInput, min: TimeInput, max: TimeInput) => {
    const current = getTimeMs(value);
    const low = getTimeMs(min);
    const high = getTimeMs(max);

    if (low > high) {
        throw new Error('Invalid range: min cannot be greater than max');
    }

    if (current < low) return assertValidDate(min);
    if (current > high) return assertValidDate(max);
    return assertValidDate(value);
};

const diffMilliseconds = (a: TimeInput, b: TimeInput) => {
    return getTimeMs(a) - getTimeMs(b);
};

const diffSeconds = (a: TimeInput, b: TimeInput) => {
    return diffMilliseconds(a, b) / SECOND_IN_MS;
};

const diffMinutes = (a: TimeInput, b: TimeInput) => {
    return diffMilliseconds(a, b) / MINUTE_IN_MS;
};

const diffHours = (a: TimeInput, b: TimeInput) => {
    return diffMilliseconds(a, b) / HOUR_IN_MS;
};

const diffDays = (a: TimeInput, b: TimeInput) => {
    return diffMilliseconds(a, b) / DAY_IN_MS;
};

const toIsoUtc = (value: TimeInput) => {
    return assertValidDate(value).toISOString();
};

const fromUnixSeconds = (value: number) => {
    return new Date(value * SECOND_IN_MS);
};

const fromUnixMilliseconds = (value: number) => {
    return new Date(value);
};

const getTimeNowSnapshot = () => {
    const date = getTimeNow();

    return {
        date,
        string: date.toISOString(),
        unixMs: date.getTime(),
        unixSeconds: Math.floor(date.getTime() / 1000),
        utc: {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            seconds: date.getUTCSeconds(),
            milliseconds: date.getUTCMilliseconds(),
            weekday: date.getUTCDay()
        },
        local: {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            milliseconds: date.getMilliseconds(),
            weekday: date.getDay()
        },
        add: {
            millisecond: (value: number) => addMilliseconds(date, value),
            second: (value: number) => addSeconds(date, value),
            minute: (value: number) => addMinutes(date, value),
            hour: (value: number) => addHours(date, value),
            day: (value: number) => addDays(date, value),
            week: (value: number) => addWeeks(date, value),
            month: (value: number) => addMonths(date, value),
            year: (value: number) => addYears(date, value)
        }
    };
};

export const clock = {
    constants: {
        SECOND_IN_MS,
        MINUTE_IN_MS,
        HOUR_IN_MS,
        DAY_IN_MS,
        WEEK_IN_MS
    },
    now: {
        date: getTimeNow,
        snapshot: getTimeNowSnapshot,
        ms: nowMs,
        epochSeconds: () => Math.floor(Date.now() / 1000)
    },
    parse: {
        toDate,
        isValid: (value: TimeInput) => !Number.isNaN(toDate(value).getTime()),
        assert: assertValidDate,
        fromUnixSeconds,
        fromUnixMilliseconds,
        toEpochSeconds: (value: TimeInput) =>
            Math.floor(getTimeMs(value) / 1000)
    },
    add: {
        millisecond: addMilliseconds,
        second: addSeconds,
        seconds: addSeconds,
        minute: addMinutes,
        minutes: addMinutes,
        hour: addHours,
        hours: addHours,
        day: addDays,
        days: addDays,
        week: addWeeks,
        weeks: addWeeks,
        month: addMonths,
        months: addMonths,
        year: addYears,
        years: addYears,
        secondsUtc: addSeconds,
        minutesUtc: addMinutes
    },
    subtract: {
        millisecond: subtractMilliseconds,
        second: subtractSeconds,
        seconds: subtractSeconds,
        minute: subtractMinutes,
        minutes: subtractMinutes,
        hour: subtractHours,
        hours: subtractHours,
        day: subtractDays,
        days: subtractDays,
        week: subtractWeeks,
        weeks: subtractWeeks,
        month: subtractMonths,
        months: subtractMonths,
        year: subtractYears,
        years: subtractYears
    },
    compare: {
        compare: compareTime,
        isBefore,
        isAfter,
        isSameTime,
        isSameDayUtc,
        isBetween,
        min: minTime,
        max: maxTime,
        clamp: clampTime
    },
    range: {
        startOfMinuteUtc,
        endOfMinuteUtc,
        startOfHourUtc,
        endOfHourUtc,
        startOfDayUtc,
        endOfDayUtc,
        startOfWeekUtc,
        endOfWeekUtc,
        startOfMonthUtc,
        endOfMonthUtc,
        startOfYearUtc,
        endOfYearUtc
    },
    diff: {
        milliseconds: diffMilliseconds,
        seconds: diffSeconds,
        minutes: diffMinutes,
        hours: diffHours,
        days: diffDays
    },
    format: {
        standard: toIsoUtc,
        isoUtc: toIsoUtc
    }
} as const;
