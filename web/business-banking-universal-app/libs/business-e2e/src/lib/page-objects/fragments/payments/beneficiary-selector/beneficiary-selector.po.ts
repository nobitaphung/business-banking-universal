import { Locator } from '@playwright/test';
import { BeneficiaryListItems, BeneficiaryListItemData } from './beneficiary-list-item.po';

export enum BeneficiaryType {
  contact,
  account,
}

export class BeneficiarySelector {
  readonly searchBox = this.root.locator('[data-role="search-input"]');
  readonly clearButton = this.root.locator('[data-role="bb-clear-button"]');

  readonly dropdownMenuToggle = this.root.locator('[data-role="open-beneficiary-dropdown-list-button"]');
  readonly dropdownMenuPanel = this.root.locator('.dropdown-menu');

  readonly contactsTab = this.dropdownMenuPanel.locator('[data-role="contacts-tab-item"]');
  readonly ownAccountsTab = this.dropdownMenuPanel.locator('[data-role="accounts-tab-item"]');
  readonly enterDataManuallyButton = this.dropdownMenuPanel.locator('[data-role="enter-data-manually"]');

  private readonly beneficiaryListItemLocator = '.dropdown-item:not([data-role])';

  constructor(private root: Locator) {}

  async clear(): Promise<void> {
    await this.clearButton.click();
  }

  async expand(): Promise<void> {
    if (!(await this.dropdownMenuPanel.isVisible())) {
      await this.dropdownMenuToggle.click();
    }
  }

  async collapse(): Promise<void> {
    if (await this.dropdownMenuPanel.isVisible()) {
      await this.dropdownMenuToggle.click();
    }
  }

  async selectTab(beneficiaryType: BeneficiaryType): Promise<void> {
    await this.expand();
    const beneficiaryTabSelector = beneficiaryType === BeneficiaryType.contact ? this.contactsTab : this.ownAccountsTab;
    await beneficiaryTabSelector.click();
  }

  async selectBeneficiary(beneficiaryName: string | null, beneficiaryType: BeneficiaryType): Promise<void> {
    await this.expand();
    await this.selectTab(beneficiaryType);
    await this.dropdownMenuPanel
      .locator(`${BeneficiaryListItems.beneficiaryNameLocator}:has-text('${beneficiaryName}')`)
      .click();
  }

  async getSelectedBeneficiary(): Promise<string | null> {
    return this.searchBox.textContent();
  }

  async enterDetailsManually(beneficiaryName: string): Promise<void> {
    await this.expand();
    await this.searchBox.fill(beneficiaryName);
    await this.enterDataManuallyButton.click();
  }

  async getLoadedData(beneficiaryType: BeneficiaryType): Promise<BeneficiaryListItemData[]> {
    const result: BeneficiaryListItemData[] = [];

    await this.expand();
    await this.selectTab(beneficiaryType);

    const loadedBeneficiaryListItems = this.root.locator(this.beneficiaryListItemLocator);

    for (let i = 0; i < (await loadedBeneficiaryListItems.count()); i++) {
      const listItem = new BeneficiaryListItems(loadedBeneficiaryListItems.nth(i));
      result.push(await listItem.getData());
    }
    return result;
  }
}
