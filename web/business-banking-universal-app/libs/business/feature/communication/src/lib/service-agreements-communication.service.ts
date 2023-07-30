import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceAgreementCommunicationService } from '@backbase/service-agreements-journey-ang';

@Injectable({
  providedIn: 'root',
})
export class ServiceAgreementCompanyPermissionCommunication implements ServiceAgreementCommunicationService {
  constructor(private router: Router, private activeRoute: ActivatedRoute) {}

  eventWithPayload(id: string): void {
    if (this.activeRoute.firstChild?.snapshot?.routeConfig?.path === 'service-agreements') {
      this.router.navigate(['service-agreements/service-agreement-detail', { serviceAgreement: id }], {
        relativeTo: this.activeRoute.firstChild,
      });
    } else {
      this.router.navigate(['service-agreements/service-agreement-detail', { serviceAgreement: id }]);
    }
  }
}
