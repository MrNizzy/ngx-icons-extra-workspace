import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { NgxIcon } from 'ngx-icons-extra';

interface DialogData {
  id: string; // collection prefix
  name: string;
}

interface CollectionIconsResponse {
  prefix: string;
  total: number;
  title: string;
  uncategorized: string[];
}

@Component({
  selector: 'collection-dialog',
  imports: [CommonModule, MatDialogModule, MatProgressSpinnerModule, MatButtonModule, NgxIcon],
  template: `
    <h2 mat-dialog-title>{{ data.name }}</h2>
    <div mat-dialog-content>
      @if (loading()) {
      <div class="dialog-state" aria-live="polite">
        <mat-progress-spinner mode="indeterminate" diameter="48" />
      </div>
      } @else if (error()) {
      <div class="dialog-state" aria-live="assertive">{{ error() }}</div>
      } @else {
      <div class="icons-grid" aria-live="polite">
        @for (icon of icons(); track icon) { @defer (on viewport) {
        <button type="button" class="icon-btn" (click)="copy(icon)" mat-icon-button disableRipple>
          <ngx-icon [collection]="$any(data.id)" [icon]="icon" width="24" height="24" />
        </button>
        } @placeholder {
        <button type="button" class="icon-btn" mat-icon-button disableRipple>
          <mat-spinner diameter="24" />
        </button>
        } }
      </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </div>
  `,
  styles: [
    `
      .icons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
        gap: 0.75rem;
        max-height: 70vh;
        overflow: auto;
        padding: 0.5rem 0;
      }

      .icon-btn {
        width: 48px;
        height: 48px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-state {
        display: flex;
        justify-content: center;
        padding: 2rem 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionDialog implements OnInit {
  protected readonly http = inject(HttpClient);
  protected readonly dialogRef = inject(MatDialogRef<CollectionDialog>);
  protected readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly icons = signal<string[]>([]);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.http
      .get<CollectionIconsResponse>(`https://api.iconify.design/collection?prefix=${this.data.id}`)
      .subscribe({
        next: (res) => {
          this.icons.set(res.uncategorized);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los íconos.');
          this.loading.set(false);
        },
      });
  }

  protected copy(icon: string): void {
    navigator.clipboard.writeText(`${this.data.id}:${icon}`);
  }
}
