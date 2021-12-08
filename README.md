<div align="center">
  <img src="img/logo.png" width="230" height="80" alt="Dog in glasses" />
  <h1>Doka Labeler</h1>
</div>

[![Testing](https://github.com/doka-guide/doka-labeler/actions/workflows/test.yaml/badge.svg)](https://github.com/doka-guide/doka-labeler/actions/workflows/test.yaml)

Automatically label pull requests based on multiple criteria with minimal configuration:
* files added, deleted, renamed, or modified
* assignees
* front matter of markdown files
* your custom rules

## Example

Set "design review" label if PR contains a new HTML file in the _src_ folder:

```yml
"design review":
  files:
    added: src/**/*.html
```

## Comparison with other labelers

- Doka Labeler — set labels PRs based on files and their statuses, assignees, front matter, and more with readable configuration.
- [Official Github Labeler](https://github.com/marketplace/actions/labeler) — can assign labels by file path presented in the PR. Cannot assign labels based on file status.
- [PR Labeler](https://github.com/marketplace/actions/pr-labeler) — assign labels based on branch name.
- [Label Mastermind](https://github.com/marketplace/actions/label-mastermind) — can do everything, but has a complex configuration


## Getting Started

### Create labeler config
Create `.github/labeler.yml` with a list of labels and conditions for applying them.

The key is the name of the label in your repository (e.g., "refactor" or "design review needed"). The value is a set of conditions described below. The action adds a label only when _all conditions match_ (logical AND).

#### PR contains certain `files`

Use the `files` condition to label a PR that contains files matching a glob

For example, add label "tests" when the PR contains files ending with `.spec.js`:

```yml
tests:
  files:
    - src/**/*.spec.js
```

You can fine-tune the file path condition by checking the type of the change for a file:
* `added`
* `modified`
* `renamed`
* `removed`

Add label "danger" when a PR contains a deleted file:

```yml
danger:
  files:
    removed: src/**/*
```

If many qualifiers are defined, any of them must match (logical OR). For example, set label "dependencies" when a PR changes
`package.json` or adds a new file to the `lib` folder:

```yml
dependencies:
  files:
    modified: package.json
    added: lib/**/*
```

#### PR has a certain `assignee`

Use the `assignee` condition to label PR, which was assigned to a certain user.
If several usernames are listed, any of them can be assigned to fulfill the condition.

For example, label PR "blocked" when it was assigned to [nlopin](https://github.com/nlopin) or [igsekor](https://github.com/igsekor):

```yml
blocked:
  assignee:
    - nlopin
    - igsekor
```

#### PR matches `meta` data from your markdown files

Use the `meta` condition to label PR, which has certain values from your Markdown metadata (aka front matter).

For example, apply the label "article" when the front matter of the file has an "article" tag:

```yml
article:
  meta:
    tags: "article"
```

## Label strategies

You can configure how labels are added to the PR by adding a `labeler-strategy` key to the configuration:

- `replace`(default) - set new labels and drop all the current labels that do not fulfill the conditions
- `append` - append new labels without affecting the existing ones

You can also configure individual labels by adding a key `strategy` with one or many values:

- `create-if-missing` - create a label if it does not exist
- `alone` - if a label with this mark matches the conditions, only it will be added to the PR even if other labels are matching as well (e.g., label PR "invalid" if it changes `package-lock.json` and do not assign other labels)

## Common Examples

```yml
labeler-strategy: append # only add new labels, never remove already assigned

# add "module:registration" when a PR contains changes of the `registration` folder
"module:registration":
  - files: src/modules/registration/**/*


# add "module:auth" when changes are in the `auth` folder
"module:auth":
  - files: src/modules/auth/**/*


# add "editor-review" label when a PR adds markdown files to the "content" folder,
# the PR is assigned to editor and
# meta data of the file contains tag "article":
editor-review:
  - files:
      added: content/**/*.md
  - assignee: editor
  - meta:
      tags: "article"


# add label "invalid" when "package-lock.json" is removed and do not assign other labels:
invalid:
  - strategy:
    - only
    - create-if-missing
  - files:
      removed: package-lock.json
```

### Create Workflow

Create a workflow (eg: .github/workflows/labeler.yml see [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)) to apply the labeler for the repository:

```yaml
name: Labeler

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  labeling:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run labeler
        uses: doka-guide/doka-labeler@v1
        with:
          token: "${{ secrets.GITHUB_TOKEN }}"
          config: ".github/labeler.yml"
```

_Note: This grants access to the GITHUB_TOKEN so the action can make calls to GitHub's rest API_

Inputs are defined in `[action.yml](https://github.com/doka-guide/doka-labeler/blob/main/action.yml)` to configure the labeler:

| Name | Description | Default |
| - | - | - |
| `token` | Token to use to authorize label changes. Typically the GITHUB_TOKEN secret | N/A |
| `config` | The path to the label configuration file | `.github/labeler.yml` |
| `strategy` | The global strategy for labels | `'append'` |
