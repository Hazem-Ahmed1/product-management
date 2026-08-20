import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  Product,
  ProductFilters,
  PaginatedResponse,
  CreateProductRequest,
} from '../models/product.model';
import { ProductValidationError } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/products`;

  /** GET /api/products — server-side paginated, filtered, searched */
  getAll(filters: ProductFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('per_page', filters.per_page);

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.is_active !== undefined) {
      params = params.set('is_active', String(filters.is_active));
    }

    return this.http
      .get<PaginatedResponse<Product>>(this.base, { params })
      .pipe(catchError((err: HttpErrorResponse | Error) => this.handleError(err)));
  }

  /** GET /api/products/:id — single product resource */
  getOne(id: number): Observable<{ data: Product }> {
    return this.http
      .get<{ data: Product }>(`${this.base}/${id}`)
      .pipe(catchError((err: HttpErrorResponse | Error) => this.handleError(err)));
  }

  /** POST /api/products — throws ProductValidationError on 422 */
  create(payload: CreateProductRequest): Observable<{ data: Product }> {
    return this.http
      .post<{ data: Product }>(this.base, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 422) {
            const body = err.error as {
              message?: string;
              errors?: Record<string, string[]>;
            };
            return throwError(
              () =>
                new ProductValidationError(
                  body?.message ?? 'Validation error.',
                  body?.errors ?? {},
                ),
            );
          }
          return this.handleError(err);
        }),
      );
  }

  /** PUT /api/products/:id — throws ProductValidationError on 422 */
  update(id: number, payload: CreateProductRequest): Observable<{ data: Product }> {
    return this.http
      .put<{ data: Product }>(`${this.base}/${id}`, payload)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 422) {
            const body = err.error as {
              message?: string;
              errors?: Record<string, string[]>;
            };
            return throwError(
              () =>
                new ProductValidationError(
                  body?.message ?? 'Validation error.',
                  body?.errors ?? {},
                ),
            );
          }
          return this.handleError(err);
        }),
      );
  }

  /** DELETE /api/products/:id — deletes a product */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/${id}`)
      .pipe(catchError((err: HttpErrorResponse | Error) => this.handleError(err)));
  }


  private handleError(err: HttpErrorResponse | Error): Observable<never> {
    if (err instanceof Error) {
      return throwError(() => err);
    }
    if (err.status === 404) {
      return throwError(() => new Error('Product not found.'));
    }
    if (err.status === 422) {
      const body = err.error as { message?: string };
      return throwError(() => new Error(body?.message ?? 'Validation error.'));
    }

    return throwError(() => new Error('An unexpected error occurred.'));
  }
}
