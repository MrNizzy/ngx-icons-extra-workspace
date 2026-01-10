import { ActivatedRoute, Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxIcon } from 'ngx-icons-extra';
import { MatTooltipModule } from '@angular/material/tooltip';

interface IconifyInfo {
  name?: string;
  total?: number;
  author?: {
    name?: string;
    url?: string;
  };
  license?: {
    title?: string;
    spdx?: string;
    url?: string;
  };
  version?: string;
}

interface CollectionIconsResponse {
  prefix: string;
  total?: number;
  title?: string;
  info?: IconifyInfo;
  uncategorized?: string[];
  categories?: Record<string, string[]>;
  categoryTitles?: Record<string, string>;
  hidden?: string[];
  aliases?: Record<string, string>;
  chars?: Record<string, string>;
}

interface CollectionMeta {
  prefix: string;
  title: string;
  total: number;
  license?: IconifyInfo['license'];
  author?: IconifyInfo['author'];
}

interface CollectionIcon {
  name: string;
  category: string;
}

interface IconSection {
  category: string;
  label: string;
  total: number;
  chunks: string[][];
}

const DEFAULT_CATEGORY = 'Sin categoría';
const ICONS_PER_CHUNK = 80;

@Component({
  selector: 'collection-page',
  templateUrl: './collection.html',
  styleUrls: ['./collection.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    NgxIcon,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Collection implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly icons = signal<CollectionIcon[]>([]);
  readonly info = signal<CollectionMeta | null>(null);
  readonly currentId = signal<string>('');
  readonly search = signal('');
  readonly selectedCategory = signal('all');
  readonly categoryTitles = signal<Record<string, string>>({});

  readonly filteredIcons = computed(() => {
    const list = this.icons();
    const query = this.search().trim().toLowerCase();
    const category = this.selectedCategory();

    return list.filter(({ name, category: iconCategory }) => {
      const matchesQuery = !query || name.toLowerCase().includes(query);
      const matchesCategory = category === 'all' || iconCategory === category;
      return matchesQuery && matchesCategory;
    });
  });

  readonly categoryOptions = computed(() => {
    const counts = new Map<string, { count: number; label: string }>();
    this.icons().forEach(({ category }) => {
      const titles = this.categoryTitles();
      const target = counts.get(category) ?? { count: 0, label: titles[category] ?? category };
      target.count += 1;
      target.label = titles[category] ?? target.label;
      counts.set(category, target);
    });

    return Array.from(counts.entries())
      .map(([value, data]) => ({ value, count: data.count, label: data.label }))
      .sort((a, b) => (a.label ?? a.value).localeCompare(b.label ?? b.value));
  });

  readonly sections = computed<IconSection[]>(() => {
    const grouped = new Map<string, string[]>();
    this.filteredIcons().forEach(({ category, name }) => {
      const bucket = grouped.get(category) ?? [];
      bucket.push(name);
      grouped.set(category, bucket);
    });

    const titles = this.categoryTitles();

    return Array.from(grouped.entries())
      .map(([category, icons]) => ({
        category,
        label: titles[category] ?? category,
        total: icons.length,
        chunks: this.chunkIcons(icons),
      }))
      .sort((a, b) => (a.label ?? a.category).localeCompare(b.label ?? b.category));
  });

  protected readonly placeholderIcons = Array.from({ length: 12 }, (_, index) => index);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadCollection(id);
      }
    });
  }

  protected goBack(): void {
    this.router.navigate(['/']);
  }

  protected reload(): void {
    const id = this.currentId();
    if (id) {
      this.loadCollection(id);
    }
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected copy(icon: string, event?: Event): void {
    event?.stopPropagation();
    const prefix = this.currentId();
    const snippet = `<ngx-icon collection="${prefix}" icon="${icon}" />`;
    navigator.clipboard.writeText(snippet);
    this.snackBar.open('Snippet copiado al portapapeles ✨', 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  protected goToIcon(icon: string): void {
    const prefix = this.currentId();
    this.router.navigate(['collections', prefix, icon]);
  }

  protected chunkTrack(chunk: string[]): string {
    return chunk.at(0) ?? crypto.randomUUID();
  }

  private loadCollection(id: string): void {
    this.currentId.set(id);
    this.loading.set(true);
    this.error.set(null);
    this.icons.set([]);
    this.search.set('');
    this.selectedCategory.set('all');

    this.http
      .get<CollectionIconsResponse>(`https://api.iconify.design/collection?prefix=${id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const icons = this.buildIcons(res);
          this.icons.set(icons);
          this.info.set(this.buildMeta(res, icons.length));
          this.categoryTitles.set(res.categoryTitles ?? {});
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los íconos de esta colección.');
          this.loading.set(false);
        },
      });
  }

  private buildIcons(response: CollectionIconsResponse): CollectionIcon[] {
    const result: CollectionIcon[] = [];
    Object.entries(response.categories ?? {}).forEach(([category, icons]) => {
      icons.forEach((name) => {
        result.push({ name, category });
      });
    });

    (response.uncategorized ?? []).forEach((name) => {
      result.push({ name, category: DEFAULT_CATEGORY });
    });

    return result;
  }

  private buildMeta(response: CollectionIconsResponse, fallbackTotal: number): CollectionMeta {
    const info = response.info;
    return {
      prefix: response.prefix,
      title: response.title ?? info?.name ?? response.prefix,
      total: response.total ?? info?.total ?? fallbackTotal,
      license: info?.license,
      author: info?.author,
    };
  }

  private chunkIcons(list: string[]): string[][] {
    if (!list.length) {
      return [];
    }

    const chunks: string[][] = [];
    for (let index = 0; index < list.length; index += ICONS_PER_CHUNK) {
      chunks.push(list.slice(index, index + ICONS_PER_CHUNK));
    }

    return chunks;
  }
}
