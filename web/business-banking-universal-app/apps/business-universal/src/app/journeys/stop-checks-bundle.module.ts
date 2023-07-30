import { NgModule } from '@angular/core';
import {
  StopChecksJourneyModule,
  STOP_CHECKS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
  STOP_CHECKS_JOURNEY_PAYMENT_ORDER_BASE_PATH,
  STOP_CHECKS_JOURNEY_STOP_CHECKS_BASE_PATH,
} from '@backbase/stop-checks-journey-ang';
import {
  APP_ARRANGEMENT_MANAGER_BASE_PATH,
  APP_PAYMENT_ORDER_BASE_PATH,
  APP_STOP_CHECKS_BASE_PATH,
} from '../service-paths.module';

@NgModule({
  imports: [StopChecksJourneyModule.forRoot()],
  providers: [
    {
      provide: STOP_CHECKS_JOURNEY_PAYMENT_ORDER_BASE_PATH,
      useExisting: APP_PAYMENT_ORDER_BASE_PATH,
    },
    {
      provide: STOP_CHECKS_JOURNEY_STOP_CHECKS_BASE_PATH,
      useExisting: APP_STOP_CHECKS_BASE_PATH,
    },
    {
      provide: STOP_CHECKS_JOURNEY_ARRANGEMENT_MANAGER_BASE_PATH,
      useExisting: APP_ARRANGEMENT_MANAGER_BASE_PATH,
    },
  ],
})
export class StopChecksJourneyBundleModule {}
