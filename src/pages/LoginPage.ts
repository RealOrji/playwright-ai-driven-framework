import { expect } from '@playwright/test';
import type { User } from '../types';
import { Routes } from '../utils/constants';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = Routes.login;

  readonly username = this.page.getByTestId('username');
  readonly password = this.page.getByTestId('password');
  readonly loginButton = this.page.getByTestId('login-button');
  readonly error = this.page.getByTestId('error');
  readonly errorCloseButton = this.page.getByTestId('error-button');

  async login({ username, password }: User): Promise<void> {
    if (username) await this.username.fill(username);
    if (password) await this.password.fill(password);
    await this.loginButton.click();
  }

  async dismissError(): Promise<void> {
    await this.errorCloseButton.click();
  }

  async assertError(message: string): Promise<void> {
    await expect(this.error).toBeVisible();
    await expect(this.error).toHaveText(message);
  }

  async assertNoError(): Promise<void> {
    await expect(this.error).toBeHidden();
  }
}
