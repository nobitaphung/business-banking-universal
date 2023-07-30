import { NgModule } from '@angular/core';
import {
  MANAGE_STATEMENTS_BUSINESS_JOURNEY_ACCOUNT_STATEMENT_BASE_PATH,
  MANAGE_STATEMENTS_BUSINESS_JOURNEY_CONFIG_TOKEN,
  ManageStatementsBusinessJourneyConfiguration,
  ManageStatementsBusinessJourneyModule,
} from '@backbase/manage-statements-business-journey-ang';
import { APP_ACCOUNT_STATEMENT_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [ManageStatementsBusinessJourneyModule.forRoot()],
  providers: [
    {
      provide: MANAGE_STATEMENTS_BUSINESS_JOURNEY_CONFIG_TOKEN,
      useFactory: function () {
        return {
          accountStatementsNavigationUrl: '/account-statements',
        } as Partial<ManageStatementsBusinessJourneyConfiguration>;
      },
    },
    {
      provide: MANAGE_STATEMENTS_BUSINESS_JOURNEY_ACCOUNT_STATEMENT_BASE_PATH,
      useExisting: APP_ACCOUNT_STATEMENT_BASE_PATH,
    },
  ],
})
export class ManageStatementsJourneyBundleModule {}
