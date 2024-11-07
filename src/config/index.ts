import { parseConfigFile, resolveConfigFile, resolveEnvVars} from './utils'
import { Config, ConfigSchema } from './types'

const defaultConfigFiles = [
  'config.json',
  'config.yaml',
  'config.yml',
]

const configPath = process.env.APP_CONFIG || await resolveConfigFile(defaultConfigFiles, process.cwd())

console.log(`Using config file: ${configPath}`)

const parsedConfig = await parseConfigFile(configPath)
const resolvedConfig = resolveEnvVars(parsedConfig)

const validatedConfig = ConfigSchema.safeParse(resolvedConfig)
if (!validatedConfig.success) {
  throw new Error('Invalid config file: ' + validatedConfig.error.errors)
}

export const config: Config = validatedConfig.data
