import { ManageBatchTableRow } from './manage-batch-table-row.po';
import { Locator } from '@playwright/test';
import { BaseTable } from '../../../elements';

const convertAmountToNumber = (amountStr: string | null, currency?: string): number | null =>
  amountStr ? Number((currency ? amountStr.replace(currency, '') : amountStr).replace(',', '')) : null;

export class ManageBatchesTableFilters {
  static readonly tableRowByOriginatorAccountAndTransfers =
    (targetOriginatorName: string, targetNumberOfTransfers: number, targetAmountValue: number) =>
    async (row: ManageBatchTableRow) => {
      const amount = await row.amount.textContent();
      const currency = await row.currency.innerText();
      const originatorName = await row.originatorAccountName.innerText();
      const numberOfTransfers = await row.totalCredits.innerText();

      return (
        convertAmountToNumber(amount, currency) === targetAmountValue &&
        originatorName.trim() === targetOriginatorName &&
        Number(numberOfTransfers) === targetNumberOfTransfers
      );
    };
}

export class ManageBatchesTable extends BaseTable<ManageBatchTableRow> {
  constructor(public root: Locator) {
    super((locator) => new ManageBatchTableRow(locator), root);
  }
}
