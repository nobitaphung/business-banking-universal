import { TRANSACTIONS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class TransactionsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-transactions-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(TRANSACTIONS_PAGE_PATH);
  }
}
