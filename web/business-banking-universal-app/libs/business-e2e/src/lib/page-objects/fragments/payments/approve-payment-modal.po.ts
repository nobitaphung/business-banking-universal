import { Locator } from '@playwright/test';

export class ApprovePaymentModal {
  readonly messageTextarea = this.root.locator('[data-role="confirmation-comment"] textarea');
  readonly approveButton = this.root.locator('[data-role="confirm-action-btn"]');
  readonly rejectButton = this.root.locator('[data-role="confirm-action-btn"]');

  constructor(private root: Locator) {}

  async approveWithComment(message: string): Promise<void> {
    await this.messageTextarea.fill(message);
    await this.approveButton.click();
  }

  async rejectWithComment(message: string): Promise<void> {
    await this.messageTextarea.fill(message);
    await this.rejectButton.click();
  }
}
