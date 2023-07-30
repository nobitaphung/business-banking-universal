import { NgModule } from '@angular/core';
import {
  CASH_FLOW_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  CashFlowJourneyConfiguration,
  CashFlowJourneyConfigurationToken,
  CashFlowJourneyModule,
} from '@backbase/cash-flow-journey-ang';
import { APP_ARRANGEMENT_MANAGER_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [CashFlowJourneyModule.forRoot()],
  providers: [
    {
      provide: CashFlowJourneyConfigurationToken,
      useValue: {
        receivablesPageSize: 10,
        payablesPageSize: 10,
      } as Partial<CashFlowJourneyConfiguration>,
    },
    {
      provide: CASH_FLOW_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
  ],
})
export class CashFlowJourneyBundleModule {}
