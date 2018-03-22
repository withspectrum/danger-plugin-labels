import { schedule } from "danger"
import labels from "./src"

schedule(
  labels({
    rules: [
      "Enhancement",
      {
        match: /bug fix/i,
        label: "bug",
      },
    ],
  })
)
