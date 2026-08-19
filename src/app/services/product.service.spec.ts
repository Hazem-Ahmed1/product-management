import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ProductService } from './product.service';
import { errorInterceptor } from '../core/interceptors/error.interceptor';
import { environment } from '../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct = {
    id: 1,
    name: 'Wireless Keyboard',
    slug: 'wireless-keyboard',
    sku: 'WK-001',
    description: 'A great keyboard',
    stock: 25,
    price: 79.99,
    currency: 'USD',
    thumbnail_url: null,
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: null,
  };

  const mockPaginatedResponse = {
    data: [mockProduct],
    meta: {
      current_page: 1,
      from: 1,
      last_page: 3,
      path: `${environment.apiBaseUrl}/products`,
      per_page: 15,
      to: 15,
      total: 42,
    },
    links: { first: null, last: null, prev: null, next: null },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        ProductService,
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET with correct page and per_page params', () => {
      service.getAll({ page: 1, per_page: 15 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${environment.apiBaseUrl}/products`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('per_page')).toBe('15');
      req.flush(mockPaginatedResponse);
    });

    it('should include search param when provided', () => {
      service.getAll({ page: 1, per_page: 15, search: 'keyboard' }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiBaseUrl}/products`,
      );
      expect(req.request.params.get('search')).toBe('keyboard');
      req.flush(mockPaginatedResponse);
    });

    it('should include is_active param when filtering active', () => {
      service.getAll({ page: 1, per_page: 15, is_active: true }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiBaseUrl}/products`,
      );
      expect(req.request.params.get('is_active')).toBe('true');
      req.flush(mockPaginatedResponse);
    });

    it('should NOT include is_active param when undefined', () => {
      service.getAll({ page: 1, per_page: 15 }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${environment.apiBaseUrl}/products`,
      );
      expect(req.request.params.has('is_active')).toBe(false);
      req.flush(mockPaginatedResponse);
    });

    it('should return mapped paginated response', () => {
      service.getAll({ page: 1, per_page: 15 }).subscribe((res) => {
        expect(res.data.length).toBe(1);
        expect(res.meta.total).toBe(42);
      });

      httpMock
        .expectOne((r) => r.url === `${environment.apiBaseUrl}/products`)
        .flush(mockPaginatedResponse);
    });
  });

  describe('getOne()', () => {
    it('should GET a single product by id', () => {
      service.getOne(1).subscribe((res) => {
        expect(res.data.name).toBe('Wireless Keyboard');
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/products/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProduct });
    });
  });
});
