import { NgModule } from '@angular/core';
import { PaymentCommunicationService } from '@backbase/business/feature/communication';
import {
  ManagePaymentsJourneyCommunicationService,
  ManagePaymentsJourneyConfigurationToken,
  ManagePaymentsJourneyModule,
  MANAGE_PAYMENTS_JOURNEY_APPROVAL_BASE_PATH,
  MANAGE_PAYMENTS_JOURNEY_PAYMENT_ORDER_BASE_PATH,
} from '@backbase/manage-payments-journey-ang';
import { PERMISSIONS } from '../auth/permissions';
import { APP_APPROVAL_BASE_PATH, APP_PAYMENT_ORDER_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [ManagePaymentsJourneyModule.forRoot()],
  providers: [
    {
      provide: MANAGE_PAYMENTS_JOURNEY_APPROVAL_BASE_PATH,
      useExisting: APP_APPROVAL_BASE_PATH,
    },
    {
      provide: MANAGE_PAYMENTS_JOURNEY_PAYMENT_ORDER_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: ManagePaymentsJourneyCommunicationService,
      useExisting: PaymentCommunicationService,
    },
    {
      provide: ManagePaymentsJourneyConfigurationToken,
      useValue: {
        navigationHeaderItems: [
          {
            label: $localize`:@@manage-payments-journey.header-buttons.sepa-transfer:New Payment`,
            value: 'new-transfer-easy',
            icon: 'add',
            canView: PERMISSIONS.canCreateUniversalWizard,
          },
        ],
      },
    },
  ],
})
export class ManagePaymentsJourneyBundleModule {}
