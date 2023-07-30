import { NgModule } from '@angular/core';
import {
  CashManagementConfiguration,
  CashManagementConfigurationToken,
  CashManagementJourneyModule,
  CASH_MANAGEMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  CASH_MANAGEMENT_JOURNEY_CASH_MANAGEMENT_BASE_PATH,
} from '@backbase/cash-management-journey-ang';
import { APP_ARRANGEMENT_MANAGER_BASE_PATH, APP_CASH_MANAGEMENT_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [CashManagementJourneyModule.forRoot()],
  providers: [
    {
      provide: CashManagementConfigurationToken,
      useValue: {
        pageSize: 5,
      } as CashManagementConfiguration,
    },
    {
      provide: CASH_MANAGEMENT_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
    {
      provide: CASH_MANAGEMENT_JOURNEY_CASH_MANAGEMENT_BASE_PATH,
      useExisting: APP_CASH_MANAGEMENT_BASE_PATH,
    },
  ],
})
export class CashManagementJourneyBundleModule {}
