import { TEMPLATES_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class PaymentsTemplatesPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-manage-payment-templates-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(TEMPLATES_PAGE_PATH);
  }
}
