import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('should set token in memory after successful login', () => {
    const mockRes = {
      message: 'User logged in successfully!',
      token: 'test-token-123',
      user: { id: 1, name: 'Jane', email: 'jane@example.com' },
    };

    service.login({ email: 'jane@example.com', password: 'secret123' }).subscribe((res) => {
      expect(res.token).toBe('test-token-123');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockRes);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token()).toBe('test-token-123');
  });

  it('should NOT write token to localStorage after login', () => {
    const mockRes = {
      message: 'ok',
      token: 'secret-token',
      user: { id: 1, name: 'Jane', email: 'jane@example.com' },
    };

    service.login({ email: 'jane@example.com', password: 'pass' }).subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(mockRes);

    expect(localStorage.getItem('shop_admin_token')).toBeNull();
    expect(localStorage.getItem('shop_admin_user')).toBeNull();
  });

  it('should clear token and user on logout', () => {
    const mockRes = { message: 'ok', token: 'tok', user: { id: 1 } };
    service.login({ email: 'a@b.com', password: 'pass' }).subscribe();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`).flush(mockRes);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('should return error observable on 404', () => {
    service.login({ email: 'bad@x.com', password: 'wrong' }).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('No account found');
      },
    });

    httpMock
      .expectOne(`${environment.apiBaseUrl}/auth/login`)
      .flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
  });
});
