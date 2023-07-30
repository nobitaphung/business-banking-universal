import { AuthService } from '@backbase/identity-auth';
import { OAuthService } from 'angular-oauth2-oidc';
import { ReplaySubject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  const getInstance = () => {
    const isAuthenticated$$ = new ReplaySubject<boolean>(1);
    const authService = <AuthService>{
      isAuthenticated$: isAuthenticated$$.asObservable(),
    };
    const oAuthService = jasmine.createSpyObj<OAuthService>('OAuthService', ['initLoginFlow']);
    const guard = new AuthGuard(authService, oAuthService);
    const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

    return { guard, authService, oAuthService, isAuthenticated$$, scheduler };
  };

  describe('#canLoad', () => {
    it('should return true when user is authenticated', () => {
      const { guard, scheduler, isAuthenticated$$ } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(true);
        expectObservable(guard.canLoad()).toBe('x', { x: true });
      });
    });

    it('should return false and calls initLoginFlow when user is not authenticated', () => {
      const { guard, scheduler, isAuthenticated$$, oAuthService } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(false);
        expectObservable(guard.canLoad()).toBe('x', { x: false });
      });
      expect(oAuthService.initLoginFlow).toHaveBeenCalledTimes(1);
    });
  });

  describe('#canActivate', () => {
    it('should return true when user is authenticated', () => {
      const { guard, scheduler, isAuthenticated$$ } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(true);
        expectObservable(guard.canActivate()).toBe('x', { x: true });
      });
    });

    it('should return false and calls initLoginFlow when user is not authenticated', () => {
      const { guard, scheduler, isAuthenticated$$, oAuthService } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(false);
        expectObservable(guard.canActivate()).toBe('x', { x: false });
      });
      expect(oAuthService.initLoginFlow).toHaveBeenCalledTimes(1);
    });
  });

  describe('#canActivateChild', () => {
    it('should return true when user is authenticated', () => {
      const { guard, scheduler, isAuthenticated$$ } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(true);
        expectObservable(guard.canActivateChild()).toBe('x', { x: true });
      });
    });

    it('should return false and calls initLoginFlow when user is not authenticated', () => {
      const { guard, scheduler, isAuthenticated$$, oAuthService } = getInstance();

      scheduler.run(({ expectObservable }) => {
        isAuthenticated$$.next(false);
        expectObservable(guard.canActivateChild()).toBe('x', { x: false });
      });
      expect(oAuthService.initLoginFlow).toHaveBeenCalledTimes(1);
    });
  });
});
