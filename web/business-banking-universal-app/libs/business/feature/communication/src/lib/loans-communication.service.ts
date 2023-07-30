import { Injectable } from '@angular/core';
import {
  setEditMode,
  LoansPaymentMode,
  InitiateLoansPaymentJourneyComponentApi,
  TriggerInitiateLoansPaymentPayload,
} from '@backbase/initiate-loans-payment-journey';
import { LoanCommunicationService } from '@backbase/loans-journey-ang';
import { SharedRoutableModalService } from '@backbase/shared/feature/routable-modal';
import { IdentifiedPaymentOrder } from '@backbase/payment-order-http-ang';

@Injectable({
  providedIn: 'root',
})
export class LoansCommunicationService implements LoanCommunicationService {
  private paymentData?: TriggerInitiateLoansPaymentPayload;

  constructor(private readonly routableModal: SharedRoutableModalService) {}

  init(api: InitiateLoansPaymentJourneyComponentApi): void {
    api.setupData(this.paymentData);
  }

  navigateToLoanAdvance(): void {
    this.routableModal.openModal('loans-advance');
  }

  navigateToLoanPayment(): void {
    this.routableModal.openModal('loans-payment');
  }

  reset() {
    this.paymentData = undefined;
  }

  editLoanPayment(payment: IdentifiedPaymentOrder): void {
    if (!payment) {
      return;
    }

    this.routableModal.openModal('loans-payment');
    this.paymentData = {
      payment,
      options: {
        paymentMode: LoansPaymentMode.EDIT_PAYMENT,
      },
    };
  }

  editLoanAdvance(payment: IdentifiedPaymentOrder): void {
    if (!payment) {
      return;
    }

    this.routableModal.openModal('loans-advance');
    this.paymentData = {
      payment,
      options: {
        paymentMode: LoansPaymentMode.EDIT_PAYMENT,
      },
    };
  }

  closeEvent(): void {
    setEditMode(false);
    this.routableModal.closeModal();
  }
}
