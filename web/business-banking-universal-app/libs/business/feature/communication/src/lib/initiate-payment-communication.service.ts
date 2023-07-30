import { Injectable } from '@angular/core';
import { IdentifiedPaymentOrder } from '@backbase/data-ang/payment-order';
import { PaymentTemplate } from '@backbase/data-ang/payment-template';
import {
  InitiatePaymentJourneyCommunicationService,
  InitiatePaymentJourneyComponentApi,
  PaymentMode,
  TriggerInitiatePaymentPayload,
} from '@backbase/initiate-payment-journey-ang';
import { PaymentTemplatesJourneyCommunicationService } from '@backbase/manage-payment-templates-journey-ang';
import { ManagePaymentsJourneyCommunicationService } from '@backbase/manage-payments-journey-ang';

import { SharedRoutableModalService } from '@backbase/shared/feature/routable-modal';
import { Subject } from 'rxjs';
import { getPaymentUrl, getTemplateUrl } from './constants/initiate-payment-journey-helpers';

@Injectable({
  providedIn: 'root',
})
export class PaymentCommunicationService
  implements
    ManagePaymentsJourneyCommunicationService,
    InitiatePaymentJourneyCommunicationService,
    PaymentTemplatesJourneyCommunicationService
{
  private paymentData?: TriggerInitiatePaymentPayload;
  private paymentTemplateData?: TriggerInitiatePaymentPayload;
  private refreshTemplate$$ = new Subject<void>();
  private triggerPaymentsRefresh$$ = new Subject<void>();
  public readonly refreshTemplate$ = this.refreshTemplate$$.asObservable();
  public readonly triggerPaymentsRefresh$ = this.triggerPaymentsRefresh$$.asObservable();

  constructor(private readonly routableModal: SharedRoutableModalService) {}

  init(api: InitiatePaymentJourneyComponentApi): void {
    api.setupData(this.paymentData || this.paymentTemplateData);
  }

  reset() {
    this.paymentData = undefined;
    this.paymentTemplateData = undefined;
  }

  closeEvent(): void {
    this.routableModal.closeModal();
    this.refreshTemplate$$.next();
    this.triggerPaymentsRefresh$$.next();
  }

  editPayment(payment: IdentifiedPaymentOrder): void {
    if (!payment) {
      return;
    }

    this.routableModal.openModal(getPaymentUrl(payment.paymentType));
    this.paymentData = {
      payment,
      options: {
        paymentMode: PaymentMode.EDIT_PAYMENT,
      },
    };
  }

  copyPayment(payment: IdentifiedPaymentOrder): void {
    this.routableModal.openModal(getPaymentUrl(payment.paymentType));
    this.paymentData = {
      payment,
      options: {
        paymentMode: PaymentMode.COPY_PAYMENT,
      },
    };
  }

  headerNavigationAction(value: any): void {
    this.routableModal.openModal(value);
  }

  editPaymentTemplate(template: PaymentTemplate): void {
    this.routableModal.openModal(getTemplateUrl(template.details.paymentType));
    this.paymentTemplateData = {
      template,
      options: {
        paymentMode: PaymentMode.EDIT_TEMPLATE,
        isTemplateMode: true,
      },
    };
  }

  selectPaymentTemplate(template: PaymentTemplate): void {
    this.paymentTemplateData = {
      template,
      options: {
        paymentMode: PaymentMode.CREATE_PAYMENT,
      },
    };

    this.routableModal.openModal('new-payment-from-template');
  }

  createPaymentTemplate(value: string): void {
    switch (value) {
      case 'new-transfer-ach':
        this.routableModal.openModal('new-template-ach');
        break;
      case 'new-transfer-sepa':
        this.routableModal.openModal('new-template-sepa');
        break;
      case 'new-transfer-wire':
        this.routableModal.openModal('new-template-wire');
        break;
      case 'new-international-wire':
        this.routableModal.openModal('new-template-international-wire');
        break;
      case 'new-transfer-internal':
        this.routableModal.openModal('new-template-internal');
        break;
    }
  }
}
