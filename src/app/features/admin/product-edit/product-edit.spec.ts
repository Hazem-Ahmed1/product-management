import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductEdit } from './product-edit';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { of, throwError } from 'rxjs';
import { ProductValidationError } from '../../../models/product.model';

import { vi } from 'vitest';

describe('ProductEdit Form Behavior', () => {
  let component: ProductEdit;
  let fixture: ComponentFixture<ProductEdit>;
  let productServiceMock: any;
  let toastServiceMock: any;
  let router: Router;

  const mockProduct = {
    id: 1,
    name: 'Existing Product',
    description: 'A test description',
    stock: 50,
    price: 99.99,
    currency: 'USD',
    is_active: true
  };

  beforeEach(async () => {
    productServiceMock = {
      getOne: vi.fn().mockReturnValue(of({ data: mockProduct })),
      update: vi.fn().mockReturnValue(of({ data: mockProduct }))
    };
    
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ProductEdit],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['id', '1']]))
          }
        },
        { provide: ProductService, useValue: productServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductEdit);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should initialize and fetch the product data', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(productServiceMock.getOne).toHaveBeenCalledWith(1);
    expect(component.form.value.name).toBe('Existing Product');
    expect(component.form.value.price).toBe(99.99);
  });

  it('should call productService.update when confirmed', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.form.patchValue({ name: 'Updated Product' });
    component.form.markAsDirty();
    
    // Simulate user clicking Save which opens modal
    component.onSubmit();
    expect(component.isConfirmModalOpen()).toBe(true);

    // Simulate modal confirmation
    component.confirmSave();
    
    expect(productServiceMock.update).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'Updated Product'
    }));
    expect(toastServiceMock.success).toHaveBeenCalledWith('Product updated successfully!');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/products']);
  });
});
