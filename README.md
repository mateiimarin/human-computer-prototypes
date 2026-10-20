# HCI — Lo-Fi Prototypes

Two independent Nuxt applications in one Git repository:

| Prototype | App | Directory |
| --- | --- | --- |
| 1 | Attempt First | `Prototype 1/app` |
| 2 | Prove-it | `Prototype 2/app` |

Each app has its own dependencies and committed `package-lock.json`. The package at
the repository root is design tooling, not an npm workspace or either app's build entry point.

## Local development

Use Node.js 24 (`nvm use` if you use nvm). Install and run from the chosen app directory:

```sh
cd "Prototype 1/app" # or "Prototype 2/app"
npm ci
npm run dev
```

Prototype 1 runs on port 3000; Prototype 2 runs on port 3002. Both use authored demo
content and browser-local state; neither currently requires API keys or environment variables.
See each app's README for walkthroughs and test commands.

## Before committing

Run Git commands from this shared `Lo-Fi Prototypes` folder. Keep both apps as ordinary
directories in this repository, with one `.git` directory here.

- Commit source, design references, documentation, `package.json`, and `package-lock.json` files.
- Dependencies, Nuxt outputs, logs, test reports, local environment files, and Vercel
  project settings are ignored. Authored screenshots and design assets remain included.
- If environment variables are introduced later, document names with placeholder values
  in `.env.example`; keep real values in local environment files and Vercel project settings.
- Review `git status --short` and `git diff --cached` after staging.
- Run `npm test`, `npm run typecheck`, and `npm run build` in each app before release.
  Browser tests are available through `npm run test:e2e` and require Chrome as configured
  in each app's Playwright configuration.

## Deploy both apps to Vercel

Push this folder as one Git repository, then import that same repository into Vercel twice,
creating two separate projects:

| Vercel setting | Attempt First | Prove-it |
| --- | --- | --- |
| Suggested project name | `attempt-first` | `prove-it` |
| Root Directory | `Prototype 1/app` | `Prototype 2/app` |
| Framework Preset | Nuxt | Nuxt |
| Node.js Version | 24.x | 24.x |
| Install Command | `npm ci` | `npm ci` |
| Build Command | `npm run build` | `npm run build` |
| Output Directory | Framework default | Framework default |

The paths above are relative to this folder as the Git repository root. Each project
gets its own deployment URL, production settings, and environment variables. Configure
the same production branch in both projects to deploy both prototypes from your commits.
Nuxt/Vercel handle the deployment output and routing; no custom `vercel.json` is needed
for this setup.

Official reference: [Vercel monorepos](https://vercel.com/docs/monorepos).
