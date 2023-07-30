import { Component } from '@angular/core';
import { ConditionsService } from '@backbase/foundation-ang/entitlements';
import { combineLatest, from, iif, map, mergeMap, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { canViewManageNotifications } from '../auth/permissions';

@Component({
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private readonly displayNotificationPreferencesByEnv$$ = of(environment?.notificationPreferencesApiMode !== 'none');

  private readonly notificationPreferencesByEntitlements$$ = from(
    this.conditionService.resolveEntitlements(canViewManageNotifications),
  );

  readonly displayNotificationSettingsButton$: Observable<boolean> = of(
    environment?.notificationPreferencesApiMode,
  ).pipe(
    mergeMap((value) =>
      iif(
        () => value !== 'engagements',
        this.displayNotificationPreferencesByEnv$$,
        combineLatest([this.displayNotificationPreferencesByEnv$$, this.notificationPreferencesByEntitlements$$]).pipe(
          map(([displayByEnv, displayByEntitlements]) => displayByEnv && displayByEntitlements),
        ) as Observable<boolean>,
      ),
    ),
  );

  constructor(private conditionService: ConditionsService) {}
}
