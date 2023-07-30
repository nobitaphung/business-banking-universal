import { Locator } from '@playwright/test';

export interface AccountSelectorListItemData {
  title: string | null;
  subtitle: string | null;
  amount: string | null;
}

export class AccountSelectorListItem {
  readonly accountName = this.root.locator('[data-role="card-title"]');
  readonly accountNumber = this.root.locator('[data-role="card-sub-title"]');
  readonly amountValue = this.root.locator('.bb-amount__value');

  constructor(private root: Locator) {}

  public async getProductData(): Promise<AccountSelectorListItemData> {
    return {
      title: await this.accountName.textContent(),
      subtitle: await this.accountNumber.textContent(),
      amount: await this.amountValue.textContent(),
    };
  }
}
