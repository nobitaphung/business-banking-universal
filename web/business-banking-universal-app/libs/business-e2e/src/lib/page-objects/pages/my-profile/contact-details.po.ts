import { MY_PROFILE_CONTACT_DETAILS_PAGE_PATH } from '../../../data';
import { Page } from '@playwright/test';
import { BasePage } from '../base-page.po';

export class ContactDetailsPage extends BasePage {
  readonly journeyUi = this.page.locator('bb-my-profile-journeys-view');

  constructor(page: Page) {
    super(page);
  }

  async navigateTo() {
    await super.navigateTo(MY_PROFILE_CONTACT_DETAILS_PAGE_PATH);
  }
}
