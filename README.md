# MobiLab Wiki

This project uses [Docusaurus](https://docusaurus.io/) `3.10.1` and publishes a static site with GitHub Actions.

## Requirements

- Node.js `18` or newer.
- npm.

The GitHub Actions workflow uses Node.js `20`.

## Local Setup

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run start
```

Docusaurus will print the local URL, usually:

```text
http://localhost:3000
```

## Build

Create a production build:

```sh
npm run build
```

The generated static files are written to:

```text
build/
```

## Serve The Production Build Locally

After building, preview the generated static site:

```sh
npm run serve
```

## Clear Docusaurus Cache

If routes, sidebars, or generated files behave unexpectedly, clear the local Docusaurus cache:

```sh
npm run clear
```

Then start or build again.

## Project Structure

```text
docs/                  Documentation pages
static/img/            Static images served from /img/*, organized by docs section
src/css/custom.css     Site theme overrides
docusaurus.config.js   Docusaurus configuration
sidebars.js            Sidebar navigation
.github/workflows/     GitHub Actions workflows
```

## Deployment

Deployment is configured in:

```text
.github/workflows/deploy.yml
```

The workflow runs on:

- Pushes to `main`.
- Manual dispatch from the GitHub Actions tab.

The workflow does:

1. Checks out this repository.
2. Installs dependencies with `npm ci`.
3. Builds the site with `npm run build`.
4. Uploads `build/` as a GitHub Pages artifact.
5. Deploys the artifact directly from this repository using GitHub Pages Actions.

No custom deploy token is required. The workflow uses the repository-provided `GITHUB_TOKEN` with `pages: write` and `id-token: write` permissions.

In the repository settings, configure GitHub Pages to use:

```text
Source: GitHub Actions
```

## GitHub Pages Target

The Docusaurus config currently builds the site for:

```text
https://mobilab-udesc.github.io/
```

with:

```js
url: 'https://mobilab-udesc.github.io'
baseUrl: '/'
```

If the target GitHub Pages repository or organization changes, update both:

- `docusaurus.config.js`
- `.github/workflows/deploy.yml`

## Content Notes

- Use Markdown files under `docs/` for documentation pages.
- Add sidebar entries in `sidebars.js` when creating pages that should appear in navigation.
- Put static assets in `static/img/`, organized by docs section, and reference them as `/img/section/file-name.ext`.
- Run `npm run build` before pushing changes that modify links, sidebars, or Docusaurus config.
