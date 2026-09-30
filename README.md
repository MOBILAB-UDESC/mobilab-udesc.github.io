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

## Contributing

Contributions are welcome. To contribute:

1. Fork or clone the repository.
2. Create a feature branch (`git checkout -b my-feature`).
3. Make your changes.
4. Run `npm run build` to verify the site builds without errors.
5. Commit and push your branch.
6. Open a pull request describing your changes.

Always create a pull request, do not push directly to `main`.

## Content Notes

### Laboratory pages

- Edit `src/data/people.yml` to maintain the People page. Each entry has `name`, `role`, `group`, `image`, `linkedin`, `lattes`, `github`, `website`, `google_scholar`, and `orcid`. Groups appear in file order; `PHD` is displayed as "PhD students".
- Set unavailable profile links and portraits to `null`. Add verified portraits under `static/img/people/` and use `/img/people/file-name.jpg` as the image value. Null images display initials.
- The `src/plugins/people.js` plugin reads YAML at build time using the `js-yaml` package already installed by Docusaurus. It watches the data file during development.
- Douglas and Alan's profile links and roles were supplied by the lab maintainer. Lattes required a CAPTCHA and LinkedIn did not expose usable portraits during research. The current advisee roster and portraits still need confirmation before adding them.
- Publications are maintained in `docs/mobilab/publications.md`, newest year first. The initial selection was checked against Douglas's ORCID and Crossref DOI records. Preserve published titles and author order; include a DOI and verify affiliations before attributing a paper to the lab.
- Contact details come from the existing lab overview and the UDESC CCT website. The listed email and telephone are campus contacts.
- Run `node --test tests/people.test.js` and `npm run build` after changing people data or rendering.

### Documentation

- Use Markdown files under `docs/` for documentation pages.
- Add sidebar entries in `sidebars.js` when creating pages that should appear in navigation.
- Put static assets in `static/img/`, organized by docs section, and reference them as `/img/section/file-name.ext`.
- Run `npm run build` before pushing changes that modify links, sidebars, or Docusaurus config.
