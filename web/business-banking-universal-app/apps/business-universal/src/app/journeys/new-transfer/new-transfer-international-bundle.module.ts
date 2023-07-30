import { NgModule } from '@angular/core';
import { PaymentCommunicationService } from '@backbase/business/feature/communication';
import {
  INITIATE_PAYMENT_CONFIG,
  INITIATE_PAYMENT_JOURNEY_COMMUNICATOR,
  InitiatePaymentJourneyModule,
  INTERNATIONAL_TRANSFER,
  PayordOmniPaymentConfigProvider,
  INITIATE_PAYMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_A2A_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_OPTIONS_BASE_PATH,
  INITIATE_PAYMENT_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
} from '@backbase/initiate-payment-journey-ang';
import {
  APP_PAYMENT_ORDER_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_CONTACT_MANAGER_BASE_PATH,
  APP_PAYMENT_ORDER_A2A_BASE_PATH,
  APP_PAYMENT_ORDER_OPTIONS_BASE_PATH,
  APP_ACCESS_CONTROL_BASE_PATH,
} from '../../service-paths.module';

@NgModule({
  imports: [InitiatePaymentJourneyModule.forRoot()],
  providers: [
    PayordOmniPaymentConfigProvider,
    {
      provide: INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_A2A_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_A2A_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_PAYMENT_ORDER_OPTIONS_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_OPTIONS_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
    {
      provide: INITIATE_PAYMENT_CONFIG,
      useValue: {
        paymentTypes: [
          {
            ...INTERNATIONAL_TRANSFER,
            name: $localize`:@@international-payment-config.name:International Payment`,
          },
        ],
        businessFunctions: [INTERNATIONAL_TRANSFER.businessFunction],
        options: {
          defaultCountry: 'NL',
        },
      },
    },
    {
      provide: INITIATE_PAYMENT_JOURNEY_COMMUNICATOR,
      useExisting: PaymentCommunicationService,
    },
  ],
})
export class NewTransferInternationalJourneyBundleModule {}
