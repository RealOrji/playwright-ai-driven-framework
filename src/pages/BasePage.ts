import { expect, type Page } from '@playwright/test';
import { seedCart } from '../utils/helpers';

export interface VisitOptions {
  /** Product IDs to pre-load into the cart before the page loads. */
  cart?: number[];
}

export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async visit({ cart }: VisitOptions = {}): Promise<void> {
    if (cart) await seedCart(this.page, cart);
    // SauceDemo serves its client-side routes with a 404 status; page.goto doesn't fail on it.
    await this.page.goto(this.path);
  }

  async assertOnPage(): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.pathname === this.path);
  }
}
