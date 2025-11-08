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
const pascal = (s) => String(s).replace(/(^|[-_\s]+)([a-z])/g, (_, __, c) => c.toUpperCase())

const pkgJson = (id, port) => `{
  "name": "fragment-${id}-next",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p ${port}",
    "build": "next build",
    "start": "next start -p ${port}",
    "typecheck": "tsc -b --noEmit",
    "lint": "biome check .",
    "fmt": "biome format --write .",
    "fix": "biome check --write ."
  },
  "dependencies": {
    "next": "^15.0.3",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "typescript": "latest"
  }
}
`

const tsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
`

const nextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`

const nextConfig = (base) => `/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '${base.slice(0, -1)}', // '/_fragment/<id>'
  // DEV: tránh 302 bằng cách rewrite mọi đường dẫn sang basePath
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'accept', value: 'text/html' }],
        destination: '${base}'
      }
    ];
  }
};
export default nextConfig;
`

const appLayout = `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html><body>{children}</body></html>
  );
}
`

const appPage = (id) => `export default function ${pascal(id)}Page() {
  return (
    <div style={{ border:'1px dashed #999', padding:16, borderRadius:8 }}>
      <h2>Next.js Fragment</h2>
      <Counter />
    </div>
  );
}

function Counter() {
  const [c, setC] = React.useState(0);
  React.useEffect(() => {
    const bc = new BroadcastChannel('/demo');
    const on = (e) => { if (e.data?.type === 'ping') setC((x)=>x+1); };
    bc.addEventListener('message', on);
    return () => { bc.removeEventListener('message', on); bc.close(); };
  }, []);
  return <p>Broadcast pings: {c}</p>;
}
`

async function main() {
  const [, , rawId, rawPort] = process.argv
  if (!rawId) {
    console.log('Usage: pnpm new:fragment:next <id> [port]')
    process.exit(1)
  }
  const id = toId(rawId)
  const port = Number(rawPort || 5180)
  const base = `/_fragment/${id}/`
  const dest = path.join(FRAG_DIR, id)
  if (await exists(dest)) {
    console.error(`❌ Fragment "${id}" đã tồn tại: ${dest}`)
    process.exit(1)
  }

  await mkdir(path.join(dest, 'app'), { recursive: true })

  await writeFile(path.join(dest, 'package.json'), pkgJson(id, port))
  await writeFile(path.join(dest, 'tsconfig.json'), tsconfig)
  await writeFile(path.join(dest, 'next-env.d.ts'), nextEnv)
  await writeFile(path.join(dest, 'next.config.mjs'), nextConfig(base))
  await writeFile(path.join(dest, 'app', 'layout.tsx'), appLayout)
  await writeFile(path.join(dest, 'app', 'page.tsx'), appPage(id))

  console.log(`✅ Tạo Next.js fragment "${id}" tại ${dest}`)
  console.log(`➡  pnpm -C fragments/${id} install`)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
