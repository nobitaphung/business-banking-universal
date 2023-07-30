import { HttpClient, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthInterceptor } from './auth.interceptor';
import * as AuthUtil from './auth.utils';

class OAuthServiceMock {
  refreshToken: () => 'refreshToken';
}

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {
          provide: OAuthService,
          useClass: OAuthServiceMock,
        },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should set authorisation token in the header', () => {
    httpClient.get('api/access-control').subscribe();
    const request = httpMock.expectOne('api/access-control');
    request.flush([]);

    expect(request.request.headers.get('Authorization')).toBeDefined();
  });

  it('should handle invalid authorisation token', () => {
    const isInvalidToken401Spy = spyOn(AuthUtil, 'isInvalidToken401').and.callThrough();

    httpClient.get('api/access-control').subscribe(
      () => null,
      (error) => {
        expect(error instanceof HttpErrorResponse).toBe(true);
        expect(error.status).toBe(401);
      },
    );

    const request = httpMock.expectOne('api/access-control');
    request.flush('error', { status: 401, statusText: 'unauthorised' });

    expect(isInvalidToken401Spy).toHaveBeenCalled();
    expect(request.request.headers.get('invalid_token')).toBeDefined();
    expect(request.request.headers.get('Authorization')).toBeDefined();
  });
});
