# danger-plugin-labels

[![Build Status](https://travis-ci.org/withspectrum/danger-plugin-labels.svg?branch=master)](https://travis-ci.org/withspectrum/danger-plugin-labels)
[![npm version](https://badge.fury.io/js/danger-plugin-labels.svg)](https://badge.fury.io/js/danger-plugin-labels)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Let any contributor (even without write permissions) add labels to their pull requests

## Usage

Install:

```sh
yarn add danger-plugin-labels --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from 'danger'
import labels from 'danger-plugin-labels'

schedule(labels({
  label: ["WIP", "Ready for Review"]
}))
```

```markdown
<!-- PULL_REQUEST_TEMPLATE.md -->

**Status (check one)**

- [ ] WIP
- [ ] Ready for Review
```

Now contributors even without write access to the repo can label their PR as "WIP" and "Ready for Review"!

### Options

#### `labels` (required)

The labels option lets you specify a whitelist of labels to apply. This can be either a map or an array:

```js
schedule(labels({
  // A checked box with "WIP" will apply the "WIP" label
  labels: ["WIP"]
}))

schedule(labels({
  // A checked box with "WIP" will apply the "Work In Progress" label
  labels: {
    WIP: 'Work In Progress'
  }
}))
```

Note that the keys are case insensitive (`wip`, `Wip` and `WIP` in the markdown would all apply the label), but the label content isn't.

## Changelog

See the GitHub [release history](https://github.com/withspectrum/danger-plugin-labels/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
