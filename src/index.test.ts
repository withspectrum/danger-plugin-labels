import labels from "./index"

declare const global: any

const body = `
**Some labels below**

- [ ] Unchecked
- [x] Checked
- [ ] Another Unchecked
- [x] WIP
`

const getIssueLabels = (extraLabels: string[] = []) =>
  extraLabels.map(name => ({
    id: 123,
    url: "https://github.com",
    name,
    color: "000000",
    default: false,
  }))

describe("labels()", () => {
  beforeEach(() => {
    global.warn = jest.fn()
    global.message = jest.fn()
    global.fail = jest.fn()
    global.markdown = jest.fn()
  })

  afterEach(() => {
    global.warn = undefined
    global.message = undefined
    global.fail = undefined
    global.markdown = undefined
  })

  describe("Issue", () => {
    beforeEach(() => {
      global.danger = {
        github: {
          api: {
            issues: {
              replaceAllLabels: jest.fn(),
            },
          },
          issue: {
            body,
            number: 1,
            labels: getIssueLabels(),
          },
          repository: {
            name: "danger-plugin-labels",
            owner: {
              login: "mxstbr",
            },
          },
        },
      }
    })

    afterEach(() => {
      global.danger = undefined
    })

    it("should call replaceAllLabels for issues", async () => {
      await labels({
        rules: ["Checked", "WIP"],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].owner).toEqual(global.danger.github.repository.owner.login)
      expect(replaceAllLabels.mock.calls[0][0].repo).toEqual(global.danger.github.repository.name)
      expect(replaceAllLabels.mock.calls[0][0].number).toEqual(global.danger.github.issue.number)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })
  })

  describe("Pull Request", () => {
    beforeEach(() => {
      global.danger = {
        github: {
          thisPR: {
            owner: "mxstbr",
            repo: "danger-plugin-labels",
            number: 1,
          },
          issue: {
            labels: getIssueLabels(),
          },
          pr: {
            body,
          },
          api: {
            issues: {
              replaceAllLabels: jest.fn(),
            },
          },
        },
      }
    })
    afterEach(() => {
      global.danger = undefined
    })
    it("should call replaceAllLabels with checked labels", async () => {
      await labels({
        rules: ["Checked", "WIP"],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].owner).toEqual(global.danger.github.thisPR.owner)
      expect(replaceAllLabels.mock.calls[0][0].repo).toEqual(global.danger.github.thisPR.repo)
      expect(replaceAllLabels.mock.calls[0][0].number).toEqual(global.danger.github.thisPR.number)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should be case insenitive", async () => {
      await labels({
        rules: ["checked", "wip"],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should allow for a customizable rule config", async () => {
      await labels({
        rules: [
          {
            match: /checked/i,
            label: "Something different",
          },
        ],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should not call replaceAllLabels if there is nothing in the PR body", async () => {
      global.danger.github.pr.body = "Just some text without any labels"
      await labels({ rules: ["checked"] })

      expect(global.danger.github.api.issues.replaceAllLabels).not.toHaveBeenCalled()
    })

    it("should not call replaceAllLabels, even if there are existing labels", async () => {
      global.danger.github.issue.labels = getIssueLabels(["Existing"])
      global.danger.github.pr.body = "Just some text without any labels"
      await labels({ rules: ["checked"] })

      expect(global.danger.github.api.issues.replaceAllLabels).not.toHaveBeenCalled()
    })

    it("should call replaceAllLabels with checked and existing labels", async () => {
      global.danger.github.issue.labels = getIssueLabels(["Existing"])
      await labels({
        rules: ["Checked", "WIP"],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].owner).toEqual(global.danger.github.thisPR.owner)
      expect(replaceAllLabels.mock.calls[0][0].repo).toEqual(global.danger.github.thisPR.repo)
      expect(replaceAllLabels.mock.calls[0][0].number).toEqual(global.danger.github.thisPR.number)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should call replaceAllLabels without unchecked labels", async () => {
      global.danger.github.pr.body = "- [ ] Unchecked"
      global.danger.github.issue.labels = getIssueLabels(["Existing"])
      await labels({ rules: ["Unchecked"] })

      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should call validate with the matching labels", async () => {
      expect.assertions(2)
      await labels({
        rules: ["Checked", "WIP"],
        validate: labelList => {
          expect(labelList).toEqual(["Checked", "WIP"])
          return true
        },
      })
      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
    })

    it("should treat no return from validate as true", async () => {
      expect.assertions(2)
      const errorLabels: any = labels as any
      await errorLabels({
        rules: ["Checked", "WIP"],
        validate: labelList => {
          expect(labelList).toEqual(["Checked", "WIP"])
        },
      })
      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
    })

    it("should not call replaceAllLabels if validate returns false", async () => {
      expect.assertions(2)
      await labels({
        rules: ["Checked", "WIP"],
        validate: labelList => {
          expect(labelList).toEqual(["Checked", "WIP"])
          return false
        },
      })
      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).not.toHaveBeenCalled()
    })

    it("should allow validate to be async", async () => {
      expect.assertions(2)
      await labels({
        rules: ["Checked", "WIP"],
        validate: async labelList => {
          expect(labelList).toEqual(["Checked", "WIP"])
          await new Promise(res => setTimeout(res, 100))
          return false
        },
      })
      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).not.toHaveBeenCalled()
    })
  })
})
