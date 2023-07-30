import { NgModule } from '@angular/core';
import {
  ACCOUNTS_JOURNEY_CONFIGURATION,
  AccountsJourneyConfiguration,
  AccountsJourneyModule,
  ACCOUNTS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  ACCOUNTS_JOURNEY_TRANSACTIONS_BASE_PATH,
  ACCOUNTS_JOURNEY_PAYMENT_BATCH_BASE_PATH,
  ACCOUNTS_JOURNEY_FINANCIAL_INSTITUTION_MANAGER_BASE_PATH,
  ACCOUNTS_JOURNEY_CATEGORIES_MANAGEMENT_BASE_PATH,
  ACCOUNTS_JOURNEY_MESSAGES_BASE_PATH,
  ACCOUNTS_JOURNEY_ACCESS_CONTROL_BASE_PATH,
} from '@backbase/accounts-journey-ang';
import { AccountsCommunicationServiceProvider } from '@backbase/business/feature/communication';
import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { environment } from '../../environments/environment';
import {
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_TRANSACTIONS_BASE_PATH,
  APP_BATCH_PAYMENT_MANAGER_BASE_PATH,
  APP_FINANCIAL_INSTITUTION_MANAGER_BASE_PATH,
  APP_CATEGORIES_MANAGEMENT_BASE_PATH,
  APP_MESSAGES_BASE_PATH,
  APP_ACCESS_CONTROL_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [EntitlementsModule, AccountsJourneyModule.forRoot()],
  providers: [
    {
      provide: ACCOUNTS_JOURNEY_CONFIGURATION,
      useValue: {
        apiKey: environment.googleApiKey,
        disputeTopicId: '',
        inquireTopicId: '',
      } as Partial<AccountsJourneyConfiguration>,
    },
    AccountsCommunicationServiceProvider,
    {
      provide: ACCOUNTS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_TRANSACTIONS_BASE_PATH,
      useExisting: APP_TRANSACTIONS_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_PAYMENT_BATCH_BASE_PATH,
      useExisting: APP_BATCH_PAYMENT_MANAGER_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_FINANCIAL_INSTITUTION_MANAGER_BASE_PATH,
      useExisting: APP_FINANCIAL_INSTITUTION_MANAGER_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_CATEGORIES_MANAGEMENT_BASE_PATH,
      useExisting: APP_CATEGORIES_MANAGEMENT_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_MESSAGES_BASE_PATH,
      useExisting: APP_MESSAGES_BASE_PATH,
    },
    {
      provide: ACCOUNTS_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
  ],
})
export class AccountsJourneyBundleModule {}
