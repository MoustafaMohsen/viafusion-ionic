/**
 * Money is kept to two decimals. Every amount is rounded here, half up, and totals are added and compared in cents,
 * so the pages and the demo handler always reach the same figures.
 *
 * Currency conversion: `rate` is units of the other currency per 1 USD. A destination amount in that currency costs
 * `to_usd(amount, rate)` US dollars, and the recipient gets exactly the amount that was entered.
 */

export const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export function to_cents(amount: any): number {
  // toPrecision removes binary noise such as 1.005 * 100 = 100.49999999999999 before rounding
  return Math.round(Number((Number(amount) * 100).toPrecision(15)));
}

export function round_money(amount: any): number {
  return to_cents(amount) / 100;
}

/** a positive amount with at most two decimals */
export function is_money(amount: any): boolean {
  let value = Number(amount);
  if (amount === null || amount === "" || typeof amount == "boolean" || !isFinite(value) || value <= 0) {
    return false;
  }
  return Math.abs(value * 100 - to_cents(value)) < 1e-6;
}

export function sum_money(amounts: any[]): number {
  return (amounts || []).reduce((cents, amount) => cents + (to_cents(amount) || 0), 0) / 100;
}

export function to_usd(amount: any, rate: number): number {
  return round_money(Number(amount) / rate);
}

export function from_usd(usd: any, rate: number): number {
  return round_money(Number(usd) * rate);
}
