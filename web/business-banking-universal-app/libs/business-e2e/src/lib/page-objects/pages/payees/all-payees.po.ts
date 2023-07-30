import { PAYEES_ALL_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class AllPayeesPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-contact-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(PAYEES_ALL_PAGE_PATH);
  }
}
