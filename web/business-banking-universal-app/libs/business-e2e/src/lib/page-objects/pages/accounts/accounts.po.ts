import { ACCOUNTS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';
import { AccountInfo } from '../../fragments';
import { AccountsTable } from '../../fragments';

export class AccountsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-accounts-list');

  readonly balanceAggregationHeader = this.page.locator('[data-role="balance-aggregation"]');
  readonly accountTable = new AccountsTable(this.page.locator('[data-role="accounts-overview-table"]'));
  readonly accountInfo = new AccountInfo(this.page.locator('bb-account-info'));
  readonly accountNumber = new AccountInfo(this.page.locator('[type="bban"]'));

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(ACCOUNTS_PAGE_PATH);
  }
}
