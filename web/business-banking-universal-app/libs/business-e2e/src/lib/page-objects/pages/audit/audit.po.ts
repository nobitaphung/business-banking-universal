import { AUDIT_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class AuditPage extends BasePage {
  override readonly pageTitleHeader = this.page.locator('h1[data-role="audit-journey-header"]');
  readonly journeyUi = this.page.locator('bb-audit-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(AUDIT_PAGE_PATH);
  }
}
