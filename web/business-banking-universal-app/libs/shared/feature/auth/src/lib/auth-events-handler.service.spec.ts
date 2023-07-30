import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { AuthEventsHandlerService } from './auth-events-handler.service';

describe('AuthEventsHandlerService', () => {
  let oAuthService: OAuthService;
  let service: AuthEventsHandlerService;
  let scheduler: TestScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should emit event:discovery_document_loaded', () => {
    const documentLoadedEvent = {
      events: of({
        type: 'discovery_document_loaded',
      }),
    };

    TestBed.overrideProvider(OAuthService, { useValue: documentLoadedEvent });

    service = TestBed.inject(AuthEventsHandlerService);

    scheduler.run(() => {
      service['documentLoaded'] = false;
      service['getEventsSubscription']();
      expect(service['documentLoaded']).toBe(true);
    });
  });

  it('should emit event:token_expires', () => {
    const tokenExpiresEvent = {
      refreshToken: () => 'refresh-token',
      events: of({
        type: 'token_expires',
      }),
    };

    TestBed.overrideProvider(OAuthService, { useValue: tokenExpiresEvent });

    service = TestBed.inject(AuthEventsHandlerService);
    service['documentLoaded'] = true;

    oAuthService = TestBed.inject(OAuthService);
    const refreshTokenSpy = spyOn(oAuthService, 'refreshToken');
    scheduler.run(() => {
      service['getEventsSubscription']();
      expect(refreshTokenSpy).toHaveBeenCalled();
    });
  });

  it('should emit event:session_terminated', () => {
    const sessionTerminatedEvent = {
      hasValidAccessToken: () => true,
      logOut: () => jasmine.createSpy(),
      events: of({
        type: 'session_terminated',
      }),
    };

    TestBed.overrideProvider(OAuthService, { useValue: sessionTerminatedEvent });

    service = TestBed.inject(AuthEventsHandlerService);
    service['documentLoaded'] = true;

    oAuthService = TestBed.inject(OAuthService);
    const handleTerminatedSessionSpy = spyOn(service, 'handleTerminatedSession').and.callThrough();
    const hasValidAccessTokenSpy = spyOn(oAuthService, 'hasValidAccessToken').and.returnValue(true);
    const logOutSpy = spyOn(oAuthService, 'logOut');
    scheduler.run(() => {
      service['getEventsSubscription']();
      expect(handleTerminatedSessionSpy).toHaveBeenCalled();
      expect(hasValidAccessTokenSpy).toHaveBeenCalled();
      expect(logOutSpy).toHaveBeenCalled();
    });
  });

  it('should emit event:invalid_nonce_in_state', () => {
    const sessionTerminatedEvent = {
      initLoginFlow: () => Promise.resolve(),
      events: of({
        type: 'invalid_nonce_in_state',
      }),
    };

    TestBed.overrideProvider(OAuthService, { useValue: sessionTerminatedEvent });

    service = TestBed.inject(AuthEventsHandlerService);
    service['documentLoaded'] = true;

    oAuthService = TestBed.inject(OAuthService);
    const initLoginFlowSpy = spyOn(oAuthService, 'initLoginFlow');
    scheduler.run(() => {
      service['getEventsSubscription']();
      expect(initLoginFlowSpy).toHaveBeenCalled();
    });
  });

  it('should unsubscribe', () => {
    const sessionTerminatedEvent = {
      initLoginFlow: () => Promise.resolve(),
      events: of({
        type: 'invalid_nonce_in_state',
      }),
    };

    TestBed.overrideProvider(OAuthService, { useValue: sessionTerminatedEvent });
    service = TestBed.inject(AuthEventsHandlerService);
    const unsubscribeSpy = spyOn(service['eventsSubscription'], 'unsubscribe');
    service.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
