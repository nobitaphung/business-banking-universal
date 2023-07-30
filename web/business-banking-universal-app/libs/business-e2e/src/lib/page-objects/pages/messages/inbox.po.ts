import { MESSAGES_INBOX_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class InboxPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-messages-client-inbox-journey');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(MESSAGES_INBOX_PAGE_PATH);
  }
}
