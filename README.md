# Action Rush Version Policy Command
<p align="center">
  <a href="https://standardjs.com"><img alt="JavaScript Style Guide" src="https://img.shields.io/badge/code_style-standard-brightgreen.svg"></a>
  <a href="http://commitizen.github.io/cz-cli/"><img alt="Commitizen friendly" src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg"></a>
  <a href="https://github.com/advancedcsg-open/actions-rush-cmd-to-version-policy/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

This actions will execute a single cli command for each rush project that has a matching version policy as specified in the action parameters.

This was created to fill a specific gap we found in the way Rush is executed. Due to the way our apps build we need the shared modules in the monorepo to publish to NPM before we can build the app.

Using version policy to isolate groups of packages is an efficient way to do this until rush supports this natively (via tagging).

## Usage

### Pre-requisites
---
This action requires rush version 5.47.0 or newer. You will need to have run `rush install` on the monorepo before running this action. You can use [RushJS Helper](https://github.com/marketplace/actions/rushjs-helper) to do that.

### Inputs
---
#### `version-policy`
**Required**. The version policy to target when executing the command.
#### `cmd`
**Required**. The command to execute, for example `npm` or `yarn`. The command will be executed from the root folder of the project, not the root of the repository.
#### `cmd-args`
Optional. Command arguments, for example `run,publish-rt`. Note, arguments **MUST** be comma separated.

### Examples
---
#### Example 1
The below example runs `pnpm publish` on all projects that have a matching version policy.
```yaml
name: Rush Install

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2.4.1
        with:
          node-version: '12.x'

      - name: Rush Install
        uses: advancedcsg-open/actions-rush
        with:
          build: true

      - name: Rush build and publish `modules`
        uses: ./
        with:
          version-policy: modules
          cmd: pnpm
          cmd-args: publish

      - name: Rush build and publish `apps`
        uses: ./
        with:
          version-policy: apps
          cmd: pnpm
          cmd-args: publish
```
### License

actions-rush is licensed under the MIT License. See the LICENSE file for more info.
