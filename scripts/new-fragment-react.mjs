import { constants } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const FRAG_DIR = path.join(ROOT, 'fragments')

function usage() {
  console.log('Usage: pnpm new:fragment <id> [port]')
  console.log('Example: pnpm new:fragment profile 5174')
}

function toValidId(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
}

async function exists(p) {
  try {
    await access(p, constants.F_OK)
    return true
  } catch {
    return false
  }
}

function fragPkgJson(id) {
  return `{
    "name": "fragment-${id}",
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
      "react": "^19.1.1",
      "react-dom": "^19.1.1"
    },
    "devDependencies": {
      "@biomejs/biome": "latest",
      "@types/node": "^24.10.0",
      "@types/react": "^19.1.16",
      "@types/react-dom": "^19.1.9",
      "@vitejs/plugin-react": "^5.0.4",
      "typescript": "latest",
      "vite": "latest"
    }
  }
  `
}

function fragTsAppConfig() {
  return `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`
}

function fragTsNodeConfig() {
  return `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
`
}

function fragTsconfig() {
  return `{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}
`
}

function fragViteConfig(base, port) {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  base: '${base}',
  plugins: [
    react(),
    // DEV fallback: trả 200 cho mọi route shell để không bị 302
    {
      name: 'wf-dev-spa-fallback',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const wantsHtml = req.method === 'GET' && req.headers.accept?.includes('text/html');
          if (wantsHtml && !req.url?.startsWith('${base}')) {
            const html = fs.readFileSync(path.resolve('index.html'), 'utf-8');
            const transformed = await server.transformIndexHtml('${base}', html);
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = 200;
            res.end(transformed);
            return;
          }
          next();
        });
      },
    },
  ],
  server: {
    host: true,
    port: ${port},
    strictPort: true
    // nếu cần: hmr: { clientPort: 3000 }
  },
});
`
}

function fragIndexHtml(title) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
}

function fragMainTsx() {
  return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`
}

function fragAppTsx(id) {
  return `import { useEffect, useState } from 'react';

export default function ${pascal(id)}() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const bc = new BroadcastChannel('/demo');
    const onMsg = (evt) => { if (evt.data?.type === 'ping') setCount((c) => c + 1); };
    bc.addEventListener('message', onMsg);
    return () => { bc.removeEventListener('message', onMsg); bc.close(); };
  }, []);
  return (
    <div style={{ border: '1px dashed #999', padding: 16, borderRadius: 8 }}>
      <h2>${pascal(id)} Fragment</h2>
      <p>Broadcast pings: {count}</p>
    </div>
  );
}

function pascal(s) { return String(s).replace(/(^|[-_\\s]+)([a-z])/g, (_, __, c) => c.toUpperCase()); }
`
}

function pascal(s) {
  return String(s).replace(/(^|[-_\s]+)([a-z])/g, (_, __, c) => c.toUpperCase())
}

async function main() {
  const [, , rawId, rawPort] = process.argv
  if (!rawId) return usage()

  const id = toValidId(rawId)
  const port = Number(rawPort || 5174)
  const base = `/_fragment/${id}/`
  const dest = path.join(FRAG_DIR, id)

  if (await exists(dest)) {
    console.error(`❌ Fragment "${id}" đã tồn tại: ${dest}`)
    process.exit(1)
  }

  await mkdir(path.join(dest, 'src'), { recursive: true })

  await writeFile(path.join(dest, 'package.json'), fragPkgJson(id))
  await writeFile(path.join(dest, 'tsconfig.json'), fragTsconfig())
  await writeFile(path.join(dest, 'tsconfig.app.json'), fragTsAppConfig())
  await writeFile(path.join(dest, 'tsconfig.node.json'), fragTsNodeConfig())
  await writeFile(path.join(dest, 'vite.config.ts'), fragViteConfig(base, port))
  await writeFile(path.join(dest, 'index.html'), fragIndexHtml(`Fragment ${id}`))
  await writeFile(path.join(dest, 'src', 'main.tsx'), fragMainTsx())
  await writeFile(path.join(dest, 'src', 'App.tsx'), fragAppTsx(id))

  console.log(`✅ Tạo fragment "${id}" tại ${dest}`)
  console.log(`   - base: ${base}`)
  console.log(`   - port: ${port}`)
  console.log(`➡  Tiếp theo:
  1) Thêm đăng ký vào Gateway (app/gateway/src/server.ts), ví dụ:
     gw.registerFragment({
       fragmentId: '${id}',
       routePatterns: [
         '/_fragment/${id}/:_*',
         '/portal/:_*',   // hoặc '/admin/:_*' tuỳ shell bạn muốn mount
       ],
       endpoint: 'http://localhost:${port}'
     });

  2) Chạy:
     pnpm -C ${path.relative(ROOT, dest)} install
     pnpm dev
`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
