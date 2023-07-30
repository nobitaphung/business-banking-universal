import { NgModule } from '@angular/core';
import { CompanyPermissionServiceAgreementCommunication } from '@backbase/business/feature/communication';
import {
  ServiceAgreementCommunicationService,
  ServiceAgreementsJourneyConfiguration,
  ServiceAgreementsJourneyConfigurationToken,
  ServiceAgreementsJourneyModule,
  SERVICE_AGREEMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  SERVICE_AGREEMENT_JOURNEY_USER_BASE_PATH,
  SERVICE_AGREEMENT_JOURNEY_LIMIT_BASE_PATH,
  SERVICE_AGREEMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
  SERVICE_AGREEMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
} from '@backbase/service-agreements-journey-ang';
import {
  APP_ACCESS_CONTROL_V3_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_CONTACT_MANAGER_BASE_PATH,
  APP_LIMIT_BASE_PATH,
  APP_USER_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [ServiceAgreementsJourneyModule.forRoot()],
  providers: [
    {
      provide: ServiceAgreementsJourneyConfigurationToken,
      useValue: {
        notificationDismissTime: 3,
        enableLimit: true,
        enableShadowLimit: true,
        pageSize: 5,
        maxNavPages: 2,
        paginationType: 'pagination',
        showButtons: true,
        participants: {
          enableLimit: true,
          enableShadowLimit: false,
        },
      } as ServiceAgreementsJourneyConfiguration,
    },
    {
      provide: ServiceAgreementCommunicationService,
      useExisting: CompanyPermissionServiceAgreementCommunication,
    },
    {
      provide: SERVICE_AGREEMENT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_V3_BASE_PATH,
    },
    {
      provide: SERVICE_AGREEMENT_JOURNEY_USER_BASE_PATH,
      useExisting: APP_USER_BASE_PATH,
    },
    {
      provide: SERVICE_AGREEMENT_JOURNEY_LIMIT_BASE_PATH,
      useExisting: APP_LIMIT_BASE_PATH,
    },
    {
      provide: SERVICE_AGREEMENT_JOURNEY_CONTACT_MANAGER_BASE_PATH,
      useExisting: APP_CONTACT_MANAGER_BASE_PATH,
    },
    {
      provide: SERVICE_AGREEMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
  ],
})
export class ServiceAgreementsJourneyBundleModule {}
