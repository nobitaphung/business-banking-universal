import { NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import {
  IdentitySelfServiceJourneyConfiguration,
  IdentitySelfServiceJourneyConfigurationToken,
  IdentitySelfServiceJourneyModule,
  UserLocalizationChangeLanguageViewComponent,
  UserLocalizationCommunicationsViewComponent,
  UserLocalizationComponent,
  deviceManagementDefaultRoute,
  userProfileDefaultRoute,
  loginSecurityDefaultRoute,
} from '@backbase/identity-self-service-journey-ang';
import { SelfServiceViewComponent } from './self-service-view.component';
import { EntitlementsGuard } from '@backbase/foundation-ang/entitlements';
import { environment } from '../../../environments/environment';
import { canViewManageNotifications } from '../../auth/permissions';

export const defaultRoute: Route = {
  path: '',
  component: SelfServiceViewComponent,
  children: [
    { path: '', redirectTo: 'contact-details', pathMatch: 'full' },
    {
      path: 'contact-details',
      data: {
        title: $localize`:Tab label for contact details@@bb-identity-self-service-journey.tab-contact-details:Contact Details`,
      },
      children: [userProfileDefaultRoute],
    },
    {
      path: 'user-localization',
      data: {
        title: $localize`:Tab label for changing user preferences@@bb-identity-self-service-journey.tab-localization:Localization`,
      },
      component: UserLocalizationComponent,
      children: [
        { path: '', redirectTo: 'communications', pathMatch: 'full' },
        {
          path: 'communications',
          data: { changeLanguagePath: '/my-profile/user-localization/change-language' },
          component: UserLocalizationCommunicationsViewComponent,
        },
        {
          path: 'change-language',
          data: { communicationsPath: '/my-profile/user-localization/communications' },
          component: UserLocalizationChangeLanguageViewComponent,
        },
      ],
    },
    {
      path: 'login-security',
      data: {
        title: $localize`:Tab label for login and security settings@@bb-identity-self-service-journey.tab-login-security:Login & Security`,
      },
      children: [loginSecurityDefaultRoute],
    },
    {
      path: 'devices',
      data: { title: $localize`:Tab label for managing devices@@bb-identity-self-service-journey.tab-devices:Devices` },
      children: [deviceManagementDefaultRoute],
    },
    {
      path: 'manage-notifications',
      data: {
        title: $localize`:Tab label for managing notification@@bb-identity-self-service-journey.tab-notifications:Notifications`,
        entitlements:
          environment?.notificationPreferencesApiMode === 'engagements' ? canViewManageNotifications : undefined,
      },
      loadChildren: () =>
        import('../notifications-preferences-bundle.module').then(
          (m) => m.ActionsBusinessNotificationPreferencesJourneyBundleModule,
        ),
    },
  ],
  canActivateChild: [EntitlementsGuard],
};

const selfServiceConfigProvider: Provider = {
  provide: IdentitySelfServiceJourneyConfigurationToken,
  useValue: {
    userManageProfile: {
      maxEmailAddresses: 2,
      maxPhoneNumbers: 3,
      maxPostalAddresses: 1,
    },
  } as Partial<IdentitySelfServiceJourneyConfiguration>,
};

@NgModule({
  declarations: [SelfServiceViewComponent],
  imports: [CommonModule, IdentitySelfServiceJourneyModule.forRoot({ route: defaultRoute })],
  providers: [selfServiceConfigProvider],
})
export class SelfServiceJourneyBundleModule {}
