import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { IconifyService, IconRequestOptions } from './iconify.service';

@Component({
  selector: 'ngx-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    '[innerHTML]': 'svg()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :host svg {
      width: 100%;
      height: 100%;
      display: block;
      flex-shrink: 0;
    }
  `,
})
export class NgxIcon {
  private readonly iconify = inject(IconifyService);
  public readonly collection = input.required<string>();
  public readonly icon = input.required<string>();
  public readonly width = input<IconRequestOptions['width'] | undefined>(undefined);
  public readonly height = input<IconRequestOptions['height'] | undefined>(undefined);
  public readonly color = input<IconRequestOptions['color'] | undefined>(undefined);
  public readonly flip = input<IconRequestOptions['flip'] | undefined>(undefined);
  public readonly rotate = input<IconRequestOptions['rotate'] | undefined>(undefined);

  readonly svg = signal<SafeHtml | null>(null);

  constructor() {
    effect((onCleanup) => {
      const collection = this.collection();
      const icon = this.icon();

      if (!collection || !icon) {
        this.svg.set(null);
        return;
      }

      const options = {
        width: this.width(),
        height: this.height(),
        color: this.color(),
        flip: this.flip(),
        rotate: this.rotate(),
      };

      const sub = this.iconify
        .loadIcon(collection, icon, options)
        .subscribe((svg) => this.svg.set(svg));

      onCleanup(() => sub.unsubscribe());
    });
  }
}
