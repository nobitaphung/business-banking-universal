import { Page } from '@playwright/test';
import { PageObject } from './page-object';
import { SearchBox } from '../elements';

export class SelectContextPage extends PageObject {
  private readonly searchBox = new SearchBox(this.page.locator('[data-role="Search"]'));
  private readonly contextItemList = this.page.locator('[data-role="service-agreement-item-name"]');

  constructor(page: Page) {
    super(page);
  }

  async selectContext(context: string): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    if (await this.searchBox.isVisible({})) {
      await this.searchBox.searchFor(context);
    }
    await this.contextItemList.filter({ hasText: context }).click();
  }
}
