# danger-plugin-labels

[![Build Status](https://travis-ci.org/withspectrum/danger-plugin-labels.svg?branch=master)](https://travis-ci.org/withspectrum/danger-plugin-labels)
[![npm version](https://badge.fury.io/js/danger-plugin-labels.svg)](https://badge.fury.io/js/danger-plugin-labels)

> Let any contributor add labels to their pull requests and issues

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
  rules: [
    { match: /WIP/i, label: 'Work In Progress' },
    { match: /Ready for Review/i, label: 'Ready for Review' }
  ]
}))
```

```markdown
<!-- PULL_REQUEST_TEMPLATE.md -->

**Status (check one)**

- [ ] WIP
- [ ] Ready for Review
```

Now contributors even without write access to the repo can label their PR as "Work In Progress" and "Ready for Review"!

> Note: There is experimental issue support if you're using [Peril](https://github.com/danger/peril) and point the `issue` event hook to your Dangerfile. No guarantees it won't break though!

### Options

#### `rules` (required)

Rules lets you specify which labels to apply depending on which checkboxes are ticked:

```js
schedule(labels({
  // A checked box with "WIP" will apply the "Work In Progress" label
  rules: [{
    match: /WIP/i,
    label: "Work In Progress"
  }]
}))
```

Because it's tedious to repeat the same string twice if the label matches the checkbox, you can also provide the shorthand notation:

```
schedule(labels({
  // A checked box with "WIP" will apply the "WIP" label
  rules: ["WIP"]
}))
```

> Note: The checkbox text in this case is case insensitive (`wip`, `Wip` and `WIP` in the markdown would all apply the label), but the label content isn't. (GitHub treats "WIP" as a separate label than "wip", make sure to match the text exactly!)

#### `validate`

A function that's called with all the matching labels, allowing you to accept or reject them by returnng `true` or `false`, respectively. This is useful for a number of things, for example to limit the maximum number of labels selected:


```
import { fail } from 'danger';

schedule(labels({
  rules: [/* ... */],
  validate: (labels) => {
    if (labels.length < 1 || labels.length > 3) {
      fail('Please specify at least one and at most 3 labels.');
      return false;
    }

    return true;
  }
}))
```

This method can also be asynchronous so you can do all sorts of cool stuff, like close issues that users want to label as questions:

```
import { fail } from 'danger';

schedule(labels({
  rules: [/* ... */],
  validate: async (labels) => {
    if (labels.includes('Question')) {
      fail('Please direct questions to the community on Spectrum.')
      await closeIssue();
      return false;
    }
    return true;
  }
}))
```

## Changelog

See the GitHub [release history](https://github.com/withspectrum/danger-plugin-labels/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
