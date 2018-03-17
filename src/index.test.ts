import labels from "./index"

declare const global: any

const body = `
**Some labels below**

- [ ] Unchecked
- [x] Checked
- [ ] Another Unchecked
- [x] WIP
`

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
              addLabels: jest.fn(),
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

    it("should call addLabels for issues", async () => {
      await labels({
        labels: ["Checked", "WIP"],
      })
      const { addLabels } = global.danger.github.api.issues

      expect(addLabels).toHaveBeenCalledTimes(1)
      expect(addLabels.mock.calls[0][0].owner).toEqual(global.danger.github.repository.owner.login)
      expect(addLabels.mock.calls[0][0].repo).toEqual(global.danger.github.repository.name)
      expect(addLabels.mock.calls[0][0].number).toEqual(global.danger.github.issue.number)
      expect(addLabels.mock.calls[0][0].labels).toMatchSnapshot()
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
              addLabels: jest.fn(),
            },
          },
        },
      }
    })
    afterEach(() => {
      global.danger = undefined
    })
    it("should call addLabels with checked labels", async () => {
      await labels({
        labels: ["Checked", "WIP"],
      })
      const { addLabels } = global.danger.github.api.issues

      expect(addLabels).toHaveBeenCalledTimes(1)
      expect(addLabels.mock.calls[0][0].owner).toEqual(global.danger.github.thisPR.owner)
      expect(addLabels.mock.calls[0][0].repo).toEqual(global.danger.github.thisPR.repo)
      expect(addLabels.mock.calls[0][0].number).toEqual(global.danger.github.thisPR.number)
      expect(addLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should be case insenitive", async () => {
      await labels({
        labels: ["checked", "wip"],
      })
      const { addLabels } = global.danger.github.api.issues

      expect(addLabels).toHaveBeenCalledTimes(1)
      expect(addLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should allow for an object as label configuration", async () => {
      await labels({
        labels: {
          checked: "Yes Checked was checked",
          wip: "Work in Progress",
        },
      })
      const { addLabels } = global.danger.github.api.issues

      expect(addLabels).toHaveBeenCalledTimes(1)
      expect(addLabels.mock.calls[0][0].labels).toMatchSnapshot()
    })

    it("should not call addLabels if there is nothing in the PR body", async () => {
      global.danger.github.pr.body = "Just some text without any labels"
      await labels({ labels: ["checked"] })

      expect(global.danger.github.api.issues.addLabels).not.toHaveBeenCalled()
    })
  })
})
