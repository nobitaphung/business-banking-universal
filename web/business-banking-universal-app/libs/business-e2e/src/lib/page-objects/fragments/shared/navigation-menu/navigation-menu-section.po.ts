import { Locator } from '@playwright/test';

export class NavigationMenuSection {
  readonly name: Locator;
  items: Locator[] = [];

  private readonly section: Locator;

  constructor(private root: Locator, private sectionName: string) {
    this.section = this.root.locator(`bb-header-ui[heading=" ${sectionName} "]`);
    this.name = this.section.locator(`h3[data-role="headings"]`);
  }

  async initiateSectionItems(): Promise<void> {
    await this.section.locator('../../ul/li').first().waitFor({ state: 'visible' });
    const menuItems = this.section.locator('../../ul/li');

    for (let item = 1; item <= (await menuItems.count()); ++item) {
      this.items.push(menuItems.locator(`../li[${item}]/a/span`));
    }
  }

  async goTo(menuItemName: string): Promise<void> {
    let menuItem: Locator | undefined = undefined;
    for (const item of this.items) {
      const itemText = (await item.textContent())?.trim().toLocaleLowerCase();
      if (itemText === menuItemName.trim().toLocaleLowerCase()) {
        menuItem = item;
        break;
      }
    }
    if (!menuItem) {
      throw new Error(`Unable to find ${menuItemName} within ${await this.name.textContent()} section`);
    }

    await menuItem.click();
  }
}
