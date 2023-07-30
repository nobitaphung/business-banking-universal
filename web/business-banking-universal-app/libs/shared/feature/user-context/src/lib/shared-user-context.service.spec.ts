import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';

import { SharedUserContextService, UserContextConfigurationToken } from './shared-user-context.service';

describe('SharedUserContextService', () => {
  let service: SharedUserContextService;
  const routerMock = { navigateByUrl: jasmine.createSpy() } as Partial<Router>;
  const oAuthServiceMock = {
    logOut: jasmine.createSpy(),
  } as Partial<OAuthService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SharedUserContextService,
        { provide: UserContextConfigurationToken, useValue: 'test' },
        { provide: Router, useValue: routerMock },
        { provide: OAuthService, useValue: oAuthServiceMock },
      ],
    });
    service = TestBed.inject(SharedUserContextService);
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get redirect page', () => {
    service.openLandingPage();
    expect(routerMock.navigateByUrl).toHaveBeenCalled();
  });

  it('should logout', () => {
    service.logout();
    expect(oAuthServiceMock.logOut).toHaveBeenCalled();
  });
});
