import { Locator } from '@playwright/test';

export interface BeneficiaryListItemData {
  name: string | null;
  accountNumber: string | null;
}

export class BeneficiaryListItems {
  static readonly beneficiaryNameLocator = '[data-role="beneficiary-account-name-list-item"]';

  readonly name = this.root.locator(BeneficiaryListItems.beneficiaryNameLocator);
  readonly accountNumber = this.root.locator('[data-role="beneficiary-account-number-list-item"]');

  constructor(private root: Locator) {}

  async getData(): Promise<BeneficiaryListItemData> {
    return {
      name: await this.name.textContent(),
      accountNumber: await this.accountNumber.textContent(),
    };
  }
}
