import { expect } from '@playwright/test';
import { Routes } from '../utils/constants';
import { textsOf } from '../utils/helpers';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class CartPage extends BasePage {
  protected readonly path = Routes.cart;
  readonly header = new Header(this.page);

  readonly items = this.page.getByTestId('inventory-item');
  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly checkoutButton = this.page.getByTestId('checkout');
  readonly continueShoppingButton = this.page.getByTestId('continue-shopping');

  item(name: string) {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /** Asserts the cart holds exactly these products, in any order. */
  async assertItems(names: string[]): Promise<void> {
    if (names.length === 0) {
      await expect(this.items).toHaveCount(0);
    } else {
      await expect
        .poll(async () => (await textsOf(this.itemNames)).sort())
        .toEqual([...names].sort());
    }
  }
}
