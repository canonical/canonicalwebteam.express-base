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
