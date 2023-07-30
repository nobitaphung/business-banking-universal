import { Locator, Page } from '@playwright/test';

export class DropDownMenu {
  private expandedMenuContainer = (this.page || this.root).locator('.dropdown-menu.show');
  private toggle = this.root.locator('.dropdown-toggle');
  private menuItemLocator = '.dropdown-item';

  constructor(private root: Locator, private page?: Page) {}

  getSelectedOption(): Promise<string | null> {
    return this.toggle.textContent();
  }

  async getAllOptions(): Promise<string[]> {
    await this.expand();
    const allOptions = await this.expandedMenuContainer.locator(this.menuItemLocator).allInnerTexts();
    await this.collapse();
    return allOptions;
  }

  async select(value: string): Promise<void> {
    await this.expand();
    try {
      await this.expandedMenuContainer.locator(`${this.menuItemLocator}:has-text('${value}')`).click();
    } catch {
      throw new Error(`${value} not present in options list`);
    }
  }

  private async isExpanded(): Promise<boolean> {
    return (await this.toggle.getAttribute('aria-expanded')) === 'true';
  }

  private async expand(): Promise<void> {
    if (await this.isExpanded()) {
      console.warn(`${this.root} dropdown already expanded, proceeding further`);
    } else {
      await this.toggle.click();
      await this.expandedMenuContainer.waitFor();
    }
  }

  private async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle.click();
    } else {
      console.warn(`${this.root} dropdown already collapsed, proceeding further`);
    }
  }
}
