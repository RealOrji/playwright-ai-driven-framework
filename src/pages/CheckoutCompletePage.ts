import { expect } from '@playwright/test';
import { Routes } from '../utils/constants';
import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class CheckoutCompletePage extends BasePage {
  protected readonly path = Routes.checkoutComplete;
  readonly header = new Header(this.page);

  readonly completeHeader = this.page.getByTestId('complete-header');
  readonly completeText = this.page.getByTestId('complete-text');
  readonly backHomeButton = this.page.getByTestId('back-to-products');

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  async assertOrderConfirmed(): Promise<void> {
    await this.assertOnPage();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
