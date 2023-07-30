import { NgModule, Provider } from '@angular/core';
import {
  ActionsBusinessNotificationPreferencesJourneyConfiguration,
  ActionsBusinessNotificationPreferencesJourneyModule,
  ActionsBusinessNotificationPreferencesJourneyToken,
  ACTIONS_BUSINESS_NOTIFICATION_PREFERENCES_JOURNEY_ACTIONS_BASE_PATH,
  ACTIONS_BUSINESS_NOTIFICATION_PREFERENCES_JOURNEY_ENGAGEMENT_BASE_PATH,
} from '@backbase/actions-business-notification-preferences-journey-ang';
import { environment } from '../../environments/environment';
import { APP_ACTIONS_BASE_PATH, APP_ENGAGEMENT_BASE_PATH } from '../service-paths.module';

export const apiModeTypeGuard = (value: string | undefined) => {
  if (value === 'actions' || value === 'engagements') return value;
  return 'actions';
};

const BusinessActionsConfigProvider: Provider = {
  provide: ActionsBusinessNotificationPreferencesJourneyToken,
  useValue: {
    apiMode: apiModeTypeGuard(environment?.notificationPreferencesApiMode),
  } as ActionsBusinessNotificationPreferencesJourneyConfiguration,
};

@NgModule({
  imports: [ActionsBusinessNotificationPreferencesJourneyModule.forRoot()],
  providers: [
    BusinessActionsConfigProvider,
    {
      provide: ACTIONS_BUSINESS_NOTIFICATION_PREFERENCES_JOURNEY_ACTIONS_BASE_PATH,
      useExisting: APP_ACTIONS_BASE_PATH,
    },
    {
      provide: ACTIONS_BUSINESS_NOTIFICATION_PREFERENCES_JOURNEY_ENGAGEMENT_BASE_PATH,
      useExisting: APP_ENGAGEMENT_BASE_PATH,
    },
  ],
})
export class ActionsBusinessNotificationPreferencesJourneyBundleModule {}
