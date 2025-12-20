import { Component, inject, input, signal } from '@angular/core';
import { IconCollections } from '../models/collections';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ngx-icon',
  imports: [],
  template: ` <span [innerHTML]="svg()"></span> `,
})
export class NgxIcon {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  public readonly collection = input.required<IconCollections>();
  public readonly icon = input.required<string>();
  public readonly width = input<string>('20');
  public readonly height = input<string>('20');
  public readonly color = input<string>('');
  public readonly flip = input<string>('');
  public readonly rotate = input<string>('');

  svg = signal<SafeHtml | null>(null);

  ngOnInit(): void {
    const query = new HttpParams()
      .set('width', this.width())
      .set('height', this.height())
      .set('color', this.color())
      .set('flip', this.flip())
      .set('rotate', this.rotate());
    this.http
      .get(
        `https://api.iconify.design/${this.collection()}/${this.icon()}.svg?${query.toString()}`,
        {
          responseType: 'text',
        }
      )
      .subscribe((svg) => {
        this.svg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
      });
  }
}
