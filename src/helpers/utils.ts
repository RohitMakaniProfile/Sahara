export function cleanObject<T extends Record<string, unknown>>(obj: T) {
    const result = {} as Record<string, unknown>;

    for (const key in obj) {
        const value = obj[key];
        if (value !== null && value !== undefined) {
            result[key] = value;
        }
    }

    return result;
}
