import { CARDS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class CardsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-cards-management-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(CARDS_PAGE_PATH);
  }
}
