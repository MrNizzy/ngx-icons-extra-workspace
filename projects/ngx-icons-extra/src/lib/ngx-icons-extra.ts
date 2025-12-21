import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { IconifyService } from './iconify.service';

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
      width: 100%;
      height: 100%;
    }

    :host svg {
      width: 100%;
      height: 100%;
      display: block;
      flex-shrink: 0;
    }
  `,
})
export class NgxIcon implements OnInit {
  private readonly iconify = inject(IconifyService);
  public readonly collection = input.required<string>();
  public readonly icon = input.required<string>();
  public readonly width = input<string | undefined>(undefined);
  public readonly height = input<string | undefined>(undefined);
  public readonly color = input<string | undefined>(undefined);
  public readonly flip = input<string | undefined>(undefined);
  public readonly rotate = input<string | undefined>(undefined);

  readonly svg = signal<SafeHtml | null>(null);

  ngOnInit() {
    const collection = this.collection();
    const icon = this.icon();
    const options = {
      width: this.width(),
      height: this.height(),
      color: this.color(),
      flip: this.flip(),
      rotate: this.rotate(),
    };

    const subscription = this.iconify.loadIcon(collection, icon, options).subscribe((svg) => {
      this.svg.set(svg);
    });

    return () => subscription.unsubscribe();
  }
}
