import { Locator } from '@playwright/test';
import { NavigationMenuSection } from './navigation-menu-section.po';

export class NavigationMenu {
  constructor(private root: Locator) {}

  async getMenuSection(section: string) {
    const menuSection = new NavigationMenuSection(
      this.root.locator(`li[class="bb-layout__vertical-nav-section"]`),
      section,
    );
    await menuSection.initiateSectionItems();
    return menuSection;
  }
}
