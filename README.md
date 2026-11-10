# HCI — Lo-Fi Prototypes

Two independent Nuxt applications in one Git repository:

| Prototype | App | Directory |
| --- | --- | --- |
| 1 | Attempt First | `Prototype 1/app` |
| 2 | Prove-it | `Prototype 2/app` |

## Milestones

Each submitted milestone is frozen on its own branch, and each Vercel project serves that
branch from a fixed URL, so reviewers can still open an earlier milestone after `main`
moves on. `main` holds the latest work.

| Milestone | Branch | Prototype 1 URL | Prototype 2 URL |
| --- | --- | --- | --- |
| 2 | `milestone-2` | `hci-group-16-prototype-1.vercel.app` | `hci-group-16-prototype-2.vercel.app` |
| 3 | `milestone-3` | `hci-group-16-prototype-1-m3.vercel.app` | `hci-group-16-prototype-2-m3.vercel.app` |
| Latest | `main` | `hci-group-16-prototype-1-latest.vercel.app` | `hci-group-16-prototype-2-latest.vercel.app` |

Milestone 1 predates the deployments and has no branch. Never push to a `milestone-*`
branch after its report is submitted; start new work from `main`.

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
gets its own deployment URL, production settings, and environment variables. Both
projects use `main` as their production branch. Nuxt/Vercel handle the deployment output
and routing; no custom `vercel.json` is needed for this setup.

To freeze a new milestone `N` at submission time:

1. Create and push the branch `milestone-N` from `main`.
2. In each Vercel project, open Settings → Domains, add
   `hci-group-16-prototype-<1|2>-mN.vercel.app`, and connect it to the Git branch
   `milestone-N`.
3. Open both URLs in a private window to confirm they load without a Vercel login
   (Vercel Authentication is disabled under Settings → Deployment Protection).
4. Add the row to the milestone table above and submit those URLs.

Official reference: [Vercel monorepos](https://vercel.com/docs/monorepos).
