# HCI — Lo-Fi Prototypes

Two independent Nuxt applications in one Git repository:

| Prototype | App | Directory |
| --- | --- | --- |
| 1 | Attempt First | `Prototype 1/app` |
| 2 | Prove-it | `Prototype 2/app` |

## Milestones

We work on `main`; its current state is always live at the `-latest` URL. When a
milestone is ready, `main` is copied into a new branch `milestone-X`, which gets its own
`-milestone-X` URL, and that URL goes into the report. Milestone branches are frozen, so
reviewers can still open an earlier milestone after `main` moves on.

| Version | Branch | Prototype 1 URL |
| --- | --- | --- |
| Latest | `main` | `hci-group-16-prototype-1-latest.vercel.app` |
| Milestone 3 | `milestone-3` | `hci-group-16-prototype-1-milestone-3.vercel.app` |
| Milestone 2 | `milestone-2` | `hci-group-16-prototype-1-milestone-2.vercel.app` |

- The Milestone 2 report linked `hci-group-16-prototype-1.vercel.app`, which now
  redirects (307) to the `-milestone-2` URL.
- Milestone 1 predates the deployments and has no branch.
- Prototype 2 is not under active development and has no milestone URLs yet. Its
  submitted URL, `hci-group-16-prototype-2.vercel.app`, still serves `main`: give it
  the same setup before changing Prototype 2 on `main`.
- Never push to a `milestone-*` branch after its report is submitted; start new work
  from `main`.

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

To freeze milestone `X` at submission time:

1. Create and push the branch `milestone-X` from `main`.
2. In the Vercel project, open Settings → Domains, add
   `hci-group-16-prototype-1-milestone-X.vercel.app`, and connect it to the Git branch
   `milestone-X`. If it shows "No Deployment", open Deployments → ⋯ → Create Deployment
   and deploy the branch `milestone-X`.
3. Open the URL in a private window to confirm it loads without a Vercel login
   (Vercel Authentication is disabled under Settings → Deployment Protection).
4. Add the row to the table above and put that URL in the report.

Official reference: [Vercel monorepos](https://vercel.com/docs/monorepos).
