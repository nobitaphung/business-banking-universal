import { NgModule } from '@angular/core';
import {
  BATCH_JOURNEY_APPROVAL_BASE_PATH,
  BATCH_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  BATCH_JOURNEY_COMMUNICATOR,
  BATCH_JOURNEY_PAYMENT_BATCH_BASE_PATH,
  BATCH_JOURNEY_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
  BATCH_JOURNEY_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
  BatchesJourneyConfiguration,
  BatchesJourneyConfigurationToken,
  BatchesJourneyModule,
  BatchMenuOptionKey,
} from '@backbase/batch-journey-ang';

import { BatchCommunicationService } from '@backbase/business/feature/communication';
import {
  APP_APPROVAL_BASE_PATH,
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
  APP_BATCH_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [BatchesJourneyModule.forRoot()],
  providers: [
    {
      provide: BATCH_JOURNEY_COMMUNICATOR,
      useExisting: BatchCommunicationService,
    },
    {
      provide: BatchesJourneyConfigurationToken,
      useValue: {
        batchFileTypes: [
          {
            value: 'SEPA',
            label: $localize`:@@batch-journey-configuration.batch-file-type.sepa.label:SEPA file`,
            description: $localize`:@@batch-journey-configuration.batch-file-type.sepa.description:Upload multiple files up to 100 MB`,
          },
        ],
        batchTypes: [
          {
            type: 'BB_SEPACT_CSV',
            sizeLimit: '100',
            format: '.csv',
            entitlementsCondition: 'Batch.Batch-SEPACT.create',
          },
        ],
        dynamicCreditDebitMixedIndicator: true,
        enableManualBatch: false,
        appRegion: 'universal',
        headingTitle: 'Batches',
        headingType: 'h1',
        batchMenuOptionsKeys: [BatchMenuOptionKey.UPLOAD_BATCH],
      } as Partial<BatchesJourneyConfiguration>,
    },
    {
      provide: BATCH_JOURNEY_APPROVAL_BASE_PATH,
      useExisting: APP_APPROVAL_BASE_PATH,
    },
    {
      provide: BATCH_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: BATCH_JOURNEY_PAYMENT_BATCH_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_BASE_PATH,
    },
    {
      provide: BATCH_JOURNEY_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_UPLOAD_MAPPING_BASE_PATH,
    },

    {
      provide: BATCH_JOURNEY_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_BATCH_TEMPLATE_BASE_PATH,
    },
  ],
})
export class BatchesJourneyBundleModule {}
