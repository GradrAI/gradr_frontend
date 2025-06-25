export function formatNumber(value: string | number, locale = "en-NG"): string {
  const number = typeof value === "string" ? parseFloat(value) : value;
  return number.toLocaleString(locale);
}
