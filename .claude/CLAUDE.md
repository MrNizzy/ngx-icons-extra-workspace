# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

An Angular CLI workspace with two projects (see `angular.json`):

- `projects/ngx-icons-extra` — the published npm library `ngx-icons-extra`: an `<ngx-icon>` component that renders any [Iconify](https://iconify.design) icon.
- `projects/demo` — the showcase/icon-explorer app deployed at https://ngx-icons-extra.pages.dev.

Stack: Angular 22, TypeScript 6.0, ng-packagr, Angular Material + Tailwind CSS v4 (demo only), Karma + Jasmine.

## Package manager: pnpm only

- pnpm is pinned via `packageManager` in `package.json`; `angular.json` sets `cli.packageManager: pnpm`. Do not reintroduce `package-lock.json`, `bun.lock` or `yarn.lock`.
- pnpm blocks dependency build scripts. Decisions live under `allowBuilds` in `pnpm-workspace.yaml` (pnpm 12 key name). If an install fails with `ERR_PNPM_IGNORED_BUILDS`, add the package there explicitly (`true`/`false`) instead of bypassing the check.

## Commands

```bash
pnpm install --frozen-lockfile      # install
pnpm run lib:build                  # build the library into dist/ngx-icons-extra
pnpm run lib:watch                  # rebuild the library on change (dev config)
pnpm start                          # serve the demo on http://localhost:4200
pnpm run build                      # demo production build
pnpm ng test ngx-icons-extra --watch=false --browsers=ChromeHeadless   # library tests
pnpm ng test demo --watch=false --browsers=ChromeHeadless              # demo tests
pnpm ng test ngx-icons-extra --watch=false --browsers=ChromeHeadless --include='**/ngx-icons-extra.spec.ts'  # single spec
```

- **The demo consumes the BUILT library**, not its sources: `tsconfig.json` maps `ngx-icons-extra` to `./dist/ngx-icons-extra`. Run `pnpm run lib:build` (or keep `lib:watch` running) before `pnpm start`, `pnpm run build` or demo tests, otherwise imports fail or use a stale build.
- Karma needs a Chromium browser. On machines without Chrome, set `CHROME_BIN` to Edge (e.g. `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`).
- There is no lint script. Formatting follows the Prettier config in `package.json` (`printWidth: 100`, `singleQuote`, Angular parser for HTML).

## Architecture

### Library (`projects/ngx-icons-extra/src`)

- Public surface is only what `public-api.ts` re-exports: `NgxIcon` and `IconifyService` / `IconRequestOptions`. Anything else is internal.
- `NgxIcon` has an empty template; it renders the SVG through a host `[innerHTML]` binding. An `effect()` reads every input (`collection`, `icon`, `width`, `height`, `color`, `flip`, `rotate`), calls `IconifyService.loadIcon` and unsubscribes on cleanup, so any input change refetches.
- `IconifyService` (root singleton) fetches `https://api.iconify.design/{collection}/{icon}.svg` with the options as query params, marks the response trusted with `DomSanitizer.bypassSecurityTrustHtml`, caches by `collection:icon:options`, and dedupes in-flight requests with `shareReplay(1)`. The trust bypass is only safe because the source is the Iconify API; keep that in mind before changing the URL or accepting user-provided SVG.
- Consumers must provide `HttpClient` (`provideHttpClient(withFetch())`). The library must stay zoneless-safe (signals + `OnPush`, no zone.js reliance) because the demo uses `provideZonelessChangeDetection()`.

### Demo (`projects/demo/src/app`)

- `main.ts` bootstraps `AppRoot` (router outlet + `ThemeToggle`, backed by `ThemeService`).
- Lazy routes in `app.routes.ts`: `''` → `App` (collection list from Iconify `/collections`), `collections/:id` → `Collection` (icons from `/collection?prefix=`), `collections/:id/:icon` → `IconPage` (playground for `IconRequestOptions`). Unknown paths redirect to `''`.
- Styling: Material theme in `material-theme.scss`, Tailwind v4 through `.postcssrc.json` + `styles.css`.

## Versioning and releases

- Library version is `MAJOR.MINOR.PATCH` where **MAJOR always equals the supported Angular major** (22.x.x ↔ Angular 22).
- `projects/ngx-icons-extra/package.json` must declare as peers everything the library imports: `@angular/common`, `@angular/core`, `@angular/platform-browser` (`^<major>.0.0`) and `rxjs` (same range Angular declares). `engines.node` mirrors the `engines` field of `@angular/core`.
- Release flow: `pnpm run lib:version:patch|minor|major` → `pnpm run lib:publish:dry` → `pnpm run lib:publish`. `pnpm publish` runs git checks, so a real publish needs a clean tree on `main`.

## Upgrading Angular (use engram)

Engram project key: `ngx-icons-extra-workspace`. If the Claude session was started in another directory, engram auto-detects the wrong project: call `mem_session_start` with `directory` set to this repo and pass that `session_id` to `mem_save`.

1. Before starting, `mem_search` for `workflow/angular-upgrade-runbook` and `upgrade/angular-*-gotchas` to reuse previous findings.
2. Check the target with `npm view @angular/core dist-tags`.
3. `pnpm ng update @angular/core@<N> @angular/cli@<N>`, then `pnpm ng update @angular/material@<N> @angular/cdk@<N>`. Review every migration and file it touches.
4. Align `ng-packagr`, `@angular/build` and `typescript` with the peer ranges Angular declares; bump the library MAJOR, peers and `engines.node` (see above).
5. Verify: frozen install, `lib:build`, demo `build`, both test suites, `lib:publish:dry`, and a manual check of the demo in the browser.
6. Save new gotchas to engram under `upgrade/angular-<N>-gotchas` and update the runbook topic.

## Angular conventions

These mirror `.github/copilot-instructions.md`, `.cursor/rules/cursor.mdc`, `.junie/guidelines.md` and `.windsurf/rules/guidelines.md`; keep them in sync if conventions change.

- Standalone components only; do NOT set `standalone: true` (it is the default).
- `input()` / `output()` / `computed()` and signals for state; never `mutate` signals, use `set`/`update`.
- `ChangeDetectionStrategy.OnPush` on every component; prefer inline templates for small components.
- Host bindings go in the decorator's `host` object, never `@HostBinding` / `@HostListener`.
- Native control flow (`@if`, `@for`, `@switch`); `class`/`style` bindings instead of `ngClass`/`ngStyle`.
- `inject()` instead of constructor injection; singleton services use `providedIn: 'root'`.
- Reactive forms over template-driven; `NgOptimizedImage` for static (non-base64) images; lazy-load feature routes.
- Strict TypeScript; avoid `any`, use `unknown` when the type is uncertain.
