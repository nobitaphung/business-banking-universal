import { NgModule } from '@angular/core';
import { PaymentCommunicationService } from '@backbase/business/feature/communication';
import {
  ManagePaymentTemplatesJourneyModule,
  MANAGE_PAYMENT_TEMPLATES_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  MANAGE_PAYMENT_TEMPLATES_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
  PaymentTemplatesJourneyCommunicationService,
  PaymentTemplatesJourneyConfigurationToken,
} from '@backbase/manage-payment-templates-journey-ang';
import { APP_ACCESS_CONTROL_BASE_PATH, APP_PAYMENT_ORDER_BASE_PATH } from '../service-paths.module';
import { PERMISSIONS } from '../auth/permissions';

@NgModule({
  imports: [ManagePaymentTemplatesJourneyModule.forRoot()],
  providers: [
    {
      provide: MANAGE_PAYMENT_TEMPLATES_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
    {
      provide: MANAGE_PAYMENT_TEMPLATES_JOURNEY_PAYMENT_TEMPLATE_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: PaymentTemplatesJourneyConfigurationToken,
      useValue: {
        refreshTemplatesEventName: 'bb.success.create.payment',
        navigationHeaderItems: [
          {
            label: $localize`:@@manage-templates-journey.header-buttons.sepa-template:SEPA`,
            value: 'new-transfer-sepa',
            icon: 'add',
            canView: PERMISSIONS.canCreateSEPA,
          },
          {
            label: $localize`:@@manage-templates-journey.header-buttons.international-template:International (SWIFT)`,
            value: 'new-international-wire',
            icon: 'add',
            canView: PERMISSIONS.canCreateInternational,
          },
        ],
      },
    },
    {
      provide: PaymentTemplatesJourneyCommunicationService,
      useExisting: PaymentCommunicationService,
    },
  ],
})
export class PaymentTemplatesJourneyBundleModule {}
