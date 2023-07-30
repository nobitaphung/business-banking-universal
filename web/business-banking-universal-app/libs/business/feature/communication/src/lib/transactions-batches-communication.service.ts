import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionsCommunicationService } from '@backbase/transactions-journey-ang';

@Injectable({
  providedIn: 'root',
})
export class TransactionsBatchesCommunicationService implements TransactionsCommunicationService {
  constructor(private readonly router: Router) {}

  navigateToBatchDetails(id: string): void {
    this.router.navigate(['batches/manage/details', { batchOrderId: id }]);
  }
}
