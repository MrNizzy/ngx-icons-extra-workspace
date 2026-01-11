# NgxIconsExtra

[![npm version](https://badge.fury.io/js/ngx-icons-extra.svg)](https://badge.fury.io/js/ngx-icons-extra)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-21+-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ngx-icons-extra)](https://bundlephobia.com/package/ngx-icons-extra)
[![Downloads](https://img.shields.io/npm/dm/ngx-icons-extra.svg)](https://www.npmjs.com/package/ngx-icons-extra)
[![Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://ngx-icons-extra.pages.dev)

Una librería Angular para mostrar íconos de Iconify con rendimiento optimizado y experiencia de desarrollo moderna.

## 🚀 Características

- **Rendimiento optimizado** con `OnPush` change detection
- **API moderna** usando signals de Angular
- **Standalone components** - compatible con Angular 21+
- **Más de 100,000 íconos** de todas las colecciones de Iconify
- **Personalización completa** con tamaño, color, rotación y flip
- **TypeScript completo** con tipado estricto
- **Bundle optimizado** con tree-shaking

## 📦 Instalación

```bash
npm install ngx-icons-extra
```

## 🛠️ Configuración

### 1. Configurar HttpClient

El servicio `IconifyService` necesita `HttpClient` para obtener los íconos de la API de Iconify. En tu `app.config.ts`:

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    // ... otros providers
  ],
};
```

### 2. Usar el componente

```typescript
import { NgxIcon } from 'ngx-icons-extra';
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgxIcon],
  template: ` <ngx-icon collection="mdi" icon="home" /> `,
})
export class ExampleComponent {}
```

## 📖 Uso Básico

### Sintaxis básica

```html
<!-- Icono simple -->
<ngx-icon collection="mdi" icon="home" />

<!-- Con tamaño personalizado -->
<ngx-icon collection="mdi" icon="home" width="24" height="24" />

<!-- Con color -->
<ngx-icon collection="mdi" icon="home" color="#ff6b6b" />

<!-- Con rotación -->
<ngx-icon collection="mdi" icon="home" rotate="90deg" />

<!-- Con flip -->
<ngx-icon collection="mdi" icon="home" flip="horizontal" />
```

### Colecciones populares

| Colección             | Prefijo     | Ejemplo                                           |
| --------------------- | ----------- | ------------------------------------------------- |
| Material Design Icons | `mdi`       | `<ngx-icon collection="mdi" icon="home" />`       |
| Font Awesome          | `fa`        | `<ngx-icon collection="fa" icon="home" />`        |
| Heroicons             | `heroicons` | `<ngx-icon collection="heroicons" icon="home" />` |
| Tabler Icons          | `tabler`    | `<ngx-icon collection="tabler" icon="home" />`    |
| Lucide                | `lucide`    | `<ngx-icon collection="lucide" icon="home" />`    |

## 🎨 Personalización Avanzada

### Props disponibles

| Prop         | Tipo                 | Descripción             | Ejemplo                       |
| ------------ | -------------------- | ----------------------- | ----------------------------- |
| `collection` | `string` (requerido) | Prefijo de la colección | `"mdi"`                       |
| `icon`       | `string` (requerido) | Nombre del ícono        | `"home"`                      |
| `width`      | `string \| number`   | Ancho del ícono         | `"24"` o `24`                 |
| `height`     | `string \| number`   | Alto del ícono          | `"24"` o `24`                 |
| `color`      | `string`             | Color del ícono         | `"#ff6b6b"`                   |
| `rotate`     | `string`             | Rotación                | `"90deg"`                     |
| `flip`       | `string`             | Volteo                  | `"horizontal"` o `"vertical"` |

### Ejemplos prácticos

```html
<!-- Botón con ícono -->
<button mat-button>
  <ngx-icon collection="mdi" icon="download" width="20" height="20" />
  Descargar
</button>

<!-- Icono animado con hover -->
<ngx-icon
  collection="mdi"
  icon="heart"
  color="#e74c3c"
  style="transition: transform 0.2s; cursor: pointer;"
  (mouseenter)="rotate = '45deg'"
  (mouseleave)="rotate = '0deg'"
  [rotate]="rotate"
/>

<!-- Icono responsive -->
<ngx-icon collection="heroicons" icon="user" width="100%" height="100%" />
```

## 🔧 Configuración del Servicio

Para configuración avanzada, puedes inyectar el `IconifyService`:

```typescript
import { IconifyService } from 'ngx-icons-extra';
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgxIcon],
  template: `<!-- template -->`,
})
export class ExampleComponent {
  private iconify = inject(IconifyService);

  loadCustomIcon() {
    this.iconify
      .loadIcon('mdi', 'home', {
        width: 32,
        height: 32,
        color: '#primary',
      })
      .subscribe((svg) => {
        console.log('SVG loaded:', svg);
      });
  }
}
```

## 🎯 Mejores Prácticas

### 1. Usa tamaños consistentes

```html
<!-- ✅ Bueno - usa unidades consistentes -->
<ngx-icon collection="mdi" icon="home" width="24" height="24" />

<!-- ❌ Evita - mezcla unidades -->
<ngx-icon collection="mdi" icon="home" width="24px" height="2rem" />
```

### 2. Aprovecha el responsive

```html
<!-- ✅ Bueno - responsive con CSS -->
<div class="icon-container">
  <ngx-icon collection="mdi" icon="home" width="100%" height="100%" />
</div>

<style>
  .icon-container {
    width: 24px;
    height: 24px;
  }
</style>
```

### 3. Prefiere colecciones ligeras

```html
<!-- ✅ Bueno - colección específica -->
<ngx-icon collection="mdi" icon="home" />

<!-- ❌ Evita - colecciones muy grandes si no es necesario -->
<ngx-icon collection="icon-park" icon="home" />
```

## 🌐 Demo

Puedes ver una demostración interactiva de la librería en:

- **Demo online**: [https://ngx-icons-extra.pages.dev/](https://ngx-icons-extra.pages.dev/)
- **Demo local**: Ejecuta `ng serve` y navega a `http://localhost:4200`
- **Explorador de íconos**: Navega a `/collections/{prefix}` para explorar cualquier colección

## 📚 Referencias

- [Iconify Icon Sets](https://icon-sets.iconify.design/) - Explora todas las colecciones disponibles
- [Iconify API](https://iconify.design/docs/api/) - Documentación de la API
- [Angular Signals](https://angular.dev/guide/signals) - Más sobre signals en Angular

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver el archivo [LICENSE](LICENSE) para detalles.

## 📦 Publicación

### Para desarrolladores

Si quieres contribuir a la librería:

```bash
# Construir la librería
ng build ngx-icons-extra

# Publicar a npm
cd dist/ngx-icons-extra
npm publish
```

### Versionado

El versionado sigue la convención semántica con una estructura específica:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Siempre coincide con la versión de Angular compatible (ej: 21.x.x para Angular 21)
- **MINOR**: Nuevas características o cambios importantes en la librería
- **PATCH**: Correcciones de bugs y mejoras menores

```bash
# Actualizar versión (ejemplo para Angular 21)
npm version patch  # 21.0.1 -> 21.0.2
npm version minor  # 21.0.1 -> 21.1.0
npm version major  # 21.0.1 -> 22.0.0 (para nueva versión de Angular)
```

---

**Creado con ❤️ por [MrNizzy](https://github.com/MrNizzy)**
