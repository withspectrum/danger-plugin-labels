import { schedule } from "danger"
import labels from "./src"

schedule(
  labels({
    labels: {
      WIP: "WIP: Building",
    },
  })
)
