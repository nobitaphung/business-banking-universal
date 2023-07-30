import { Page } from '@playwright/test';

export class UserContextMenu {
  readonly username = this.page.locator('[data-role="user-full-name"]');
  readonly contextname = this.page.locator('[data-role="current-context"]');
  readonly userContextToggle = this.page.locator('[class="user-context-dropdown__toggle"] > [name="toggle-down"]');
  readonly logOutButton = this.page.locator('[data-role="logout"]');

  async logOut() {
    await this.userContextToggle.click();
    await this.logOutButton.click();
  }

  constructor(private page: Page) {}
}
