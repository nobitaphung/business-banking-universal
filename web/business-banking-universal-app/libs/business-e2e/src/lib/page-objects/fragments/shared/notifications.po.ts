import { Page } from '@playwright/test';

export class Notifications {
  private readonly notificationsLocator = '[data-role="notification-heading"]';

  constructor(private page: Page) {}

  async getAllNotificationMessages(): Promise<string[]> {
    await this.page.locator(this.notificationsLocator).waitFor();
    return await this.page.locator(this.notificationsLocator).allInnerTexts();
  }
}
