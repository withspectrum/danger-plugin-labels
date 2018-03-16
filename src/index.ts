// Provides dev-time type structures for  `danger` - doesn't affect runtime.
import {DangerDSLType} from "../node_modules/danger/distribution/dsl/DangerDSL"
declare var danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

export interface StringMap {
  [key: string]: string
}

export interface Options {
  labels: StringMap | string[]
}

const CHECKBOXES = /^\s*-\s*\[x\]\s*(.+?)$/gim

const getCheckedBoxes = (text: string): string[] => {
  // Full Text => ["- [x] Checked", "- [x] Also Checked"]
  const rawMatches = text.match(CHECKBOXES)
  if (!rawMatches || rawMatches.length === 0) { return [] }

  // Extract checked text from markdown checkbox
  // "- [x] Checked" => "Checked"
  return rawMatches
    .map(result => new RegExp(CHECKBOXES.source, "mi").exec(result))
    .filter(Boolean)
    .map(res => res && res[1]) as string[]
}

/**
 * Let any user add a certain set of labels to your issues and pull requests
 */
export default async function labelsPlugin(options: Options) {
  if (!options || !options.labels) { throw new Error('[danger-plugin-labels] Please specify the "labels" option.') }
  let { labels } = options

  if (Array.isArray(labels)) {
    labels = labels.reduce((obj, label) => {
      obj[label] = label
      return obj
    }, {}) as StringMap
  }

  // Lowercase all label keys
  labels = Object.keys(labels).reduce((obj, key) => {
    obj[key.toLowerCase()] = labels[key]
    return obj
  }, {}) as StringMap

  const pr = danger.github.thisPR
  const api = danger.github.api
  const potentialLabels = getCheckedBoxes(danger.github.pr.body)

  const matchingLabels = potentialLabels
    .filter(
      match => Object.keys(labels).indexOf(match.toLowerCase()) > -1
    )
    .map(key => labels[key.toLowerCase()])

  if (!matchingLabels || matchingLabels.length === 0) { return }

  await api.issues.addLabels({
    owner: pr.owner,
    repo: pr.repo,
    number: pr.number,
    labels: matchingLabels,
  })
}
