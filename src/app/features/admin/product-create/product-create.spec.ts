import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductCreate } from './product-create';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { of, throwError } from 'rxjs';
import { ProductValidationError } from '../../../models/product.model';

import { vi } from 'vitest';

describe('ProductCreate Form Behavior', () => {
  let component: ProductCreate;
  let fixture: ComponentFixture<ProductCreate>;
  let productServiceMock: any;
  let toastServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    productServiceMock = {
      create: vi.fn().mockReturnValue(of({ data: { id: 1 } }))
    };
    
    toastServiceMock = {
      success: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ProductCreate],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCreate);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should initialize with default form values', () => {
    expect(component.form.value).toEqual({
      name: '',
      description: '',
      price: 10,
      currency: 'USD',
      stock: 10,
      is_active: true
    });
  });

  it('should validate required fields', () => {
    component.form.controls.name.setValue('');
    component.form.controls.price.setValue(null as any);
    
    expect(component.form.controls.name.invalid).toBe(true);
    expect(component.form.controls.price.invalid).toBe(true);
    
    component.onSubmit();
    
    expect(productServiceMock.create).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('should validate minimum price', () => {
    component.form.controls.price.setValue(3); // min is 5
    expect(component.form.controls.price.invalid).toBe(true);
    expect(component.errorFor('price')).toContain('Minimum value is 5');
  });

  it('should call productService.create when valid form is submitted', () => {
    component.form.patchValue({
      name: 'New Product',
      description: 'Cool product',
      price: 99.99,
      currency: 'EUR',
      stock: 5,
      is_active: false
    });
    
    component.onSubmit();
    
    expect(productServiceMock.create).toHaveBeenCalledWith({
      name: 'New Product',
      description: 'Cool product',
      price: 99.99,
      currency: 'EUR',
      stock: 5,
      is_active: false
    });
    expect(toastServiceMock.success).toHaveBeenCalledWith('Product created successfully!');
    expect(router.navigate).toHaveBeenCalledWith(['/admin/products']);
  });

  it('should handle server validation errors gracefully', () => {
    const error = new ProductValidationError('Validation failed', {
      name: ['The name has already been taken.']
    });
    
    productServiceMock.create.mockReturnValue(throwError(() => error));
    
    component.form.patchValue({ name: 'Existing Product', price: 20, stock: 10 });
    component.onSubmit();
    
    expect(component.serverError()).toBe('Validation failed');
    expect(component.form.controls.name.errors?.['serverError']).toBe('The name has already been taken.');
    expect(component.errorFor('name')).toBe('The name has already been taken.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

});
