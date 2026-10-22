import { Routes } from '../utils/constants';
import { parsePrice, pricesOf } from '../utils/helpers';
import { BasePage } from './BasePage';

export interface OrderSummary {
  itemPrices: number[];
  subtotal: number;
  tax: number;
  total: number;
}

export class CheckoutOverviewPage extends BasePage {
  protected readonly path = Routes.checkoutOverview;

  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly itemPrices = this.page.getByTestId('inventory-item-price');
  readonly subtotal = this.page.getByTestId('subtotal-label');
  readonly tax = this.page.getByTestId('tax-label');
  readonly total = this.page.getByTestId('total-label');
  readonly finishButton = this.page.getByTestId('finish');
  readonly cancelButton = this.page.getByTestId('cancel');

  async getOrderSummary(): Promise<OrderSummary> {
    await this.assertOnPage();
    return {
      itemPrices: await pricesOf(this.itemPrices),
      subtotal: parsePrice(await this.subtotal.innerText()),
      tax: parsePrice(await this.tax.innerText()),
      total: parsePrice(await this.total.innerText()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
