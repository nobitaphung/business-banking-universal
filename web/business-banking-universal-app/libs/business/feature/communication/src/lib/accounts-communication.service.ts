import { ExistingProvider, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AccountsCommunicationService as AccountsCommunicationServiceAPI } from '@backbase/accounts-journey-ang';

@Injectable({
  providedIn: 'root',
})
export class AccountsCommunicationService implements AccountsCommunicationServiceAPI {
  constructor(private readonly router: Router) {}

  navigateToBatchDetails(id: string) {
    this.router.navigate(['batches/manage/details', { batchOrderId: id }]);
  }

  navigateToStatements(id: string) {
    console.warn('Navigation to Statements is not configured', id);
  }

  navigateToPayments(id: string) {
    console.warn('Navigation to Payments is not configured', id);
  }
}

export const AccountsCommunicationServiceProvider: ExistingProvider = {
  provide: AccountsCommunicationServiceAPI,
  useExisting: AccountsCommunicationService,
};
