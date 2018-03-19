import { schedule } from "danger"
import labels from "./src"

schedule(
  labels({
    labels: {
      enhancement: "enhancement",
      "bug fix": "bug",
    },
  })
)
