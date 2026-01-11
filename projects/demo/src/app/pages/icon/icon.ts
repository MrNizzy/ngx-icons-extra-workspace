import { ActivatedRoute, Router } from '@angular/router';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconRequestOptions, NgxIcon } from 'ngx-icons-extra';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'icon-detail-page',
  templateUrl: './icon.html',
  styleUrls: ['./icon.css'],
  imports: [
    NgxIcon,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  @ViewChild('iconEl', { read: ElementRef }) private iconEl?: ElementRef<HTMLElement>;

  readonly prefix = signal('');
  readonly iconName = signal('');
  readonly size = signal(140);
  readonly color = signal('#1f1f1f');
  readonly background = signal('#ffffff');
  readonly showGrid = signal(true);
  readonly flip = signal<IconRequestOptions['flip'] | undefined>(undefined);
  readonly rotate = signal<IconRequestOptions['rotate'] | undefined>(90);
  readonly sizeSamples = [12, 16, 20, 24, 32, 48, 64];
  readonly flipSamples: IconRequestOptions['flip'][] = [
    'horizontal',
    'vertical',
    'horizontal,vertical',
  ];
  readonly rotateSamples: IconRequestOptions['rotate'][] = [45, 90, 135];
  readonly rotateOptions: IconRequestOptions['rotate'][] = [0, 45, 90, 135, 180];

  readonly enableSize = signal(false);
  readonly enableColor = signal(false);
  readonly enableFlip = signal(false);
  readonly enableRotate = signal(false);

  readonly sizePx = computed(() => `${this.size()}px`);
  readonly sizeAttr = computed(() => (this.enableSize() ? this.sizePx() : '140px'));
  readonly colorAttr = computed(() => (this.enableColor() ? this.color() : undefined));
  readonly flipAttr = computed(() => (this.enableFlip() ? this.flip() : undefined));
  readonly rotateAttr = computed(() => (this.enableRotate() ? this.rotate() : undefined));

  readonly snippet = computed(() => {
    const attributes = [`collection="${this.prefix()}"`, `icon="${this.iconName()}"`];

    if (this.enableSize()) {
      const size = this.sizeAttr();
      attributes.push(`width="${size}"`, `height="${size}"`);
    }

    const color = this.colorAttr();
    const flip = this.flipAttr();
    const rotate = this.rotateAttr();

    if (color) {
      attributes.push(`color="${color}"`);
    }

    if (flip) {
      attributes.push(`flip="${flip}"`);
    }

    if (rotate) {
      attributes.push(`rotate="${rotate}"`);
    }

    return `<ngx-icon ${attributes.join(' ')}></ngx-icon>`;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const prefix = params.get('id');
      const icon = params.get('icon');
      if (!prefix || !icon) {
        return;
      }
      this.prefix.set(prefix);
      this.iconName.set(icon);
    });
  }

  protected goBack(): void {
    const prefix = this.prefix();
    if (prefix) {
      this.router.navigate(['collections', prefix]);
    } else {
      this.router.navigate(['/']);
    }
  }

  protected copySnippet(): void {
    navigator.clipboard.writeText(this.snippet());
    this.snackBar.open('Snippet copiado al portapapeles ✨', 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  protected copySvg(): void {
    const svg = this.getCurrentSvgMarkup();
    if (!svg) {
      this.snackBar.open('El icono aún no está disponible para copiar.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    navigator.clipboard.writeText(svg).then(() => {
      this.snackBar.open('SVG copiado al portapapeles', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });
  }

  protected downloadSvg(): void {
    const svg = this.getCurrentSvgMarkup();
    if (!svg) {
      this.snackBar.open('El icono aún no está disponible para descargar.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.iconName()}-${this.size()}px.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected copyIconName(): void {
    const fullName = `${this.prefix()}:${this.iconName()}`;
    navigator.clipboard.writeText(fullName);
    this.snackBar.open('Nombre del icono copiado', 'Cerrar', {
      duration: 3000,
    });
  }

  private getCurrentSvgMarkup(): string | null {
    const element = this.iconEl?.nativeElement;
    if (!element) {
      return null;
    }
    const svg = element.innerHTML?.trim();
    return svg?.length ? svg : null;
  }
}
