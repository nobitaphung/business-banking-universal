import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyPermissionCommunicationService } from '@backbase/company-permissions-journey-ang';

@Injectable({
  providedIn: 'root',
})
export class CompanyPermissionServiceAgreementCommunication implements CompanyPermissionCommunicationService {
  constructor(private router: Router, private activeRoute: ActivatedRoute) {}

  eventWithPayload(id: string): void {
    if (this.activeRoute.firstChild?.snapshot?.routeConfig?.path !== 'service-agreements') {
      this.router.navigate(['company-permissions', { serviceAgreementId: id }], {
        relativeTo: this.activeRoute.firstChild,
      });
    } else {
      this.router.navigate(['company-permissions', { serviceAgreementId: id }]);
    }
  }
}
