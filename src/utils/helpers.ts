import type { Locator, Page } from '@playwright/test';

/** Extracts the numeric amount from a label such as "Item total: $29.99". */
export const parsePrice = (text: string): number => {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[1]);
};

export const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

export const sum = (values: number[]): number => roundCurrency(values.reduce((a, b) => a + b, 0));

export const textsOf = async (locator: Locator): Promise<string[]> =>
  (await locator.allInnerTexts()).map((text) => text.trim());

export const pricesOf = async (locator: Locator): Promise<number[]> =>
  (await textsOf(locator)).map(parsePrice);

/**
 * Pre-loads the cart before the next page load, skipping UI setup for tests that don't cover adding
 * items. The cart is seeded once per tab so reloads still exercise the app's own persistence.
 */
export const seedCart = async (page: Page, productIds: number[]): Promise<void> => {
  await page.addInitScript((ids) => {
    if (sessionStorage.getItem('cart-seeded')) return;
    localStorage.setItem('cart-contents', JSON.stringify(ids));
    sessionStorage.setItem('cart-seeded', 'true');
  }, productIds);
};
