import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AccountsCommunicationService } from './accounts-communication.service';

describe('AccountsCommunicationService', () => {
  let service: AccountsCommunicationService;
  let routerStub: Router;

  beforeEach(() => {
    routerStub = {
      navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
    } as Partial<Router> as Router;
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: Router, useValue: routerStub }],
    });
    service = TestBed.inject(AccountsCommunicationService);
  });

  it('navigateToBatchDetails', () => {
    const batchOrderId = 'id12345';
    service.navigateToBatchDetails(batchOrderId);
    expect(routerStub.navigate).toHaveBeenCalledWith(['batches/manage/details', { batchOrderId }]);
  });
  it('navigateToStatements', () => {
    const accountId = 'id12345';
    service.navigateToStatements(accountId);
    expect(service).toBeDefined();
  });
  it('navigateToPayments', () => {
    const accountId = 'id12345';
    service.navigateToPayments(accountId);
    expect(service).toBeDefined();
  });
});
