import { Locator } from '@playwright/test';
import { AccountSelector } from '../shared/account-selector/account-selector.po';

export class InternalBatchPaymentForm {
  constructor(public root: Locator) {}

  readonly beneficiaryAccountSelector = new AccountSelector(
    this.root.locator('[data-role="debit-account-selector"][aria-label="To"]'),
  );
  readonly description = this.root.locator('[data-role="remittanceInformation"] textarea');
}
