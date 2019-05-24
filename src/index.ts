// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export interface StringMap {
  [key: string]: string
}

export interface Rule {
  match: RegExp
  label: string
}

export type RuleInput = string | Rule

export interface Options {
  rules: RuleInput[]
  validate?: (labels: string[]) => Promise<boolean> | boolean
}

const CHECKBOXES = /^[\t ]*-[\t ]*\[x\][\t ]*(.+?)$/gim
const UNCHECKEDBOXES = /^[\t ]*-[\t ]*\[[\t ]*\][\t ]*(.+?)$/gim

const getCheckedBoxes = (text: string): string[] => {
  // Full Text => ["- [x] Checked", "- [x] Also Checked"]
  const rawMatches = text.match(CHECKBOXES)
  if (!rawMatches || rawMatches.length === 0) {
    return []
  }

  // Extract checked text from markdown checkbox
  // "- [x] Checked" => "Checked"
  return rawMatches
    .map(result => new RegExp(CHECKBOXES.source, "mi").exec(result))
    .filter(Boolean)
    .map(res => res && res[1]) as string[]
}

const getUncheckedBoxes = (text: string): string[] => {
  // Full Text => ["- [ ] Unchecked", "- [  ] Also Unchecked"]
  const rawMatches = text.match(UNCHECKEDBOXES)
  if (!rawMatches || rawMatches.length === 0) {
    return []
  }

  // Extract checked text from markdown checkbox
  // "- [ ] Unchecked" => "Unchecked"
  return rawMatches
    .map(result => new RegExp(UNCHECKEDBOXES.source, "mi").exec(result))
    .filter(Boolean)
    .map(res => res && res[1]) as string[]
}

/**
 * Let any user add a certain set of labels to your issues and pull requests
 */
export default async function labelsPlugin(options: Options) {
  if (!options || !options.rules) {
    throw new Error('[danger-plugin-labels] Please specify the "rules" option.')
  }
  const { rules: input, validate } = options

  const rules = input.map(rule => {
    if (typeof rule !== "string") {
      return rule
    }

    return {
      match: new RegExp(rule, "i"),
      label: rule,
    }
  }) as Rule[]

  const api = danger.github.api
  let issue = { number: 0, repo: "", owner: "" }
  const existingLabels = danger.github.issue.labels.map(({ name }) => name)
  let text = ""
  // PR
  if (danger.github.thisPR) {
    const pr = danger.github.thisPR
    text = danger.github.pr.body
    issue = { number: pr.number, repo: pr.repo, owner: pr.owner }
    // Issue
  } else {
    const gh = danger.github as any
    text = gh.issue.body
    issue = { number: gh.issue.number, repo: gh.repository.name, owner: gh.repository.owner.login }
  }

  const matchingLabels = getCheckedBoxes(text)
    .map(label => {
      const rule = rules.find(r => r.match.test(label))
      if (!rule) {
        return null
      }
      return rule.label
    })
    .filter(Boolean) as string[]

  const uncheckedLabels = getUncheckedBoxes(text).reduce((labels, label) => {
    const rule = rules.find(r => r.match.test(label))
    if (!rule) {
      return labels
    }
    return [...labels, label]
  }, [])

  if (matchingLabels.length === 0 && uncheckedLabels.length === 0) {
    return
  }

  if (validate && (await validate(matchingLabels)) === false) {
    return
  }

  const replacementLabels = [
    ...matchingLabels,
    ...existingLabels.filter(label => uncheckedLabels.indexOf(label) === -1),
  ].filter((item, pos, ar) => ar.indexOf(item) === pos) as string[]

  await api.issues.replaceLabels({
    ...issue,
    labels: replacementLabels,
  })
}
