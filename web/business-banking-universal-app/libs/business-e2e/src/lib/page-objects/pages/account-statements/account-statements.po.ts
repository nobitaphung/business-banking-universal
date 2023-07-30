import { ACCOUNTS_STATEMENTS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class AccountStatementsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-account-statement-business-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(ACCOUNTS_STATEMENTS_PAGE_PATH);
  }
}
