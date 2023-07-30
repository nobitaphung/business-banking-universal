import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ImpersonationModule } from '@backbase/identity-auth/impersonation';
import {
  NotificationsBadgeModule,
  NotificationsCommunicationService,
  NotificationsPopupsModule,
} from '@backbase/notifications-ang';
import { ProgressTrackerModule } from '@backbase/ui-ang/progress-tracker';
import { ButtonModule } from '@backbase/ui-ang/button';
import { IconModule } from '@backbase/ui-ang/icon';
import { LayoutModule } from '@backbase/ui-ang/layout';
import { LogoModule } from '@backbase/ui-ang/logo';
import { UserContextMenuWidgetModule } from '@backbase/user-context-menu-widget-ang';
import { BusinessLayoutComponent } from './business-layout.component';
import { TopBarMenuComponent } from './top-bar-menu/top-bar-menu.component';

@NgModule({
  declarations: [BusinessLayoutComponent, TopBarMenuComponent],
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    IconModule,
    UserContextMenuWidgetModule,
    LogoModule,
    LayoutModule,
    ProgressTrackerModule,
    NotificationsBadgeModule,
    NotificationsPopupsModule,
    ImpersonationModule,
  ],
  exports: [
    BusinessLayoutComponent,
    TopBarMenuComponent,
    LayoutModule,
    NotificationsBadgeModule,
    NotificationsPopupsModule,
  ],
})
export class BusinessLayoutModule {
  static forRoot(
    notificationServiceImplementation: new (router: Router) => NotificationsCommunicationService,
  ): ModuleWithProviders<BusinessLayoutModule> {
    return {
      ngModule: BusinessLayoutModule,
      providers: [
        {
          provide: NotificationsCommunicationService,
          useExisting: notificationServiceImplementation,
        },
      ],
    };
  }
}
