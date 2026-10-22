import { expect } from '@playwright/test';
import type { Product } from '../types';
import { parsePrice } from '../utils/helpers';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class ProductDetailsPage extends BasePage {
  protected readonly path = '/inventory-item.html';
  readonly header = new Header(this.page);

  readonly name = this.page.getByTestId('inventory-item-name');
  readonly price = this.page.getByTestId('inventory-item-price');
  readonly addToCartButton = this.page.getByTestId('add-to-cart');
  readonly removeButton = this.page.getByTestId('remove');
  readonly backButton = this.page.getByTestId('back-to-products');

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }

  async assertProduct({ name, price }: Product): Promise<void> {
    await this.assertOnPage();
    await expect(this.name).toHaveText(name);
    expect(parsePrice(await this.price.innerText())).toBe(price);
  }
}
