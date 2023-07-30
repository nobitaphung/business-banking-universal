import { LOANS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class LoansPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-loan-list-wrapper');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(LOANS_PAGE_PATH);
  }
}
