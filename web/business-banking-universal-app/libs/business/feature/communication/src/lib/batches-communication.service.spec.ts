import { TestBed } from '@angular/core/testing';
import { Router, RouterState } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BatchCommunicationState, BatchJourneyComponentApi } from '@backbase/batch-journey-ang';
import { BatchTemplatesJourneyComponentApi } from '@backbase/batch-templates-journey-ang';
import { of } from 'rxjs';
import { BatchCommunicationService } from './batches-communication.service';

describe('BatchCommunicationService', () => {
  let service: BatchCommunicationService;
  let navigateSpy;

  const routerStub: Pick<Router, 'navigate' | 'routerState'> = {
    navigate: () => {
      return Promise.resolve(true);
    },
    routerState: {
      snapshot: {},
    } as RouterState,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: Router, useValue: routerStub }],
    });

    service = TestBed.inject(BatchCommunicationService);
    const api = {
      uploadBatchOrder: () => {
        // do nothing
      },
      applyBatchOrderTemplate: () => {
        // do nothing
      },
      createBatchOrder: () => {
        // do nothing
      },
      gotoBatchOrdersList: () => {
        // do nothing
      },
      seeBatchUploadDetails: () => {
        // do nothing
      },
    } as unknown as BatchJourneyComponentApi;
    const templateApi = {
      createTemplate: () => {
        // do nothing
      },
    } as BatchTemplatesJourneyComponentApi;
    service.init(api);
    service.initializeBatchTemplates(templateApi);
    navigateSpy = spyOn(routerStub, 'navigate').and.returnValue(Promise.resolve(true));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('eventWithPayload', () => {
    const payload = {
      batchTemplateApplyOutput: {},
    } as BatchCommunicationState;
    service.eventWithPayload(payload);
    expect(navigateSpy).toHaveBeenCalledWith(['batches']);
  });

  it('uploadBatchOrder', () => {
    service.uploadBatchOrder('');
    expect(navigateSpy).toHaveBeenCalledWith(['batches']);
  });

  it('createBatchOrder', () => {
    service.createBatchOrder('');
    expect(navigateSpy).toHaveBeenCalledWith(['batches']);
  });

  it('gotoBatchOrdersList', () => {
    service.gotoBatchOrdersList();
    expect(navigateSpy).toHaveBeenCalledWith(['batches']);
  });

  it('seeBatchUploadDetails', () => {
    service.seeBatchUploadDetails('fakeId');
    expect(navigateSpy).toHaveBeenCalledWith(['batches']);
  });

  it('createBatchTemplate', () => {
    service.createBatchTemplate('fakeType');
    expect(navigateSpy).toHaveBeenCalledWith(['templates/batches']);
  });
});
