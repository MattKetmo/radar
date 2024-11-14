import { Config } from "./types";

export const defaultConfigFiles = [
  'config.json',
  'config.yaml',
  'config.yml',
]

export const defaultConfig: Config = {
  clusters: [],
  viewCategories: {},
  views: {},
}
