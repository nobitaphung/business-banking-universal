import { Locator } from '@playwright/test';

export interface AccountStatementsTableRowData {
  bookDate: string | null;
  accountName: string | null;
}

export class AccountStatementsTableRow {
  readonly bookDate = this.root.locator('[data-role="date-td"]');
  readonly accountName = this.root.locator('[data-role="account-name-td"]');
  readonly viewOnlineButton = this.root.locator('bb-account-statement-view-online');
  readonly downloadButton = this.root.locator('bb-account-statement-downloads');

  constructor(private root: Locator) {}

  async getData(): Promise<AccountStatementsTableRowData> {
    return {
      bookDate: await this.bookDate.textContent(),
      accountName: await this.accountName.textContent(),
    };
  }
}
