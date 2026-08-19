import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 0) {
          return throwError(
            () => new Error('Cannot reach the server. Check your connection.'),
          );
        }

        if (err.status >= 500) {
          return throwError(
            () =>
              new Error(
                'The service is temporarily unavailable. Please try again shortly.',
              ),
          );
        }
      }
      return throwError(() => err);
    }),
  );
