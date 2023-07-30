import { NgModule } from '@angular/core';
import { TransactionsBatchesCommunicationService } from '@backbase/business/feature/communication';
import {
  TransactionsCommunicationService,
  TransactionsJourneyModule,
  TRANSACTIONS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  TRANSACTIONS_JOURNEY_TRANSACTIONS_BASE_PATH,
  TRANSACTIONS_JOURNEY_PAYMENT_BATCH_BASE_PATH,
  TransactionsJourneyConfiguration,
  TRANSACTIONS_JOURNEY_CONFIGURATION,
  TRANSACTIONS_JOURNEY_CATEGORIES_MANAGEMENT_BASE_PATH,
  TRANSACTIONS_JOURNEY_MESSAGES_BASE_PATH,
} from '@backbase/transactions-journey-ang';
import { environment } from '../../environments/environment';
import {
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_TRANSACTIONS_BASE_PATH,
  APP_BATCH_PAYMENT_MANAGER_BASE_PATH,
  APP_MESSAGES_BASE_PATH,
  APP_CATEGORIES_MANAGEMENT_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [TransactionsJourneyModule.forRoot()],
  providers: [
    {
      provide: TRANSACTIONS_JOURNEY_CONFIGURATION,
      useValue: {
        apiKey: environment.googleApiKey,
        disputeTopicId: '',
        inquireTopicId: '',
      } as Partial<TransactionsJourneyConfiguration>,
    },
    {
      provide: TransactionsCommunicationService,
      useExisting: TransactionsBatchesCommunicationService,
    },
    {
      provide: TRANSACTIONS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: TRANSACTIONS_JOURNEY_TRANSACTIONS_BASE_PATH,
      useExisting: APP_TRANSACTIONS_BASE_PATH,
    },
    {
      provide: TRANSACTIONS_JOURNEY_PAYMENT_BATCH_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_MANAGER_BASE_PATH,
    },
    {
      provide: TRANSACTIONS_JOURNEY_MESSAGES_BASE_PATH,
      useExisting: APP_MESSAGES_BASE_PATH,
    },
    {
      provide: TRANSACTIONS_JOURNEY_CATEGORIES_MANAGEMENT_BASE_PATH,
      useExisting: APP_CATEGORIES_MANAGEMENT_BASE_PATH,
    },
  ],
})
export class TransactionsJourneyBundleModule {}
