import { NgModule } from '@angular/core';
import {
  InitiateLoansPaymentDefaultRoute,
  InitiateLoansPaymentJourneyModule,
  PayordOmniLoansPaymentConfigProvider,
  INITIATE_LOANS_PAYMENT_CONFIG,
  INITIATE_LOANS_PAYMENT_JOURNEY_COMMUNICATOR,
  newLoansOptions,
  destroyHook,
  onSave,
  LoanPaymentRouteResolver,
  INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_A2A_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_OPTIONS_BASE_PATH,
  INITIATE_LOANS_PAYMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  LOANS_PAYMENT,
} from '@backbase/initiate-loans-payment-journey';
import { LoansCommunicationService } from '@backbase/business/feature/communication';
import { Route } from '@angular/router';

import {
  APP_PAYMENT_ORDER_BASE_PATH,
  APP_CONTACT_MANAGER_BASE_PATH,
  APP_PAYMENT_ORDER_A2A_BASE_PATH,
  APP_PAYMENT_ORDER_OPTIONS_BASE_PATH,
  APP_ACCESS_CONTROL_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
} from '../../service-paths.module';

const InitiatePaymentRoute: Route = {
  ...InitiateLoansPaymentDefaultRoute,
  resolve: {
    loan: LoanPaymentRouteResolver,
  },
};
@NgModule({
  imports: [InitiateLoansPaymentJourneyModule.forRoot({ route: InitiatePaymentRoute })],
  providers: [
    PayordOmniLoansPaymentConfigProvider,
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_A2A_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_A2A_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_PAYMENT_ORDER_OPTIONS_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_OPTIONS_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
    {
      provide: INITIATE_LOANS_PAYMENT_CONFIG,
      useValue: {
        paymentTypes: [LOANS_PAYMENT],
        businessFunctions: ['Loans Payment'],
        options: {
          ...newLoansOptions,
          header: () => $localize`:@@routable-modal.modal-title.payments-pay-down:Pay down`,
        },
        hooks: {
          onDestroy: destroyHook,
          onSave: onSave,
        },
      },
    },
    {
      provide: INITIATE_LOANS_PAYMENT_JOURNEY_COMMUNICATOR,
      useExisting: LoansCommunicationService,
    },
  ],
})
export class NewLoansPaymentJourneyBundleModule {}
