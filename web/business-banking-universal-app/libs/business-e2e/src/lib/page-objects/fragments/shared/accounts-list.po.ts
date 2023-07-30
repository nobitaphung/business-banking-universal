import { Locator } from '@playwright/test';
import { AccountRecord } from '../transactions';

export class AccountsList {
  accountRecord = new AccountRecord(this.root.locator('div [role="option"]'));

  constructor(public root: Locator) {}

  async selectSingleAccountByRowNumber(rowNumber: number) {
    await this.accountRecord.root.nth(rowNumber).click();
  }

  async selectSingleAccountByName(accountName: string) {
    await this.accountRecord.accountName.filter({ hasText: accountName }).click();
  }
}
