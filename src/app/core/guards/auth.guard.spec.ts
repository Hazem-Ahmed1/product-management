import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter } from '@angular/router';
import { authGuard, publicGuard } from './auth.guard';
import { AuthService } from '../../services/auth.service';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';

/** Helper to run a CanActivateFn in the TestBed context */
function runGuard(guard: CanActivateFn, isAuthenticated: boolean) {
  const mockAuthService = {
    isAuthenticated: signal(isAuthenticated),
  };

  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
  });

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => guard(route, state));
}

describe('authGuard', () => {
  it('should allow access when authenticated', () => {
    const result = runGuard(authGuard, true);
    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    const result = runGuard(authGuard, false) as UrlTree;
    expect(result.toString()).toBe('/login');
  });
});

describe('publicGuard', () => {
  it('should allow guest users (unauthenticated) to access public routes like /login', () => {
    const result = runGuard(publicGuard, false);
    expect(result).toBe(true);
  });

  it('should redirect already logged-in users away from public routes to the admin dashboard', () => {
    const result = runGuard(publicGuard, true) as UrlTree;
    expect(result.toString()).toBe('/admin/products');
  });
});
