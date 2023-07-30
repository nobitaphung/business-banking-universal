import { Locator } from '@playwright/test';
import { BaseTable } from '../../../elements';
import { AccountsTableRow } from './accounts-table-row.po';

export class AccountsTable extends BaseTable<AccountsTableRow> {
  constructor(root: Locator) {
    super((locator) => new AccountsTableRow(locator), root);
  }
}
