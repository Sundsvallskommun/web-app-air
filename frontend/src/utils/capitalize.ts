/** Upper-cases the first character and leaves the rest untouched (same behaviour as underscore.string's capitalize). */
export const capitalize = (value: string): string => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);
