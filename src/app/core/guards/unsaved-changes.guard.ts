import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  confirmNavigation?(): Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = async (component) => {
  if (component.hasUnsavedChanges()) {
    if (component.confirmNavigation) {
      return await component.confirmNavigation();
    }
    return confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }
  return true;
};
