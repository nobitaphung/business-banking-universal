import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import * as AuthUtils from './auth.utils';

describe('Auth utils', () => {
  it('should check for invalid token', () => {
    const error = new HttpErrorResponse({
      status: 503,
      statusText: 'Service Unavailable',
      url: '',
    });
    const response = AuthUtils.isInvalidToken401(error);
    expect(response).toBe(false);
    expect(error.status).toBe(503);
    expect(error.headers).toBeDefined();
  });

  it('should return header value from error response', () => {
    const headers = new HttpHeaders().set('www-authenticate', 'Basic');
    const value = AuthUtils.getAuthenticationError(headers);
    expect(value).toBeUndefined();
  });
});
