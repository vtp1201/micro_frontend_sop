import { constants } from 'node:fs'
import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SHELLS_DIR = path.join(ROOT, 'apps', 'shells')

function usage() {
  console.log('Usage: pnpm new:shell <name> [port]')
  console.log('Example: pnpm new:shell portal 5173')
}

function toValidName(name) {
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

function shellPkgJson(name) {
  return `{
  "name": "shell-${name}",
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
    "react-dom": "^19.1.1",
    "web-fragments": "latest"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "@types/node": "^24.8.1",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "typescript": "latest",
    "vite": "latest"
  }
}
`
}

function shellTsconfig() {
  return `{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
}

`
}

function shellTsAppConfig() {
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

function shellTsNodeConfig() {
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

function shellViteConfig(port) {
  return `import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${port},
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 3000,
      protocol: 'ws',
      host: 'localhost',
    },
  },
})
`
}

function shellIndexHtml(title) {
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

function shellMainTsx() {
  return `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { initializeWebFragments } from 'web-fragments'

import App from './App.tsx'

initializeWebFragments()

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`
}

function shellAppTsx() {
  return `export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Shell App</h1>
      <web-fragment fragment-id="profile" />
    </div>
  );
}
`
}

function webFragmentTypes() {
  return `import type * as React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'web-fragment': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'fragment-id': string
      }
    }
  }
}

`
}

async function main() {
  const [, , rawName, rawPort] = process.argv
  if (!rawName) return usage()

  const name = toValidName(rawName)
  const port = Number(rawPort || 5173)
  const base = `/${name}/`
  const dest = path.join(SHELLS_DIR, name)

  if (await exists(dest)) {
    console.error(`❌ Shell "${name}" đã tồn tại: ${dest}`)
    process.exit(1)
  }

  // đảm bảo workspace đã có apps/shells/*
  const wsFile = path.join(ROOT, 'pnpm-workspace.yaml')
  if (!(await exists(wsFile))) {
    console.warn('⚠️  Chưa thấy pnpm-workspace.yaml ở root. Hãy thêm "apps/shells/*" vào packages.')
  }

  await mkdir(path.join(dest, 'src'), { recursive: true })
  await mkdir(path.join(dest, 'src', 'types'), { recursive: true })

  await writeFile(path.join(dest, 'package.json'), shellPkgJson(name))
  await writeFile(path.join(dest, 'tsconfig.json'), shellTsconfig())
  await writeFile(path.join(dest, 'tsconfig.app.json'), shellTsAppConfig())
  await writeFile(path.join(dest, 'tsconfig.node.json'), shellTsNodeConfig())
  await writeFile(path.join(dest, 'vite.config.ts'), shellViteConfig(port))
  await writeFile(path.join(dest, 'index.html'), shellIndexHtml(`Shell ${name}`))
  await writeFile(path.join(dest, 'src', 'main.tsx'), shellMainTsx())
  await writeFile(path.join(dest, 'src', 'App.tsx'), shellAppTsx())
  await writeFile(path.join(dest, 'src', 'types', 'web-fragment.d.ts'), webFragmentTypes())

  console.log(`✅ Tạo shell "${name}" tại ${dest}`)
  console.log(`   - base: ${base}`)
  console.log(`   - port: ${port}`)
  console.log(`➡  Tiếp theo:
  pnpm -C ${path.relative(ROOT, dest)} install
  pnpm dev   # (Turbo sẽ start fragment → shells → gateway)
`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
