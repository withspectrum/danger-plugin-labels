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
  jest.fn(() =>
    Promise.resolve({
      data: extraLabels.map(name => ({
        id: 123,
        url: "https://github.com",
        name,
        color: "000000",
        default: false,
      })),
    })
  )

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
              getIssueLabels: getIssueLabels(),
            },
          },
          issue: {
            body,
            number: 1,
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
        labels: ["Checked", "WIP"],
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
          pr: {
            body,
          },
          api: {
            issues: {
              replaceAllLabels: jest.fn(),
              getIssueLabels: getIssueLabels(),
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
        labels: ["Checked", "WIP"],
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
        labels: ["checked", "wip"],
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should allow for an object as label configuration", async () => {
      await labels({
        labels: {
          checked: "Yes Checked was checked",
          wip: "Work in Progress",
        },
      })
      const { replaceAllLabels } = global.danger.github.api.issues

      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should not call replaceAllLabels if there is nothing in the PR body", async () => {
      global.danger.github.pr.body = "Just some text without any labels"
      await labels({ labels: ["checked"] })

      expect(global.danger.github.api.issues.replaceAllLabels).not.toHaveBeenCalled()
    })

    it("should not call replaceAllLabels, even if there are existing labels", async () => {
      global.danger.github.api.issues.getIssueLabels = getIssueLabels(["Existing"])
      global.danger.github.pr.body = "Just some text without any labels"
      await labels({ labels: ["checked"] })

      expect(global.danger.github.api.issues.replaceAllLabels).not.toHaveBeenCalled()
    })

    it("should call replaceAllLabels with checked and existing labels", async () => {
      global.danger.github.api.issues.getIssueLabels = getIssueLabels(["Existing"])
      await labels({
        labels: ["Checked", "WIP"],
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
      global.danger.github.api.issues.getIssueLabels = getIssueLabels(["Unchecked"])
      await labels({ labels: ["Unchecked"] })

      const { replaceAllLabels } = global.danger.github.api.issues
      expect(replaceAllLabels).toHaveBeenCalledTimes(1)
      expect(replaceAllLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })
  })
})
