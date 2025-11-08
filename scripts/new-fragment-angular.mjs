import { constants } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const FRAG_DIR = path.join(ROOT, 'fragments')
const exists = async (p) => {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}
const toId = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')

const pkgJson = (id) => `{
  "name": "fragment-${id}-angular",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc -b --noEmit",
    "lint": "biome check .",
    "fmt": "biome format --write .",
    "fix": "biome check --write ."
  },
  "dependencies": {
    "@angular/common": "^18.2.0",
    "@angular/core": "^18.2.0",
    "@angular/platform-browser": "^18.2.0",
    "@angular/platform-browser-dynamic": "^18.2.0",
    "rxjs": "^7.8.1",
    "zone.js": "^0.14.10"
  },
  "devDependencies": {
    "@analogjs/vite-plugin-angular": "^1.12.0",
    "@biomejs/biome": "latest",
    "typescript": "latest",
    "vite": "latest"
  }
}
`

const tsconfig = `{
  "compileOnSave": false,
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "useDefineForClassFields": false,
    "emitDecoratorMetadata": false,
    "experimentalDecorators": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
`

const viteConfig = (base, port) => `import { defineConfig } from 'vite';
import analog from '@analogjs/vite-plugin-angular';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  base: '${base}',
  plugins: [
    analog(),
    {
      name: 'wf-dev-spa-fallback',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const wantsHtml = req.method === 'GET' && req.headers.accept?.includes('text/html');
          if (wantsHtml && !req.url?.startsWith('${base}')) {
            const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
            const out = await server.transformIndexHtml('${base}', html);
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = 200;
            res.end(out);
            return;
          }
          next();
        });
      },
    },
  ],
  server: { host: true, port: ${port}, strictPort: true }
});
`

const indexHtml = (title) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <base href="/" />
  </head>
  <body>
    <app-root></app-root>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

const mainTs = `import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(err => console.error(err));
`

const appComponentTs = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    <div style="border:1px dashed #999;padding:16px;border-radius:8px">
      <h2>Angular Fragment</h2>
      <p>Broadcast pings: {{count}}</p>
    </div>
  \`
})
export class AppComponent {
  count = 0;
  private bc = new BroadcastChannel('/demo');
  constructor() {
    this.bc.addEventListener('message', (e) => {
      if ((e as MessageEvent)?.data?.type === 'ping') this.count++;
    });
  }
}
`

async function main() {
  const [, , rawId, rawPort] = process.argv
  if (!rawId) {
    console.log('Usage: pnpm new:fragment:angular <id> [port]')
    process.exit(1)
  }
  const id = toId(rawId)
  const port = Number(rawPort || 5176)
  const base = `/_fragment/${id}/`
  const dest = path.join(FRAG_DIR, id)
  if (await exists(dest)) {
    console.error(`❌ Fragment "${id}" đã tồn tại: ${dest}`)
    process.exit(1)
  }

  await mkdir(path.join(dest, 'src', 'app'), { recursive: true })
  await writeFile(path.join(dest, 'package.json'), pkgJson(id))
  await writeFile(path.join(dest, 'tsconfig.json'), tsconfig)
  await writeFile(path.join(dest, 'vite.config.ts'), viteConfig(base, port))
  await writeFile(path.join(dest, 'index.html'), indexHtml(`Fragment ${id} (Angular)`))
  await writeFile(path.join(dest, 'src', 'main.ts'), mainTs)
  await writeFile(path.join(dest, 'src', 'app', 'app.component.ts'), appComponentTs)

  console.log(`✅ Tạo Angular fragment "${id}" tại ${dest}`)
  console.log(`➡  pnpm -C fragments/${id} install`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
