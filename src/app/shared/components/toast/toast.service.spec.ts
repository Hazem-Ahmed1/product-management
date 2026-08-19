import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty toast list', () => {
    expect(service.toasts().length).toBe(0);
  });

  it('should add a success toast', () => {
    service.success('Item saved successfully');
    
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Item saved successfully');
  });

  it('should add an error toast', () => {
    service.error('Failed to load item');
    
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe('Failed to load item');
  });

  it('should add an info toast', () => {
    service.info('Update available');
    
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe('Update available');
  });

  it('should assign unique IDs to each toast', () => {
    service.success('First');
    service.success('Second');
    
    const toasts = service.toasts();
    expect(toasts.length).toBe(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('should allow removing a toast by ID', () => {
    service.success('First');
    service.success('Second');
    
    const toastsBefore = service.toasts();
    expect(toastsBefore.length).toBe(2);
    
    const firstId = toastsBefore[0].id;
    service.remove(firstId);
    
    const toastsAfter = service.toasts();
    expect(toastsAfter.length).toBe(1);
    expect(toastsAfter[0].message).toBe('Second');
  });

  it('should automatically remove toasts after 5 seconds', () => {
    vi.useFakeTimers();
    service.success('Auto remove test');
    
    expect(service.toasts().length).toBe(1);
    
    // Advance time by 4999ms - should still be there
    vi.advanceTimersByTime(4999);
    expect(service.toasts().length).toBe(1);
    
    // Advance time by 1ms (total 5000ms) - should be removed
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
    
    vi.useRealTimers();
  });
});
