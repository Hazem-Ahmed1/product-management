# 🛒 ShopAdmin — Angular Product Management

A full-featured product management SPA built with **Angular 21**, demonstrating modern reactive patterns, clean architecture, and a polished admin/customer dual-view experience.

> **Live Demo:** [https://hazem-ahmed1.github.io/product-management/](https://hazem-ahmed1.github.io/product-management/)

---

## 📸 Screenshots

| Login | Admin Dashboard |
|:---:|:---:|
| ![Login Page](docs/images/Login%20Page.png) | ![Admin Products Page](docs/images/Admin%20Products%20Page.png) |

| Create Product | Edit Product |
|:---:|:---:|
| ![Create Product Page](docs/images/Create%20Product%20Page.png) | ![Edit Product Page](docs/images/Edit%20Product%20Page.png) |

| Admin Product Details | User Catalog |
|:---:|:---:|
| ![View Admin Product](docs/images/View%20Admin%20Product.png) | ![User View Products](docs/images/User%20View%20Products.png) |

| User Product Details | Server Down State |
|:---:|:---:|
| ![User View Product](docs/images/User%20View%20Product.png) | ![If Server is Down](docs/images/If%20server%20is%20Down.png) |

| 404 Not Found | Empty Search State |
|:---:|:---:|
| ![404 Product Not Found](docs/images/404%20Produt%20Not%20Found.png) | ![Empty Search State](docs/images/Searching%20for%20a%20product%20that%20is%20not%20found.png) |

---

## 🚀 Getting Started

### Demo Account

To access the live demo, use the provided test credentials:
- **Email:** `jane@example.com` *(Use the email you registered or were provided)*
- **Password:** `secret123`

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 10
- **Angular CLI** ≥ 21 (`npm install -g @angular/cli`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Hazem-Ahmed1/product-management.git
cd product-management

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
# → Opens at http://localhost:4200
```

### Build & Deploy

```bash
# Production build
npm run build

# Deploy to GitHub Pages
npx angular-cli-ghpages --dir=dist/product-management/browser
```

### Run Tests

```bash
npm test
```

The project uses **Vitest** as its test runner (36 unit tests covering services, guards, components, and forms).

---

## 📁 Project Structure

```
src/app/
├── core/                        # Framework-level singletons
│   ├── guards/                  # Route guards (auth, unsaved changes)
│   └── interceptors/            # HTTP interceptors (auth token, error handling)
│
├── environments/                # Environment-specific configuration
│
├── features/                    # Feature modules (lazy-loaded)
│   ├── admin/                   # Admin-only pages
│   │   ├── products/            # Dashboard with table, toolbar, pagination
│   │   ├── product-create/      # Create form + live preview
│   │   ├── product-edit/        # Edit form + confirmation modals
│   │   └── product-details/     # Admin product detail view
│   ├── auth/                    # Login page
│   ├── not-found/               # 404 page
│   └── user/                    # Customer-facing pages
│       ├── product-catalog/     # Grid of product cards
│       ├── product-card/        # Individual card component
│       └── product-details/     # Customer product detail view
│
├── layout/                      # Shell layouts
│   ├── admin-layout/            # Sidebar + header for admin
│   └── user-layout/             # Header for user view
│
├── models/                      # TypeScript interfaces & types
│
├── routes/                      # Route configurations
│   ├── admin.routes.ts
│   ├── auth.routes.ts
│   └── user.routes.ts
│
├── services/                    # Data-access services
│   ├── auth.service.ts
│   └── product.service.ts
│
└── shared/                      # Reusable UI components
    └── components/
        ├── breadcrumb/          # Dynamic breadcrumb trail
        ├── confirm-modal/       # Bootstrap-powered confirmation dialog
        ├── custom-select/       # Styled dropdown replacement
        ├── loading-spinner/     # Animated loading indicator
        └── toast/               # Notification toast service
```

---

## ✨ Features

### 1. Authentication

The login flow authenticates against the API and securely stores the returned JWT token on the client side.

**How it works:**

1. The user submits their credentials on a **responsive Login Page**.
2. `AuthService.login()` sends a POST to `/api/auth/login`.
3. On success, the token and user profile are stored in **`sessionStorage`** and cached in Angular **signals** (`_token`, `_user`).
4. The user is redirected to the admin dashboard (`/admin/products`).
5. Invalid credentials or network errors display clear, contextual error messages.

**Why `sessionStorage` over `localStorage`?**

| Aspect | `sessionStorage` | `localStorage` |
|---|---|---|
| **Lifetime** | Cleared when the tab closes | Persists forever |
| **Tab isolation** | Scoped to a single tab | Shared across all tabs |
| **Security** | Shorter exposure window | Token lives until manually cleared |

`sessionStorage` was chosen because:
- **Automatic expiry** — closing the browser tab automatically invalidates the session, reducing the attack surface for token theft.
- **Tab isolation** — each tab maintains its own session, preventing cross-tab interference (e.g., one tab logging out does not unexpectedly affect another).
- **Sufficient persistence** — the token survives page reloads within the same tab, which is the only scenario where persistence is needed.

### 2. Token Injection via HTTP Interceptor

Every authenticated API request automatically includes the JWT token via the `authInterceptor`:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq);
};
```

This centralizes authorization logic so that individual services never need to worry about attaching headers manually.

### 3. Token Expiration Handling

The `authInterceptor` also monitors API responses for `401 Unauthorized`:

```typescript
catchError((err) => {
  if (err instanceof HttpErrorResponse && err.status === 401) {
    authService.handleUnauthorized(); // clears session → redirects to /login
  }
  return throwError(() => err);
});
```

When the backend rejects an expired or invalid token, the app **automatically logs the user out** and redirects to the login page — no stale sessions, no confusing error states.

### 4. Admin Mode — Products Dashboard

After login, the application opens in **Admin Mode** by default:

- **Server-side pagination** with a configurable page-size selector (Rows for user clarity ) (`10 / 15 / 25 / 50`), defaulting to 15.
- **Server-side search** supporting product name, SKU, and slug — with a visible result count ("Showing 1–15 of 42") and a **Reset** button to clear the search input.
- **Active Status filter** rendered as clickable chips (`All / Active / Inactive`) instead of a `<select>` dropdown — fewer clicks, more visible state.
- A **responsive data table** displaying product thumbnail, name, SKU, status badge, stock level, price, and creation date.
- Row-level (per page) **action buttons**: View, Edit, and Delete (with a Bootstrap confirmation modal).

### 5. User View — Product Catalog

A **"User View" toggle** in the admin header switches to a customer-facing storefront layout without requiring re-authentication:

- Products are displayed in a **responsive card grid** showing thumbnail, name, price/currency, and stock availability.
- Only **active products** are shown.
- Server-side **search** and **pagination** are supported.
- Clicking a card navigates to a dedicated **Product Details** page with a back button.
- Both views share the **same `ProductService`** for data access, avoiding logic duplication.

### 6. Create Product

The Create Product form is built with **Angular Reactive Forms**:

- **Client-side validation** with clear, inline error messages (required fields, min price, integer-only stock, max length).
- **Live preview card** that updates on every keystroke via `toSignal(form.valueChanges)`.
- **Backend validation mapping** — 422 errors from the API are automatically mapped back to the corresponding form control using `setErrors({ serverError })`.
- **Duplicate submission prevention** — uses `exhaustMap` + a disabled submit button while the request is in flight (see [Why `exhaustMap`](#why-exhaustmap) below).

### 7. Edit Product

The Edit Product page extends the create form with:

- **Pre-population** — fetches the existing product and patches the form, then marks it as pristine.
- **Save confirmation modal** — a Bootstrap modal asks the user to confirm before saving.
- **Unsaved changes guard** — the `canDeactivate` route guard warns if the user navigates away with dirty form state, using a custom in-app Bootstrap modal instead of the browser's native `confirm()` dialog.

### 8. Product Details

Both Admin and User views have dedicated product detail pages:

- Accessible from the dashboard table (View action) or the user catalog (card click).
- **Invalid or missing IDs** redirect to a `/not-found` page with a descriptive message.
- The Admin view includes an **Edit Product** button for quick access.

---

## 🏗 Technical Decisions

### Why `rxResource`?

Angular 21 introduces the `rxResource` API (developer preview), a signal-based alternative to manual `subscribe()` + loading/error state management:

```typescript
private readonly productsResource = rxResource({
  params: () => this.params(),
  stream: ({ params }) => this.products.getAll(params),
});
```

**Benefits:**
- **Declarative** — the resource automatically re-fetches when `params()` changes (e.g., page, search, filter signals).
- **Built-in status tracking** — `status()` returns `'idle' | 'loading' | 'reloading' | 'error' | 'resolved'`, eliminating manual `isLoading` / `hasError` signals.
- **Signal-native** — works directly with Angular's signal-based change detection (`OnPush`), resulting in minimal re-renders.
- **Automatic unsubscription** — `rxResource` is tied to the component's lifecycle. When Angular destroys the component, the resource automatically cancels any in-flight HTTP request and unsubscribes from the inner observable. There is **zero manual cleanup code** — no `ngOnDestroy`, no `Subscription` variables, no `unsubscribe()` calls.

**Important caveat:** Calling `.value()` on a resource in an error state throws a `ResourceValueError`. All `.value()` accesses are guarded with `.hasValue()`:

```typescript
readonly products = computed(() =>
  this.productsResource.hasValue()
    ? this.productsResource.value()?.data ?? []
    : []
);
```

### Memory Leak Prevention Strategy

Memory leaks in Angular apps most commonly come from **unsubscribed observables** that outlive their component. This project prevents them at every layer:

| Technique | Where it's used | How it prevents leaks |
|---|---|---|
| **`rxResource`** | Product listing, catalog, detail pages | Automatically unsubscribes when the component is destroyed — no manual cleanup needed |
| **`takeUntilDestroyed()`** | Form submit streams (`submit$` in Create & Edit) | Completes the observable pipeline when the component's `DestroyRef` fires, preventing orphaned subscriptions |
| **`toSignal()`** | Debounced search, route params | Automatically unsubscribes from the source observable on component destroy |
| **`exhaustMap` + `EMPTY`** | Form submissions | On error, returns `EMPTY` (which completes immediately), ensuring no hanging inner subscriptions |
| **`OnPush` change detection** | Every component | Reduces unnecessary change detection cycles, lowering CPU and memory pressure |
| **Lazy-loaded routes** | All feature modules | Components and their subscriptions are only created when the route is visited, and fully destroyed when navigated away |

**Concrete example — the admin Products component:**

```typescript
// ✅ rxResource: auto-unsubscribes on destroy
private readonly productsResource = rxResource({
  params: () => this.params(),
  stream: ({ params }) => this.productService.getAll(params),
});

// ✅ takeUntilDestroyed: completes the delete stream on destroy
this.delete$.pipe(
  switchMap((id) => this.productService.delete(id).pipe(
    catchError(() => EMPTY),       // ✅ EMPTY completes immediately
  )),
  takeUntilDestroyed(),            // ✅ auto-complete on destroy
).subscribe(() => {
  this.productsResource.reload();
});
```

There is **not a single manual `unsubscribe()` call** in the entire codebase. Every subscription is managed declaratively through either `rxResource`, `takeUntilDestroyed()`, or `toSignal()` — all of which hook into Angular's `DestroyRef` injection token to clean up automatically.

### Why `exhaustMap`?

When submitting a form, the user might accidentally double-click the button. The RxJS operator `exhaustMap` solves this:

```
User clicks → [submit$]
  └→ exhaustMap → API call in flight
       └→ any new click during this time is IGNORED
```

| Operator | Behavior on new emission while inner is active |
|---|---|
| `switchMap` | **Cancels** the in-flight request → bad for writes |
| `mergeMap` | Fires **both** requests in parallel → duplicates |
| `concatMap` | **Queues** the second request → wasteful |
| `exhaustMap` | **Ignores** the second click entirely → ✅ perfect for form submits |

Combined with disabling the submit button (`[disabled]="isLoading()"`) as a UI safeguard, this provides bulletproof duplicate prevention.

### Reactive Forms Flow

The create/edit forms follow a consistent pattern:

```
┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌─────────┐
│  User    │────▸│  FormGroup   │────▸│  Subject   │────▸│  API    │
│  types   │     │  (validated) │     │  submit$   │     │  call   │
└──────────┘     └──────────────┘     └───────────┘     └─────────┘
      │                │                    │                 │
      │                ▼                    │                 ▼
      │          Live Preview          exhaustMap        catchError
      │          (toSignal)            (1 at a time)     (map 422 → form errors)
      │                                                      │
      │                                                      ▼
      │                                               Toast + Navigate
```

1. **FormGroup** — built with `NonNullableFormBuilder`, validators attached declaratively.
2. **`toSignal(form.valueChanges)`** — powers the live preview card without manual change detection.
3. **`onSubmit()`** — marks all controls as touched, validates, then pushes to `submit$`.
4. **`exhaustMap`** — sends the API request, ignoring duplicate clicks.
5. **`catchError`** — if 422, maps field errors to `setErrors()`; otherwise shows a server error banner.
6. **`finalize`** — always clears the loading state, even on error.
7. **`takeUntilDestroyed()`** — automatically unsubscribes when the component is destroyed.

### Why Debounced Search with Signals + `rxResource`?

The product search uses a combination of **Angular Signals**, **RxJS**, and **`rxResource`** to provide responsive server-side searching without making an API request for every keystroke.

**Flow:**

```text
User types
    ↓
search signal
    ↓
toObservable()
    ↓
debounceTime(350ms)
    ↓
distinctUntilChanged()
    ↓
toSignal()
    ↓
computed params
    ↓
rxResource
    ↓
Product API
```

**Implementation:**

```typescript
private readonly debouncedSearch = toSignal(
  toObservable(this.search).pipe(
    debounceTime(350),
    distinctUntilChanged(),
  ),
  { initialValue: '' },
);

private readonly params = computed(() => ({
  page: this.page(),
  per_page: this.perPage(),
  search: this.debouncedSearch() || undefined,
  is_active:
    this.statusFilter() === 'active' ? true :
    this.statusFilter() === 'inactive' ? false :
    undefined,
}));

private readonly productsResource = rxResource({
  params: () => this.params(),
  stream: ({ params }) => this.productService.getAll(params),
});
```

**Why this approach?**

* **`debounceTime(350)`** prevents an API request from being sent for every keystroke. The request is made only after the user stops typing for 350ms.
* **`distinctUntilChanged()`** prevents unnecessary requests when the search value has not actually changed.
* **Signals** keep the search state reactive and integrate naturally with Angular's modern change-detection model.
* **`computed()`** combines the search term with pagination and status-filter state into a single reactive set of API parameters.
* **`rxResource`** automatically re-fetches the products whenever those parameters change and provides built-in loading, error, and resolved states.
* **Server-side search** keeps filtering responsibility on the API rather than loading the entire product collection into the browser.

### Why not manually use `switchMap`?

A manual `switchMap` search pipeline is a common RxJS approach because it allows a newer search request to supersede an older one. However, this implementation uses **`rxResource`** as the reactive data-fetching abstraction.

Instead of manually managing:

```text
search → switchMap → HTTP request → subscription → loading/error state
```

the application separates the concerns:

```text
search → debounce → reactive params → rxResource → HTTP request
```

This keeps the component declarative while allowing `rxResource` to manage the lifecycle of the resource and its associated HTTP observable.

The result is a simple and predictable search implementation that combines **RxJS where it is useful for input timing** with **Angular Signals and `rxResource` for reactive data fetching**.

---

## 🎨 UX Enhancements

### Loading Skeleton Rows (Admin Table)

Instead of showing a generic spinner over the admin table, the loading state renders **skeleton rows** that mimic the shape of real data:

```html
@if (loadState() === 'loading') {
  @for (row of skeletonRows(); track $index) {
    <tr class="skeleton-row" aria-hidden="true">
      <td><span class="skeleton skeleton--name"></span></td>
      <td><span class="skeleton skeleton--sku"></span></td>
      ...
    </tr>
  }
}
```

The number of skeleton rows matches the current `perPage` setting, so the table layout remains stable — no content jumps.

### Loading Spinner (User View)

The user catalog uses an **animated dot spinner** with a contextual message (`"Products are loading…"`), keeping the interface visually consistent and informative.

### Clickable Filter Chips

The Active Status filter uses **clickable chips** (`All / Active / Inactive`) instead of a `<select>` dropdown:
- Fewer interactions needed (one click instead of click → scroll → click).
- The active state is always visible at a glance.

### Result Count & Reset Button

- A **"Showing X–Y of Z"** counter is always visible so the user knows the scope of their current view.
- A **Reset ✕** button appears next to the search input when a search is active, providing a one-click way to clear the filter.

### Disabled Submit Buttons

While any form submission is in flight, the submit button is disabled and shows a loading state. Combined with `exhaustMap`, this provides both a **visual** and **programmatic** safeguard against duplicate requests.

### Toast Notifications

A lightweight, injectable `ToastService` provides non-blocking success/error notifications with auto-dismiss, used after create, update, and delete operations.

### Unsaved Changes Guard (Edit Product Page)

The `canDeactivate` guard on the edit route warns users before navigating away from a dirty form. The confirmation dialog is rendered using a **Bootstrap modal** (not the browser's native `confirm()`), keeping the experience consistent with the rest of the app.

---

## 🔌 Shared Components

| Component | Purpose | Used In |
|---|---|---|
| `Breadcrumb` | Dynamic breadcrumb trail from route data | Admin detail, create, edit pages |
| `ConfirmModal` | Bootstrap-powered confirmation dialog | Delete product, save confirmation, unsaved changes |
| `CustomSelect` | Styled `<select>` replacement with keyboard support | Currency picker, page-size selector |
| `LoadingSpinner` | Animated CSS spinner with configurable message | User catalog, product detail pages |
| `ToastService` | Injectable notification service (success/error) | Create, edit, delete flows |

---

## 🛡 Route Guards

| Guard | Type | Purpose |
|---|---|---|
| `authGuard` | `canActivate` | Redirects unauthenticated users to `/login` |
| `publicGuard` | `canActivate` | Redirects authenticated users away from `/login` to the dashboard |
| `unsavedChangesGuard` | `canDeactivate` | Warns before leaving the edit page with unsaved form changes |

---

## 🌐 HTTP Interceptors

| Interceptor | Responsibility |
|---|---|
| `authInterceptor` | Attaches `Authorization: Bearer <token>` to all requests; handles 401 → auto-logout |
| `errorInterceptor` | Converts `status 0` → "Cannot reach the server" and `status 5xx` → "Service unavailable" |

These are registered globally in `app.config.ts`:

```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor, errorInterceptor])
)
```

---

## 🧪 Testing

The project includes **36 unit tests** covering:

| Area | Tests | What's Covered |
|---|---|---|
| `AuthService` | 6 | Login, logout, session persistence, error handling |
| `ProductService` | 9 | CRUD operations, error mapping, 422 field errors |
| `AuthGuard` | 4 | Authenticated/unauthenticated redirects |
| `ToastService` | 8 | Success/error toasts, auto-dismiss, queue management |
| `ProductCreate` | 5 | Form initialization, validation, submission flow |
| `ProductEdit` | 2 | Data pre-population, form patching |
| `ProductCard` | 1 | Rendering customer-facing product info |
| `App` | 1 | Application bootstrap |

Run all tests:

```bash
npm test
```

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Angular 21 |
| **Language** | TypeScript 5.9 |
| **Styling** | Vanilla CSS + Bootstrap 5.3 (modals, grid utilities) |
| **Icons** | Font Awesome 7 |
| **State** | Angular Signals + `rxResource` |
| **Forms** | Angular Reactive Forms |
| **HTTP** | Angular `HttpClient` + functional interceptors |
| **Routing** | Angular Router with lazy loading |
| **Testing** | Vitest + Angular Testing Utilities |
| **Deployment** | GitHub Pages via `angular-cli-ghpages` |

---

## 📄 API Reference

All data is fetched from the external API:


| Endpoint | Method | Description |
|---|---|---|
| `/auth/login` | POST | Authenticate and receive JWT token |
| `/products` | GET | List products (paginated, filterable, searchable) |
| `/products/:id` | GET | Get a single product |
| `/products` | POST | Create a new product |
| `/products/:id` | PUT | Update an existing product |
| `/products/:id` | DELETE | Delete a product |

---

