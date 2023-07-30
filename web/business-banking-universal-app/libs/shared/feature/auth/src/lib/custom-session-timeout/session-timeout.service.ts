import { Injectable, NgZone } from '@angular/core';
import { Countdown } from './session-timeout.interface';
import { ActivityEvent, ActivityMonitorService } from '@backbase/identity-auth';
import { OAuthService } from 'angular-oauth2-oidc';

/**
 * CustomSessionTimeoutService used to call logout and session services for session management.
 */
@Injectable({
  providedIn: 'root',
})
export class CustomSessionTimeoutService {
  /**
   * CustomSessionTimeoutService constructor
   * @param activityMonitorService Auth service used to monitor user activity.
   * @param ngZone Service for executing work inside or outside of the Angular zone.
   * @param oAuthService angular-oauth2-oidc service.
   */
  constructor(
    private activityMonitorService: ActivityMonitorService,
    private readonly ngZone: NgZone,
    private oAuthService: OAuthService,
  ) {}

  /**
   * Calls the oAuth logout service to log the user out and revoke a current token.
   * @returns a promise from the logout service.
   */
  logout() {
    return this.oAuthService.logOut();
  }

  /**
   * Calls the activity monitor service to register a countdown object for managing session.
   * @param countdown a `Countdown` object that allows a controller to register functions to auth session actions.
   */
  registerCountdown(countdown: Countdown) {
    this.ngZone.runOutsideAngular(() => {
      this.activityMonitorService.events.subscribe((event: ActivityEvent) => {
        switch (event.type) {
          case 'start':
            countdown.start();
            break;
          case 'tick':
            countdown.tick(event.remaining);
            break;
          case 'end':
            countdown.end();
            break;
          case 'reset':
            countdown.reset();
            break;
        }
      });

      this.activityMonitorService.start({
        maxInactivityDuration: countdown.maxInactivityDuration,
        countdownDuration: countdown.countdownDuration,
      });
    });
  }
}
