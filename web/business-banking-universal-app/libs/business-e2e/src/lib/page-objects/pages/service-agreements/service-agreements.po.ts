import { SERVICE_AGREEMENTS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class ServiceAgreementsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-service-agreements-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(SERVICE_AGREEMENTS_PAGE_PATH);
  }
}
