import { NgModule } from '@angular/core';
import {
  ACCOUNT_STATEMENT_BUSINESS_JOURNEY_ACCOUNT_STATEMENT_BASE_PATH,
  ACCOUNT_STATEMENT_BUSINESS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  ACCOUNT_STATEMENT_BUSINESS_JOURNEY_CONFIGURATION_TOKEN,
  AccountStatementArchiveDownloadViewComponent,
  AccountStatementBusinessJourneyComponent,
  AccountStatementBusinessJourneyConfiguration,
  AccountStatementBusinessJourneyModule,
  AccountStatementBusinessViewComponent,
} from '@backbase/account-statement-business-journey-ang';
import { APP_ACCOUNT_STATEMENT_BASE_PATH, APP_ARRANGEMENT_MANAGER_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [
    AccountStatementBusinessJourneyModule.forRoot({
      routes: {
        path: '',
        component: AccountStatementBusinessJourneyComponent,
        children: [
          {
            path: '',
            component: AccountStatementBusinessViewComponent,
          },
          {
            path: 'download',
            component: AccountStatementArchiveDownloadViewComponent,
          },
          { path: '**', redirectTo: '', pathMatch: 'full' },
        ],
      },
    }),
  ],
  providers: [
    {
      provide: ACCOUNT_STATEMENT_BUSINESS_JOURNEY_CONFIGURATION_TOKEN,
      useValue: {
        multipleStatementsDownload: true,
        statementsDownloadSelectionLimit: 25,
        selectMultipleAccounts: true,
        showManageStatementsNavigation: true,
        manageStatementsNavigationUrl: '/manage-statements',
        hideManageStatementsNavigationWhenMissingPermissions: true,
      } as Partial<AccountStatementBusinessJourneyConfiguration>,
    },
    {
      provide: ACCOUNT_STATEMENT_BUSINESS_JOURNEY_ACCOUNT_STATEMENT_BASE_PATH,
      useExisting: APP_ACCOUNT_STATEMENT_BASE_PATH,
    },
    {
      provide: ACCOUNT_STATEMENT_BUSINESS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
  ],
})
export class AccountStatementBusinessJourneyBundleModule {}
