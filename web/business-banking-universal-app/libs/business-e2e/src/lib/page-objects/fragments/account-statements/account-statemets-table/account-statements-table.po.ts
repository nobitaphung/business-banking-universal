import { AccountStatementsTableRow } from './account-statements-table-row.po';
import { Locator } from '@playwright/test';

export class AccountStatementsTable {
  private readonly tableRowElements = this.root.locator('tbody').locator('tr');

  constructor(private root: Locator) {}

  async getTableRows(): Promise<AccountStatementsTableRow[]> {
    const result: AccountStatementsTableRow[] = [];
    await this.tableRowElements.first().waitFor();
    for (let i = 0; i < (await this.tableRowElements.count()); i++) {
      result.push(new AccountStatementsTableRow(this.tableRowElements.nth(i)));
    }
    return result;
  }
}
