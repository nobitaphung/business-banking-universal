import { LEGAL_ENTITIES_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class LegalEntitiesPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-legal-entities-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(LEGAL_ENTITIES_PAGE_PATH);
  }
}
