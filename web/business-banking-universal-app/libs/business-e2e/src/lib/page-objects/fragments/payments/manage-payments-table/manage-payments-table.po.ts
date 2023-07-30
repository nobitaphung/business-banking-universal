import { ManagePaymentTableRow } from './manage-payment-table-row.po';
import { Locator } from '@playwright/test';

const convertAmountToNumber = (amountStr: string | null) => (amountStr ? Number(amountStr.replace(',', '')) : null);

export class ManagePaymentsTableFilters {
  static readonly tableRowByAmountWithApprovalsEnabled =
    (targetAmountValue: string) => async (row: ManagePaymentTableRow) => {
      await row.root.scrollIntoViewIfNeeded();
      console.log(await row.beneficiaryAccountName.textContent());
      const amount = await row.amount.textContent();

      console.log(amount);

      const isApprovable = (await row.approveButton.isVisible()) && (await row.approveButton.isEnabled());
      return convertAmountToNumber(amount) === convertAmountToNumber(targetAmountValue) && isApprovable;
    };

  static readonly tableRowByAmount = (targetAmountValue: string) => async (row: ManagePaymentTableRow) => {
    const amount = await row.amount.textContent();
    return convertAmountToNumber(amount) === convertAmountToNumber(targetAmountValue);
  };
}

export class ManagePaymentsTable {
  private readonly tableRowElements = this.root.locator('[data-role="payment-row"]');

  constructor(private root: Locator) {}

  async getTableRows(): Promise<ManagePaymentTableRow[]> {
    const result: ManagePaymentTableRow[] = [];
    const elements = this.root.locator('[data-role="payment-row"]');
    await this.tableRowElements.first().waitFor();
    console.log('total elements', await elements.count());
    for (let i = 0; i < (await elements.count()); i++) {
      result.push(new ManagePaymentTableRow(this.tableRowElements.nth(i)));
    }
    return result;
  }

  async findRowsByPredicate(
    predicate: (row: ManagePaymentTableRow) => Promise<boolean>,
  ): Promise<ManagePaymentTableRow[]> {
    const allTableRows = await this.getTableRows();
    console.log('total lenght', allTableRows.length);
    const result: ManagePaymentTableRow[] = [];
    for (const tableRow of allTableRows) {
      if (await predicate(tableRow)) {
        result.push(tableRow);
      }
    }
    return result;
  }
}
