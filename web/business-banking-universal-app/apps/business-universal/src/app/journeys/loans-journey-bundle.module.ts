import { NgModule } from '@angular/core';
import { LoansCommunicationService } from '@backbase/business/feature/communication';
import {
  LoansJourneyModule,
  LOAN_JOURNEY_COMMUNICATOR,
  LOANS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  LOAN_ACCOUNT_ALIAS_DISPLAYING_LEVEL,
  AccountAliasDisplayingLevel,
} from '@backbase/loans-journey-ang';
import { APP_ARRANGEMENT_MANAGER_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [LoansJourneyModule.forRoot()],
  providers: [
    {
      provide: LOAN_JOURNEY_COMMUNICATOR,
      useExisting: LoansCommunicationService,
    },
    {
      provide: LOANS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: LOAN_ACCOUNT_ALIAS_DISPLAYING_LEVEL,
      useValue: AccountAliasDisplayingLevel.ACCOUNT,
    },
  ],
})
export class LoansJourneyBundleModule {}
