import { expect } from '@playwright/test';
import type { SortOption } from '../utils/constants';
import { Routes } from '../utils/constants';
import { pricesOf, textsOf } from '../utils/helpers';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class InventoryPage extends BasePage {
  protected readonly path = Routes.inventory;
  readonly header = new Header(this.page);

  readonly title = this.page.getByTestId('title');
  readonly items = this.page.getByTestId('inventory-item');
  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly itemPrices = this.page.getByTestId('inventory-item-price');
  readonly sortSelect = this.page.getByTestId('product-sort-container');

  item(name: string) {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await this.item(name).getByRole('button', { name: 'Add to cart' }).click();
    }
  }

  async removeFromCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await this.item(name).getByRole('button', { name: 'Remove' }).click();
    }
  }

  async openProduct(name: string): Promise<void> {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  getProductNames(): Promise<string[]> {
    return textsOf(this.itemNames);
  }

  getProductPrices(): Promise<number[]> {
    return pricesOf(this.itemPrices);
  }

  async assertLoaded(): Promise<void> {
    await this.assertOnPage();
    await expect(this.title).toHaveText('Products');
  }

  async assertProductInCart(name: string, inCart = true): Promise<void> {
    await expect(this.item(name).locator('button')).toHaveText(inCart ? 'Remove' : 'Add to cart');
  }
}
