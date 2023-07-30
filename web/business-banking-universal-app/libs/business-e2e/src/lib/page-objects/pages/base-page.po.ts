import { NavigationMenu, Notifications, UserContextMenu } from '../fragments';
import { Page } from '@playwright/test';
import { PageObject } from './page-object';
import { IdentityLoginPage } from './identity-login.po';

export class BasePage extends PageObject {
  readonly pageTitleHeader = this.page.locator('h1[data-role="headings"] >> nth=0');
  readonly navigationMenu = new NavigationMenu(this.page.locator('bb-navigation-menu'));
  readonly userContextMenu = new UserContextMenu(this.page);
  readonly notifications = new Notifications(this.page);

  constructor(page: Page) {
    super(page);
  }

  async logOut() {
    await this.userContextMenu.logOut();
    return new IdentityLoginPage(this.page);
  }

  async navigateTo(url: string): Promise<void> {
    const currentUrl = this.page.url();
    if (currentUrl.includes(url)) {
      return;
    }
    await this.page.goto(url);
    await this.page.waitForNavigation({ url: url });
  }
}
