import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export interface SelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomSelect<T extends string | number = string | number> {
  readonly options = input.required<readonly SelectOption<T>[]>();
  readonly value = input.required<T>();
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly selectionChange = output<T>();
  readonly open = signal(false);

  selectedLabel(): string {
    return this.options().find((option) => option.value === this.value())?.label ?? '';
  }
  toggle(): void {
    this.open.update((open) => !open);
  }
  choose(value: T): void {
    this.selectionChange.emit(value);
    this.open.set(false);
  }
  close(): void {
    this.open.set(false);
  }
}
