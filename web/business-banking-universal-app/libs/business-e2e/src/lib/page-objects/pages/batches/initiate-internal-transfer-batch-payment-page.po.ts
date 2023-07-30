import { Page } from '@playwright/test';
import { InternalBatchPaymentData } from '../../../data/model/batches.data';
import { InternalBatchPaymentForm } from '../../fragments/batches/internal-batch-payment-form.po';
import { BaseInitiatePaymentsPage } from './base-batch-payment-page';

export class InitiateInternalTransferBatchPaymentPage extends BaseInitiatePaymentsPage<
  InternalBatchPaymentForm,
  InternalBatchPaymentData
> {
  constructor(page: Page) {
    super(page, InternalBatchPaymentForm);
  }

  async fillInPaymentData(paymentData: InternalBatchPaymentData): Promise<void> {
    await this.debitAccountSelector.selectByText(paymentData.originatorAccountName);
    await this.currencyInput.setAmount(`${paymentData.amount}`);
    await this.paymentTypeForm.beneficiaryAccountSelector.selectByText(paymentData.beneficiaryName);
    if (paymentData.description) {
      await this.paymentTypeForm.description.fill(paymentData.description);
    }
  }
}
