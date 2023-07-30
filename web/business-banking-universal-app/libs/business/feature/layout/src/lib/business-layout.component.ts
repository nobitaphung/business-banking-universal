import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@backbase/ui-ang/layout';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'bb-business-layout',
  templateUrl: './business-layout.component.html',
})
export class BusinessLayoutComponent {
  readonly notificationsAllowedRoutes =
    'conversation-view, arrangement-view, transaction-view, party-view, party-approve-view, payment-view, payment-approve-view, payments-list-view, audit-download-view, account-statements-archive-download-view';

  @Input() displayNotificationSettingsButton!: boolean;

  constructor(
    public readonly layoutService: LayoutService,
    private readonly router: Router,
    private readonly oAuthService: OAuthService,
  ) {}

  openNotificationSettings() {
    this.router.navigate(['self-service/product-list/manage-notifications']);
  }

  logout() {
    this.oAuthService.logOut();
  }
}
