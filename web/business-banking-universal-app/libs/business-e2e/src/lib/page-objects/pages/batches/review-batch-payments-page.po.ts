import { BasePage } from '../base-page.po';
import { TransactionSigningModal } from '../../fragments/batches/transaction-signing-modal.po';

export class ReviewBatchesPage extends BasePage {
  readonly submitButton = this.page.locator('[data-role="multi-payment-submit"]');
  readonly editButton = this.page.locator('[data-role="edit-button"]');
  readonly discardButton = this.page.locator('[data-role="cancel-button"]');
  readonly dropDownButtonSubmit = this.page.locator('bb-review-payment  [data-role="dropdown-menu-toggle-button"]');
  readonly submitAndApproveButton = this.page.locator('bb-review-payment  [data-role="bus-submit-and-approve-button"]');

  readonly transactionSigningModal = new TransactionSigningModal(this.page.locator('bb-transaction-signing-sms-otp'));

  async confirmPaymentTransactionSigning(generateOtpFunction: () => Promise<string>) {
    await this.transactionSigningModal.completeButton.waitFor();

    const otpPassword = await generateOtpFunction();

    await this.transactionSigningModal.submitOtp(otpPassword);
  }

  async selfApprovePayment() {
    await this.dropDownButtonSubmit.click();
    await this.submitAndApproveButton.click();
  }
}
