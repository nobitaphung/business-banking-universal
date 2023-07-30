import { FOREX_CURRENCIES_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class CurrenciesPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-tradingfx-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(FOREX_CURRENCIES_PAGE_PATH);
  }
}
