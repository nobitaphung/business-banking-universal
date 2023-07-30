import { TRADE_FINANCE_IMPORT_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class ImportPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-tf-dashboard');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(TRADE_FINANCE_IMPORT_PAGE_PATH);
  }
}
