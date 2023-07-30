import { Page } from '@playwright/test';
import { PageObject } from './page-object';

export class IdentityLoginPage extends PageObject {
  readonly usernameInput = this.page.locator('#username');
  readonly passwordInput = this.page.locator('#password');
  readonly loginButton = this.page.locator('#kc-login');

  constructor(page: Page) {
    super(page);
  }

  async loginThroughUI(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
