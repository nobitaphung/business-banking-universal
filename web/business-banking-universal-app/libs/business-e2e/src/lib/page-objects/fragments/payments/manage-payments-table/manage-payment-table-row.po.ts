import { Locator } from '@playwright/test';

export interface ManagePaymentTableRowData {
  status: string | null;
  originatorAccountName: string | null;
  originatorAccountNumber: string | null;
  beneficiaryAccountName: string | null;
  beneficiaryAccountNumber: string | null;
  currency: string | null;
  amount: string | null;
}

export class ManagePaymentTableRow {
  readonly status = this.root.locator('[data-role="payment-col-status"] bb-payord-status-badge').first();
  readonly originatorAccountName = this.root.locator('[data-role="payment-col-debitor-name"]');
  readonly originatorAccountNumber = this.root.locator('[data-role="payment-col-debitor-account"]');
  readonly beneficiaryAccountName = this.root.locator('[data-role="payment-col-creditor-name"]');
  readonly beneficiaryAccountNumber = this.root.locator('[data-role="payment-col-creditor-account"]');
  readonly currency = this.root.locator('[data-role="payment-col-currency"]');
  readonly amount = this.root.locator('[data-role="payment-col-amount"] bb-amount-ui');

  readonly approveButton = this.root.locator('[data-role="approve-payment-order"]');
  readonly rejectButton = this.root.locator('[data-role="reject-payment-order"]');

  constructor(public root: Locator) {}

  async getData(): Promise<ManagePaymentTableRowData> {
    return {
      status: await this.status.textContent(),
      originatorAccountName: await this.originatorAccountName.textContent(),
      originatorAccountNumber: await this.originatorAccountNumber.textContent(),
      beneficiaryAccountName: await this.beneficiaryAccountName.textContent(),
      beneficiaryAccountNumber: await this.beneficiaryAccountNumber.textContent(),
      currency: await this.currency.textContent(),
      amount: await this.amount.textContent(),
    };
  }
}
