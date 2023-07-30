import { Component } from '@angular/core';
import { ConditionsService } from '@backbase/foundation-ang/entitlements';
import { environment } from '../../../environments/environment';
import { from, concatMap, map, of, reduce, combineLatest, tap } from 'rxjs';
import { canViewManageNotifications, PERMISSIONS } from '../../auth/permissions';

@Component({
  selector: 'bb-self-service-view',
  templateUrl: './self-service-view.component.html',
})
export class SelfServiceViewComponent {
  readonly permissions = PERMISSIONS;

  private readonly tabs = [
    {
      title: $localize`:Tab label for contact details@@bb-identity-self-service-journey.tab-contact-details:Contact Details`,
      route: 'contact-details',
    },
    {
      title: $localize`:Tab label for changing user preferences@@bb-identity-self-service-journey.tab-localization:Localization`,
      route: 'user-localization',
    },
    {
      title: $localize`:Tab label for login and security settings@@bb-identity-self-service-journey.tab-login-security:Login & Security`,
      route: 'login-security',
    },
    {
      title: $localize`:Tab label for managing devices@@bb-identity-self-service-journey.tab-devices:Devices`,
      route: 'devices',
    },
    {
      title: $localize`:Tab label for managing notification@@bb-identity-self-service-journey.tab-notifications:Notifications`,
      route: 'manage-notifications',
      canView: environment.notificationPreferencesApiMode !== 'none',
      entitlements:
        environment?.notificationPreferencesApiMode === 'engagements' ? canViewManageNotifications : undefined,
    },
  ];

  readonly tabs$ = from(this.tabs).pipe(
    concatMap((item) => {
      const canView$ = item.canView !== undefined ? of(item.canView) : of(true);
      const entitlements$ = item.entitlements
        ? from(this.conditionService.resolveEntitlements(item.entitlements))
        : of(true);

      return combineLatest([canView$, entitlements$]).pipe(
        map(([canView, entitlements]) => ({ hasPermissions: canView && entitlements, ...item })),
      );
    }),
    reduce((acc, { hasPermissions, ...item }) => {
      if (hasPermissions) {
        acc.push(item);
      }

      return acc;
    }, [] as Record<'title' | 'route', string>[]),
  );

  constructor(private conditionService: ConditionsService) {}
}
