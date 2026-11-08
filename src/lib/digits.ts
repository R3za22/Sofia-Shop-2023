const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

/** Convert Persian and Arabic-Indic digits to ASCII so inputs can be typed on any keyboard. */
export function normalizeDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const i = FA.indexOf(ch);
    return String(i >= 0 ? i : AR.indexOf(ch));
  });
}
