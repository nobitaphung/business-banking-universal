import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivityMonitorService } from '@backbase/identity-auth';
import { OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { Observable, of } from 'rxjs';

import { CustomSessionTimeoutService } from './session-timeout.service';
import createSpyObj = jasmine.createSpyObj;
import Spy = jasmine.Spy;

describe('CustomSessionTimeoutService', () => {
  let service: CustomSessionTimeoutService;
  let injectService: OAuthService;
  let ngZone: NgZone;
  let activityMonitorServiceSpy;

  const countdownSpy = createSpyObj('countdown', ['start', 'end', 'reset', 'tick'], {
    maxInactivityDuration: 300,
    countdownDuration: 60,
  });

  beforeEach(() => {
    activityMonitorServiceSpy = createSpyObj('ActivityMonitorService', ['start', 'stop'], {
      events: of({ type: 'start' }),
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, OAuthModule.forRoot()],
      providers: [OAuthService, { provide: ActivityMonitorService, useValue: activityMonitorServiceSpy }],
    });
    service = TestBed.inject(CustomSessionTimeoutService);
    injectService = TestBed.inject(OAuthService);
    ngZone = TestBed.inject(NgZone);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('logout', () => {
    const logout = spyOn(injectService, 'logOut');
    service.logout();
    expect(logout).toHaveBeenCalled();
  });

  it('registerCountdown', () => {
    const registerCountdown = spyOn(ngZone, 'runOutsideAngular');
    service.registerCountdown(countdownSpy);
    expect(registerCountdown).toHaveBeenCalled();
  });

  describe('should register countdown', () => {
    it('then start activity monitor', () => {
      service.registerCountdown(countdownSpy);
      expect(activityMonitorServiceSpy.start).toHaveBeenCalled();
    });

    it('then get "start" event from activity monitor', () => {
      service.registerCountdown(countdownSpy);

      expect(countdownSpy.start).toHaveBeenCalled();
    });

    it('then get "end" event from activity monitor', () => {
      (
        Object.getOwnPropertyDescriptor(activityMonitorServiceSpy, 'events')?.get as Spy<() => Observable<unknown>>
      ).and.returnValue(of({ type: 'end' }));

      service.registerCountdown(countdownSpy);

      expect(countdownSpy.end).toHaveBeenCalled();
    });

    it('then get "reset" event from activity monitor', () => {
      (
        Object.getOwnPropertyDescriptor(activityMonitorServiceSpy, 'events')?.get as Spy<() => Observable<unknown>>
      ).and.returnValue(of({ type: 'reset' }));

      service.registerCountdown(countdownSpy);

      expect(countdownSpy.reset).toHaveBeenCalled();
    });

    it('then get "tick" event from activity monitor', () => {
      (
        Object.getOwnPropertyDescriptor(activityMonitorServiceSpy, 'events')?.get as Spy<() => Observable<unknown>>
      ).and.returnValue(of({ type: 'tick', remaining: 10 }));

      service.registerCountdown(countdownSpy);

      expect(countdownSpy.tick).toHaveBeenCalledWith(10);
    });
  });

  it('logout', () => {
    const logOut = spyOn(injectService, 'logOut');
    service.logout();
    expect(logOut).toHaveBeenCalled();
  });
});
