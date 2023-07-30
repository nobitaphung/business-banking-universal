import { Locator } from '@playwright/test';
import { AccountSelectorListItem, AccountSelectorListItemData } from './account-selector-list-item.po';

export class AccountSelector {
  readonly toggleMenuButton = this.root.locator('.ng-value-container');
  readonly dropdownMenuPanel = this.root.locator('ng-dropdown-panel');
  readonly searchBox = this.dropdownMenuPanel.locator('bb-search-box-ui');
  private readonly productItemsLocator = 'bb-product-item-basic-account-ui';
  private readonly selectedProductPanel = this.root.locator('[data-role="product-selector-selected-content"]');

  constructor(public root: Locator) {}

  public async isExpanded(): Promise<boolean> {
    const buttonHasAriaExpanded = (await this.toggleMenuButton.getAttribute('aria-expanded')) === 'true';
    return buttonHasAriaExpanded && this.dropdownMenuPanel.isVisible();
  }

  public async expand(): Promise<void> {
    if (!(await this.isExpanded())) {
      await this.toggleMenuButton.click();
      await this.root.locator(this.productItemsLocator).first().waitFor({ state: 'visible' });
    } else {
      console.warn(`Account selector is already expanded, no actions will be done`);
    }
  }

  public async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggleMenuButton.click();
      await this.dropdownMenuPanel.waitFor({ state: 'hidden' });
    } else {
      console.warn(`Account selector is already collapsed, no actions will be done`);
    }
  }

  public getOptions(): Locator {
    return this.root.locator(this.productItemsLocator);
  }

  public async getOptionsAs<T>(typeCreator: new (e: Locator) => T): Promise<T[]> {
    const result: T[] = [];
    const options = this.getOptions();
    for (let i = 0; i < (await options.count()); i++) {
      result.push(new typeCreator(options.nth(i)));
    }
    return result;
  }

  public getSelected(): Locator {
    return this.selectedProductPanel;
  }

  public getSelectedAs<T>(typeCreator: new (e: Locator) => T): T {
    return new typeCreator(this.getSelected());
  }

  public async selectByText(value: string | null): Promise<void> {
    await this.expand();
    await this.root.locator(`${this.productItemsLocator}:has-text("${value}")`).click();
  }

  public async getVisibleData(): Promise<AccountSelectorListItemData[]> {
    await this.expand();
    const accountSelectorItems = await this.getOptionsAs(AccountSelectorListItem);
    return Promise.all(accountSelectorItems.map(async (item) => item.getProductData()));
  }
}
