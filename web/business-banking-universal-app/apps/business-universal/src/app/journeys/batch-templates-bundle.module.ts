import { NgModule } from '@angular/core';
import {
  BATCH_TEMPLATES_JOURNEY_APPROVAL_BASE_PATH,
  BATCH_TEMPLATES_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_BASE_PATH,
  BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
  BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
  BatchTemplatesJourneyCommunicationService,
  BatchTemplatesJourneyConfiguration,
  BatchTemplatesJourneyConfigurationToken,
  BatchTemplatesJourneyModule,
} from '@backbase/batch-templates-journey-ang';
import { BatchCommunicationService } from '@backbase/business/feature/communication';
import {
  APP_APPROVAL_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [BatchTemplatesJourneyModule.forRoot()],
  providers: [
    {
      provide: BatchTemplatesJourneyConfigurationToken,
      useValue: {
        displayCreateTemplatesButton: false,
      } as Partial<BatchTemplatesJourneyConfiguration>,
    },
    {
      provide: BatchTemplatesJourneyCommunicationService,
      useExisting: BatchCommunicationService,
    },
    {
      provide: BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_BASE_PATH,
    },
    {
      provide: BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
    },
    {
      provide: BATCH_TEMPLATES_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: BATCH_TEMPLATES_JOURNEY_APPROVAL_BASE_PATH,
      useExisting: APP_APPROVAL_BASE_PATH,
    },
    {
      provide: BATCH_TEMPLATES_JOURNEY_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
    },
  ],
})
export class BatchTemplatesJourneyBundleModule {}
