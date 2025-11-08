# 🧩 MicroFE SOP — Scalable Micro-Frontend Monorepo

[![Node.js](https://img.shields.io/badge/Node-22.x-green?logo=node.js)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?logo=pnpm)](https://pnpm.io)
[![Turbo](https://img.shields.io/badge/TurboRepo-2.x-blue?logo=vercel)](https://turbo.build)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A **modern micro-frontend architecture** powered by **Turbo**, **pnpm**, and **Vite**.  
This repository provides a scalable foundation to build independent **shells** and **fragments**,  
connected through a unified **Gateway** with shared **UI packages** (React / Vue / Angular).

---

## 🏗️ Monorepo Structure

```
microFE_SOP/
├── apps/
│   ├── gateway/          # Node.js gateway (Express + web-fragments)
│   └── shells/           # Frontend shells (host applications)
│       ├── portal/
│       └── admin/
├── fragments/            # Independent micro-frontend fragments
│   ├── profile/
│   └── chat/
├── packages/             # Shared libraries
│   ├── ui-react/         # React UI components (Ant Design based)
│   ├── ui-vue/           # Vue UI components
│   ├── ui-angular/       # Angular UI components
│   └── tokens/           # Design tokens & themes
├── scripts/              # Utilities and generators
├── turbo.json            # Turbo build pipeline config
├── pnpm-workspace.yaml   # Workspace definition
└── package.json          # Root configuration
```

---

## ⚙️ Tech Stack

| Layer | Tech | Description |
|:------|:-----|:-------------|
| **Orchestration** | [Turbo Repo](https://turbo.build) | Incremental build & task runner |
| **Package Management** | [pnpm](https://pnpm.io) | Fast, disk-efficient monorepo management |
| **Frontend Frameworks** | React 19 / Vue 3 / Angular 17 | Multi-framework fragments and shells |
| **Bundler & Dev Server** | [Vite 7](https://vitejs.dev) | Lightning-fast HMR, ESM-based build |
| **UI Library** | [Ant Design](https://ant.design) | Shared design system components |
| **Gateway** | Express + web-fragments | Fragment registry, runtime composition |
| **Linter / Formatter** | [Biome](https://biomejs.dev) | Unified lint + format + fix tool |
| **Language** | TypeScript 5.9 | Strict types & isolated builds |

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git https://github.com/vtp1201/micro_frontend_sop.git
cd microFE_SOP
```

### 2️⃣ Install dependencies
```bash
pnpm install
```
> Requires **Node v22.12+** (use `.nvmrc` or Volta to auto-switch).

### 3️⃣ Development
```bash
pnpm dev
```
This starts:
- All fragments (`vite` dev servers)
- All shells (`portal`, `admin`)
- The gateway (`express` proxy + fragment middleware)

| Service | Default Port | Env Variable |
|:---------|:-------------|:-------------|
| Gateway | `3000` | `GATEWAY_PORT` |
| Shell Portal | `5173` | `SHELL_PORT` |
| Fragment Profile | `5174` | `PROFILE_PORT` |

### 4️⃣ Build
```bash
pnpm build
```
Turbo will automatically build fragments → shells → gateway in dependency order.

### 5️⃣ Lint, Format, and Type Check
```bash
pnpm lint
pnpm fmt
pnpm typecheck
```

---

## 🧱 Shared Packages

| Package | Description |
|:---------|:-------------|
| `@sop/ui-react` | Shared React components using Ant Design |
| `@sop/ui-vue` | Shared Vue 3 components |
| `@sop/ui-angular` | Shared Angular 17 components |
| `@sop/tokens` | Design tokens (colors, typography, spacing) |

Each UI package is cross-framework aligned for consistent design and can be published independently via `workspace:*`.

---

## 🔄 Turbo Pipeline Overview

| Task | Description | Caching |
|:------|:-------------|:---------|
| `dev` | Run all fragments + shells concurrently | ❌ |
| `build` | Full build (fragments → shells → gateway) | ✅ |
| `lint`, `fmt`, `fix`, `typecheck` | Quality & tooling tasks | ❌ |

Turbo’s persistent tasks (`dev:*`) remain hot-reloading, while build tasks leverage caching for faster CI/CD.

---

## 💡 Development Philosophy

> **“Micro-frontends without chaos.”**  
> Each fragment and shell is fully independent yet seamlessly composed through the Gateway.  
> Shared design tokens and UI libraries ensure visual consistency and faster delivery.

---

## 🧭 Environment Management

- **Node version** pinned via `.nvmrc` (`22.12.0`)  
  or [Volta](https://volta.sh) (`"volta": { "node": "22.12.0", "pnpm": "9.x" }`).
- **Ports** and runtime configs set via `.env` files or Turbo globalEnv (`SHELL_PORT`, `PROFILE_PORT`, `GATEWAY_PORT`).

---

## 🧰 Scripts Summary

At the root:

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "biome check .",
    "fmt": "biome format --write .",
    "typecheck": "tsc -b --noEmit",
    "clean": "node scripts/clean-node-modules.mjs"
  }
}
```

Each package (shells, fragments) defines its own `dev:*` and `build:*` scripts, allowing independent operation.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## 👥 Maintainers

| Name | Role |
|:------|:------|
| **Phạm Thắng (Viet Thang Pham)** | Creator / Architect / Maintainer |

---

> _Built with ❤️ for modular front-end systems, developer experience, and long-term scalability._
