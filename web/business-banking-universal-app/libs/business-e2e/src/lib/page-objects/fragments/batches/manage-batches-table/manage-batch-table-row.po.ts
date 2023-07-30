import { BaseElement } from '../../../elements/base-element.po';

export interface ManageBatchTableRowData {
  status: string;
  originatorAccountName: string;
  originatorAccountNumber: string;
  totalCredits: string;
  amount: string;
  currency: string;
}

export class ManageBatchTableRow extends BaseElement {
  readonly status = this.root.locator('[data-role="batch-col-status"] bb-payord-status-badge').first();
  readonly originatorAccountName = this.root.locator('[data-role="batch-col-debtor-name"]');
  readonly originatorAccountNumber = this.root.locator('[data-role="batch-col-debtor-account"]');
  readonly totalCredits = this.root.locator('[data-role="batch-col-transactions-credit-count"]');
  readonly amount = this.root.locator(
    '[data-role="batch-col-transactions-credit-instructed-amount"] [data-role="bb-amount-value"]',
  );
  readonly currency = this.root.locator(
    '[data-role="batch-col-transactions-credit-instructed-amount"] [data-role="bb-amount-value"] .symbol',
  );

  readonly approveButton = this.root.locator('[data-role="approve-payment-order"]');
  readonly rejectButton = this.root.locator('[data-role="reject-payment-order"]');

  async getData(): Promise<ManageBatchTableRowData> {
    return {
      status: await this.status.innerText(),
      originatorAccountName: await this.originatorAccountName.innerText(),
      originatorAccountNumber: await this.originatorAccountNumber.innerText(),
      totalCredits: await this.totalCredits.innerText(),
      amount: await this.amount.innerText(),
      currency: await this.currency.innerText(),
    };
  }
}
