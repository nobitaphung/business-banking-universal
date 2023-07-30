import { NgModule } from '@angular/core';
import {
  AuditJourneyConfigurationToken,
  AuditJourneyModule,
  AUDIT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
  AUDIT_JOURNEY_AUDIT_BASE_PATH,
} from '@backbase/audit-journey-ang';
import { APP_ACCESS_CONTROL_BASE_PATH, APP_AUDIT_BASE_PATH } from '../service-paths.module';

@NgModule({
  imports: [AuditJourneyModule.forRoot()],
  providers: [
    {
      provide: AuditJourneyConfigurationToken,
      useValue: {
        deElevatedHeading: true,
      },
    },
    {
      provide: AUDIT_JOURNEY_ACCESS_CONTROL_BASE_PATH,
      useExisting: APP_ACCESS_CONTROL_BASE_PATH,
    },
    {
      provide: AUDIT_JOURNEY_AUDIT_BASE_PATH,
      useExisting: APP_AUDIT_BASE_PATH,
    },
  ],
})
export class AuditJourneyBundleModule {}
