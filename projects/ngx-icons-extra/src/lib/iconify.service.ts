import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface IconRequestOptions {
  width?: string;
  height?: string;
  color?: string;
  flip?: string;
  rotate?: string;
}

@Injectable({
  providedIn: 'root',
})
export class IconifyService {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  private readonly cache = new Map<string, SafeHtml>();
  private readonly pending = new Map<string, Observable<SafeHtml>>();

  loadIcon(
    collection: string,
    icon: string,
    options: IconRequestOptions = {}
  ): Observable<SafeHtml> {
    const key = this.buildCacheKey(collection, icon, options);
    const cachedIcon = this.cache.get(key);

    if (cachedIcon) {
      return of(cachedIcon);
    }

    const pendingRequest = this.pending.get(key);
    if (pendingRequest) {
      return pendingRequest;
    }

    const params = this.buildParams(options);
    const request$ = this.http
      .get(`https://api.iconify.design/${collection}/${icon}.svg`, {
        params,
        responseType: 'text',
      })
      .pipe(
        map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg)),
        tap((safeSvg) => {
          this.cache.set(key, safeSvg);
          this.pending.delete(key);
        }),
        shareReplay(1)
      );

    this.pending.set(key, request$);
    return request$;
  }

  private buildParams(options: IconRequestOptions): HttpParams {
    let params = new HttpParams();
    Object.entries(options).forEach(([param, value]) => {
      if (value) {
        params = params.set(param, value);
      }
    });
    return params;
  }

  private buildCacheKey(collection: string, icon: string, options: IconRequestOptions): string {
    const params = Object.entries(options)
      .filter(([, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${collection}:${icon}:${params}`;
  }
}
