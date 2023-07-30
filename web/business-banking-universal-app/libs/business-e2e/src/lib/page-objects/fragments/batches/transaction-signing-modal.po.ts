import { Locator } from '@playwright/test';

export class TransactionSigningModal {
  readonly otpInput = this.root.locator('[data-role="ts-sms-otp-field"] input');
  readonly completeButton = this.root.locator('[data-role="ts-sms-otp-complete"]');
  readonly cancelButton = this.root.locator('[data-role="ts-sms-otp-cancel"]');

  constructor(public readonly root: Locator) {}

  async submitOtp(otp: string) {
    await this.otpInput.fill(otp);
    await this.completeButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }
}
