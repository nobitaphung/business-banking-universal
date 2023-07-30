import { SWEEPING_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class SweepingPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-cash-management-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(SWEEPING_PAGE_PATH);
  }
}
