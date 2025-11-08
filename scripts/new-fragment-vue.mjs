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
  "name": "fragment-${id}-vue",
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
    "vue": "^3.5.12"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "@vitejs/plugin-vue": "^5.1.4",
    "typescript": "latest",
    "vite": "latest"
  }
}
`

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "useDefineForClassFields": true,
    "noEmit": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
`

const viteConfig = (base, port) => `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  base: '${base}',
  plugins: [
    vue(),
    // Fallback để mọi route trả 200 (tránh 302 khi shell đang ở /portal hoặc /admin)
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
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`

const mainTs = `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
`

const appVue = `<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
const count = ref(0);
let bc: BroadcastChannel | null = null;
const onMsg = (e: MessageEvent) => { if (e.data?.type === 'ping') count.value++; };
onMounted(() => { bc = new BroadcastChannel('/demo'); bc.addEventListener('message', onMsg); });
onBeforeUnmount(() => { if (bc) { bc.removeEventListener('message', onMsg); bc.close(); }});
</script>

<template>
  <div style="border:1px dashed #999;padding:16px;border-radius:8px">
    <h2>Vue Fragment</h2>
    <p>Broadcast pings: {{ count }}</p>
  </div>
</template>
`

async function main() {
  const [, , rawId, rawPort] = process.argv
  if (!rawId) {
    console.log('Usage: pnpm new:fragment:vue <id> [port]')
    process.exit(1)
  }
  const id = toId(rawId)
  const port = Number(rawPort || 5174)
  const base = `/_fragment/${id}/`
  const dest = path.join(FRAG_DIR, id)
  if (await exists(dest)) {
    console.error(`❌ Fragment "${id}" đã tồn tại: ${dest}`)
    process.exit(1)
  }

  await mkdir(path.join(dest, 'src'), { recursive: true })
  await writeFile(path.join(dest, 'package.json'), pkgJson(id))
  await writeFile(path.join(dest, 'tsconfig.json'), tsconfig)
  await writeFile(path.join(dest, 'vite.config.ts'), viteConfig(base, port))
  await writeFile(path.join(dest, 'index.html'), indexHtml(`Fragment ${id} (Vue)`))
  await writeFile(path.join(dest, 'src', 'main.ts'), mainTs)
  await writeFile(path.join(dest, 'src', 'App.vue'), appVue)

  console.log(`✅ Tạo Vue fragment "${id}" tại ${dest}`)
  console.log(`➡  pnpm -C fragments/${id} install`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
