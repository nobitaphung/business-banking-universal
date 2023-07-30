import { FIND_ATM_OR_BRANCH_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class FindAtmBranchPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-places-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(FIND_ATM_OR_BRANCH_PAGE_PATH);
  }
}
