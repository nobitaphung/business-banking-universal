import { BusinessNotificationPreferencesApiMode } from '@backbase/actions-business-notification-preferences-journey-ang';

export interface Environment {
  production: boolean;
  animation: boolean;
  googleApiKey: string;
  landingPageUrl: string;
  baseHref: string;
  apiRoot: string;
  localize?: boolean;
  calendarVersion?: string;
  appVersion?: string;
  notificationPreferencesApiMode?: BusinessNotificationPreferencesApiMode | 'none';
}
