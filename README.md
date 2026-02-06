# canonicalwebteam.express-base

Express base application used to create Canonical's websites.
It fulfils the same role as [flask-base](https://github.com/canonical/canonicalwebteam.flask-base) 
for websites based on Expressjs framework.

The project also contains an example website that uses the features from express-base to be able
to test them without needing to start any other project.

## Requirements

The *only requirement you need to install* to run the project locally is [Taskfile](https://taskfile.dev/).
The tasks available are the same as for the rest of web projects and you can check their definition in Taskfile.yaml.
Taskfile will take care of installing all the needed requirements - this works for Linux and MacOS.

With Taskfile we manage the installation of [Mise](https://mise.jdx.dev/) (if not already installed)
and the needed backends to run the project (yarn).

Through yarn we will then install all the node modules required for the project. Given that this project runs the
backend with [Express](https://expressjs.com/), there's no need for Python or other dependencies.

## Usage

You are able to run all the scripts from the root of the project using Taskfile. To start running a local development
version of the project run:

```bash
task dev
```

The dependencies will be installed automatically and a Node server will be started at port 3010 with the example
website. The running server has HMR enabled to ease working with the FE of the example website.
If you modify the server code of the example website you'll need to restart the server manually.
If you modify any of the *packages/* you'll have to re-build the project (`task build`) and restart the server.

If you want to run the same version that will be run in [Demos](https://demos.haus/) environment:

```bash
task start
```

This runs the example website as in Production environment and doesn't come with HMR.

## How to contribute

Clone the project and then in the root folder you can run:

```bash
task dev
```

To start the development server and start working. The client code of the example website has HMR, so you can modify files,
save the changes and see them live in a few seconds. The "example" website is for testing the features of the libraries.
It is deployed at *http://localhost:3010*.

Once you are happy with your changes you can run:

```bash
task check
```

That makes sure that the project follows the appropriate linting, formatting and import sorting.

Finally, before pushing you can run all the tests and the coverage tool with:

```bash
task test
```

There's a Husky hook that ensures that this runs before pushing each commit too.

The changes are published to NPM when merged to the *main* branch.
**WARNING**: remember to update the appropriate versions in the Pull Request.

## Architecture

This project is architected as follows:

```text
canonicalwebteam.express-base
|__ example
|__ packages
    |__ express-base
    |__ express-middlewares
    |__ yaml-responses
```

It uses [Lerna](https://lerna.js.org/) to manage running scripts for the multiple packages.
It uses [Yarn](https://classic.yarnpkg.com/en/) as package manager.
It uses [Husky](https://typicode.github.io/husky/) to enforce the linting rules before pushing and also that the tests pass.
It uses [Vitest](https://vitest.dev/) to unit test the project.
It uses [Istanbul](https://istanbul.js.org/) to track the coverage of the testing in the project.

### Scripts

The scripts in `package.json` contain all the different actions needed to work on the project:
- *dev*: starts the example website in development mode.
- *build*: triggers the build of the project, which will create the corresponding `dist` folders with all the Typescript
transpiled to JS for each package.
- *start*: starts the example website in production mode. The build needs to have been done first.
- *format*: runs the formatter on all the files, reporting problems according to the Biome rules.
- *format:fix*: runs the formatter on all files, fixing problems according to the Biome rules.
- *lint*: runs the linter on all the files, reporting problems according to the Biome rules.
- *lint:fix*: runs the linter on all the files, fixing problems according to the Biome rules.
- *check*: runs the linter, the formatter and the imports organizer (everything according to the Biome rules), reporting problems.
- *check:fix*: runs the linter, the formatter and the imports organizer (everything according to the Biome rules), fixing problems found.
- *test*: runs all the unit tests and the coverage for the project.
- *publish*: this runs the script to publish the package to NPM.

### Husky

There is a 'pre-commit' hook that is run before every commit to make sure that the project guidelines are
fulfilled. This hook runs the script for formatting, linting and testing the project.

The script is found in `.husky/pre-commit`.

### Testing

TODO
