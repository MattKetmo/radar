import { config } from "."

// Remove the endpoints from the client config
export const clientConfig = {
  ...config,
  clusters: config.clusters.map((c) => ({
    ...c,
    endpoint: ""
  })),
}
