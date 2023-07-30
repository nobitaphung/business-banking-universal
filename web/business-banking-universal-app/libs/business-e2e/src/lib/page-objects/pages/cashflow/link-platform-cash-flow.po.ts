import { CASHFLOW_LINK_PLATFORM_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class LinkPlatformPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-cash-flow-heading');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(CASHFLOW_LINK_PLATFORM_PAGE_PATH);
  }
}
