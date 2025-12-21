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
import { Router } from '@angular/router';
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
type CommercialUseFilter = 'all' | 'allowed' | 'not_allowed';
type AttributionFilter = 'all' | 'required' | 'optional';

interface CollectionVM {
  id: string;
  details: CollectionDetails;
  samples: string[];
}

interface CollectionGroup {
  category: string;
  items: CollectionVM[];
}

interface CategoryOption {
  value: string;
  count: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
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
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly collections = signal<CollectionsResponse | null>(null);
  readonly search = signal('');
  readonly paletteFilter = signal<PaletteFilter>('all');
  readonly commercialUseFilter = signal<CommercialUseFilter>('all');
  readonly attributionFilter = signal<AttributionFilter>('all');
  readonly selectedCategories = signal<Set<string>>(new Set());

  private readonly dialog = inject(MatDialog);

  protected readonly skeletonCards = Array.from({ length: 6 }, (_, index) => index);
  protected readonly skeletonChips = Array.from({ length: 4 }, (_, index) => index);

  protected readonly paletteOptions: { value: PaletteFilter; label: string }[] = [
    { value: 'all', label: 'Todas las paletas' },
    { value: 'mono', label: 'Monocromáticas' },
    { value: 'color', label: 'Multicolor' },
  ];

  protected readonly commercialOptions: { value: CommercialUseFilter; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'allowed', label: 'Permitido' },
    { value: 'not_allowed', label: 'No permitido' },
  ];

  protected readonly attributionOptions: { value: AttributionFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'required', label: 'Requiere atribución' },
    { value: 'optional', label: 'Atribución opcional' },
  ];

  readonly categoryOptions = computed<CategoryOption[]>(() => {
    const data = this.collections();
    if (!data) {
      return [];
    }

    const counts = new Map<string, number>();
    (Object.values(data) as CollectionDetails[]).forEach((details) => {
      const key = details.category || 'Otros';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  });

  readonly groupedCollections = computed<CollectionGroup[]>(() => {
    const data = this.collections();
    if (!data) {
      return [];
    }

    const query = this.search().trim().toLowerCase();
    const palette = this.paletteFilter();
    const commercialFilter = this.commercialUseFilter();
    const attributionFilter = this.attributionFilter();
    const selectedCategories = this.selectedCategories();
    const hasCategoryFilter = selectedCategories.size > 0;
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

      const category = details.category || 'Otros';
      const matchesCategory = !hasCategoryFilter || selectedCategories.has(category);
      if (!matchesCategory) {
        return;
      }

      const allowsCommercial = this.isCommercialAllowed(details);
      const matchesCommercial =
        commercialFilter === 'all' ||
        (commercialFilter === 'allowed' && allowsCommercial) ||
        (commercialFilter === 'not_allowed' && !allowsCommercial);
      if (!matchesCommercial) {
        return;
      }

      const requiresAttr = this.requiresAttribution(details);
      const matchesAttribution =
        attributionFilter === 'all' ||
        (attributionFilter === 'required' && requiresAttr) ||
        (attributionFilter === 'optional' && !requiresAttr);
      if (!matchesAttribution) {
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

  protected setCommercialUse(value: CommercialUseFilter): void {
    this.commercialUseFilter.set(value);
  }

  protected setAttribution(value: AttributionFilter): void {
    this.attributionFilter.set(value);
  }

  protected toggleCategory(value: string): void {
    const current = new Set(this.selectedCategories());
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    this.selectedCategories.set(current);
  }

  protected clearCategories(): void {
    this.selectedCategories.set(new Set());
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

  protected viewCollection(item: CollectionVM, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['collections', item.id]);
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

  private isCommercialAllowed(details: CollectionDetails): boolean {
    const text = this.getLicenseText(details);
    if (!text) {
      return true;
    }
    return !text.includes('nc');
  }

  private requiresAttribution(details: CollectionDetails): boolean {
    const text = this.getLicenseText(details);
    if (!text) {
      return false;
    }
    return text.includes('cc-by') || text.includes('by-sa') || text.includes('attribution');
  }

  private getLicenseText(details: CollectionDetails): string {
    const title = details.license?.title ?? '';
    const spdx = details.license?.spdx ?? '';
    return `${title} ${spdx}`.toLowerCase();
  }
}
