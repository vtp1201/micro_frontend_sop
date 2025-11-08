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

microFE_SOP/
├── apps/
│ ├── gateway/ # Node.js gateway (Express + web-fragments)
│ └── shells/ # Frontend shells (host applications)
│ ├── portal/
│ └── admin/
├── fragments/ # Independent micro-frontend fragments
│ ├── profile/
│ ├── chat/
│ └── .../
├── packages/ # Shared libraries
│ ├── ui-react/ # React UI components (Ant Design based)
│ ├── ui-vue/ # Vue UI components
│ ├── ui-angular/ # Angular UI components
│ └── tokens/ # Design tokens & themes
├── scripts/ # Utilities and generators
├── turbo.json # Turbo build pipeline config
├── pnpm-workspace.yaml # Workspace definition
└── package.json # Root configuration

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
git clone https://github.com/<your-org>/microFE_SOP.git
cd microFE_SOP
