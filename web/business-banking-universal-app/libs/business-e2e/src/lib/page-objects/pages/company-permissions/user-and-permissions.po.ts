import { COMPANY_PERMISSIONS_USER_PERMISSIONS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class UserAndPermissionsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-company-permissions-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(COMPANY_PERMISSIONS_USER_PERMISSIONS_PAGE_PATH);
  }
}
