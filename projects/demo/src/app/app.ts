import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxIcon } from 'ngx-icons-extra';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CollectionDialog } from './collection-dialog';
import { MatIconModule } from '@angular/material/icon';

interface CollectionDetails {
  name: string;
  total: number;
  version: string;
  author: {
    name: string;
    url: string;
  };
  license: {
    title: string;
    spdx: string;
    url: string;
  };
  samples: string[];
  height: number;
  displayHeight: number;
  category: string;
  palette: boolean;
}

type CollectionsResponse = Record<string, CollectionDetails>;

type PaletteFilter = 'all' | 'mono' | 'color';

interface CollectionVM {
  id: string;
  details: CollectionDetails;
  samples: string[];
}

interface CollectionGroup {
  category: string;
  items: CollectionVM[];
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    NgxIcon,
    MatToolbarModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly collections = signal<CollectionsResponse | null>(null);
  readonly search = signal('');
  readonly paletteFilter = signal<PaletteFilter>('all');

  private readonly dialog = inject(MatDialog);

  protected readonly paletteOptions: { value: PaletteFilter; label: string }[] = [
    { value: 'all', label: 'Todas las paletas' },
    { value: 'mono', label: 'Monocromáticas' },
    { value: 'color', label: 'Multicolor' },
  ];

  readonly groupedCollections = computed<CollectionGroup[]>(() => {
    const data = this.collections();
    if (!data) {
      return [];
    }

    const query = this.search().trim().toLowerCase();
    const palette = this.paletteFilter();
    const groups = new Map<string, CollectionVM[]>();

    Object.entries(data).forEach(([id, details]) => {
      const matchesQuery =
        !query ||
        details.name.toLowerCase().includes(query) ||
        id.toLowerCase().includes(query) ||
        details.category?.toLowerCase().includes(query);
      if (!matchesQuery) {
        return;
      }

      if (palette === 'mono' && details.palette) {
        return;
      }

      if (palette === 'color' && !details.palette) {
        return;
      }

      const groupKey = details.category || 'Otros';
      const target = groups.get(groupKey) ?? [];
      target.push({
        id,
        details,
        samples: details.samples.slice(0, 6),
      });
      groups.set(groupKey, target);
    });

    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.details.name.localeCompare(b.details.name)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  ngOnInit(): void {
    this.loadCollections();
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected setPalette(value: PaletteFilter): void {
    this.paletteFilter.set(value);
  }

  protected openCollection(item: CollectionVM): void {
    this.dialog.open(CollectionDialog, {
      data: {
        id: item.id,
        name: item.details.name,
      },
      autoFocus: false,
      maxWidth: '640px',
      width: '90vw',
    });
  }

  protected refresh(): void {
    this.loadCollections();
  }

  private loadCollections(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<CollectionsResponse>('https://api.iconify.design/collections').subscribe({
      next: (res) => {
        this.collections.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Ocurrió un error al cargar las colecciones.');
        this.loading.set(false);
      },
    });
  }
}
