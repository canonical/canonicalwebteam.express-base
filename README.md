# canonicalwebteam.express-base

Express base application used to create Canonical's websites.
It fulfils the same role as [flask-base](https://github.com/canonical/canonicalwebteam.flask-base) 
for websites based on Expressjs framework.

## Usage

TODO

## How to contribute

The scripts in `package.json` contain all the different actions needed to work on the project:
- *build*: triggers the build of the project, which will create the corresponding `dist` folders with all the Typescript
transpiled to JS for each package.
- *format*: runs the formatter on all the files, reporting problems according to the Biome rules.
- *format:fix*: runs the formatter on all files, fixing problems according to the Biome rules.
- *lint*: runs the linter on all the files, reporting problems according to the Biome rules.
- *lint:fix*: runs the linter on all the files, fixing problems according to the Biome rules.
- *check*: runs the linter, the formatter and the imports organizer (everything according to the Biome rules), reporting problems.
- *check:fix*: runs the linter, the formatter and the imports organizer (everything according to the Biome rules), fixing problems found.

## Architecture

### Husky

There is a 'pre-commit' hook that is run before every commit to make sure that the project guidelines are
fulfilled. This hook runs the script for formatting, linting and testing the project.

The script is found in `.husky/pre-commit`.





# Vite + RSC

This example shows how to set up a React application with [Server Component](https://react.dev/reference/rsc/server-components) features on Vite using [`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc).

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/starter)

```sh
# run dev server
npm run dev

# build for production and preview
npm run build
npm run preview
```

## API usage

See [`@vitejs/plugin-rsc`](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc) for the documentation.

- [`vite.config.ts`](./vite.config.ts)
  - `@vitejs/plugin-rsc/plugin`
- [`./src/framework/entry.rsc.tsx`](./src/framework/entry.rsc.tsx)
  - `@vitejs/plugin-rsc/rsc`
  - `import.meta.viteRsc.loadModule`
- [`./src/framework/entry.ssr.tsx`](./src/framework/entry.ssr.tsx)
  - `@vitejs/plugin-rsc/ssr`
  - `import.meta.viteRsc.loadBootstrapScriptContent`
  - `rsc-html-stream/server`
- [`./src/framework/entry.browser.tsx`](./src/framework/entry.browser.tsx)
  - `@vitejs/plugin-rsc/browser`
  - `rsc-html-stream/client`

## Notes

- [`./src/framework/entry.{browser,rsc,ssr}.tsx`](./src/framework) (with inline comments) provides an overview of how low level RSC (React flight) API can be used to build RSC framework.
- You can use [`vite-plugin-inspect`](https://github.com/antfu-collective/vite-plugin-inspect) to understand how `"use client"` and `"use server"` directives are transformed internally.

## Deployment

See [vite-plugin-rsc-deploy-example](https://github.com/hi-ogawa/vite-plugin-rsc-deploy-example)
