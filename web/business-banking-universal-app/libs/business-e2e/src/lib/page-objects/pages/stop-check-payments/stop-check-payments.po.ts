import { STOP_CHECK_PAYMENTS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class StopCheckPaymentsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-stop-checks-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(STOP_CHECK_PAYMENTS_PAGE_PATH);
  }
}
