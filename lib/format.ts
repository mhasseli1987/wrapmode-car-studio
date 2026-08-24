/** Persian number + currency formatting helpers */

const faNum = new Intl.NumberFormat("fa-IR");

/** 1850000 → "۱٬۸۵۰٬۰۰۰" */
export function formatPrice(value: number): string {
  return faNum.format(value);
}

/** Full price line, e.g. "۱٬۸۵۰٬۰۰۰ تومان" */
export function formatToman(value: number): string {
  return `${faNum.format(value)} تومان`;
}

/** Latin-digit variant for aria labels / SEO text */
export function formatPriceLatin(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
