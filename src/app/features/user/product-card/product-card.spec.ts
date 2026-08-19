import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import type { Product } from '../../../models/product.model';

describe('ProductCard', () => {
  const product: Product = {
    id: 8,
    name: 'Travel Mug',
    slug: 'travel-mug',
    sku: 'MUG-8',
    description: null,
    stock: 4,
    price: 12.5,
    currency: 'USD',
    thumbnail_url: null,
    is_active: true,
    created_at: null,
    updated_at: null,
  };

  it('shows customer-facing product information and links to its details page', async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Travel Mug');
    expect(element.textContent).toContain('$12.50');
    expect(element.textContent).toContain('4 in stock');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/products/8');
  });
});
