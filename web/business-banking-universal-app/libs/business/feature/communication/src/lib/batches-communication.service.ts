import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BatchJourneyCommunicationService, BatchJourneyComponentApi } from '@backbase/batch-journey-ang';
import {
  BatchCommunicationState,
  BatchTemplateApplyOutput,
  BatchTemplatesJourneyCommunicationService,
  BatchTemplatesJourneyComponentApi,
} from '@backbase/batch-templates-journey-ang';

@Injectable({
  providedIn: 'root',
})
export class BatchCommunicationService
  implements BatchTemplatesJourneyCommunicationService, BatchJourneyCommunicationService
{
  private api?: BatchJourneyComponentApi;
  private batchTemplatesApi?: BatchTemplatesJourneyComponentApi;

  constructor(private router: Router) {}

  init(api: BatchJourneyComponentApi): void {
    this.api = api;
  }

  initializeBatchTemplates(api: BatchTemplatesJourneyComponentApi): void {
    this.batchTemplatesApi = api;
  }

  eventWithPayload(payload: BatchCommunicationState): void {
    /* istanbul ignore else */
    if (payload.batchTemplateApplyOutput) {
      this.applyBatchOrderTemplate(payload.batchTemplateApplyOutput || ({} as BatchTemplateApplyOutput));
    }
  }

  applyBatchOrderTemplate(batchOrderTemplateData: BatchTemplateApplyOutput) {
    const url = this.router.routerState.snapshot.url;

    this.router.navigate(['batches']).then(() => {
      this.api?.applyBatchOrderTemplate(batchOrderTemplateData, { url });
    });
  }

  uploadBatchOrder(batchOrderType: string): void {
    const url = this.router.routerState.snapshot.url;

    this.router.navigate(['batches']).then(() => {
      this.api?.uploadBatchOrder(batchOrderType, { url });
    });
  }

  createBatchTemplate(batchOrderType: string): void {
    const url = this.router.routerState.snapshot.url;

    this.router.navigate(['templates/batches']).then(() => {
      this.batchTemplatesApi?.createTemplate(batchOrderType, { url });
    });
  }

  createBatchOrder(batchOrderType: string): void {
    const url = this.router.routerState.snapshot.url;

    this.router.navigate(['batches']).then(() => {
      this.api?.createBatchOrder(batchOrderType, { url });
    });
  }

  gotoBatchOrdersList(): void {
    this.router.navigate(['batches']).then(() => {
      this.api?.gotoBatchOrdersList();
    });
  }

  seeBatchUploadDetails(batchUploadId: string): void {
    this.router.navigate(['batches']).then(() => {
      this.api?.seeBatchUploadDetails(batchUploadId);
    });
  }
}
