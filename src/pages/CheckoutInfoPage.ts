import { expect } from '@playwright/test';
import type { Customer } from '../types';
import { Routes } from '../utils/constants';
import { BasePage } from './BasePage';

export class CheckoutInfoPage extends BasePage {
  protected readonly path = Routes.checkoutInfo;

  readonly firstName = this.page.getByTestId('firstName');
  readonly lastName = this.page.getByTestId('lastName');
  readonly postalCode = this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly cancelButton = this.page.getByTestId('cancel');
  readonly error = this.page.getByTestId('error');

  async fillCustomerInfo({ firstName, lastName, postalCode }: Partial<Customer>): Promise<void> {
    if (firstName) await this.firstName.fill(firstName);
    if (lastName) await this.lastName.fill(lastName);
    if (postalCode) await this.postalCode.fill(postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async assertError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }
}
