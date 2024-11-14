import { deepMerge, memoize, parseConfigFile, resolveConfigFile, resolveEnvVars } from './utils'
import { Config, ConfigSchema } from './types'
import { defaultConfig, defaultConfigFiles } from './default'

export const getConfig = memoize(async function () {
  const configPath = process.env.APP_CONFIG || await resolveConfigFile(defaultConfigFiles, process.cwd())

  console.log(`Using config file: ${configPath}`)

  const parsedConfig = await parseConfigFile(configPath)
  const resolvedConfig = resolveEnvVars(parsedConfig)

  const validatedConfig = ConfigSchema.safeParse(resolvedConfig)
  if (!validatedConfig.success) {
    throw new Error('Invalid config file: ' + validatedConfig.error.errors)
  }

  const config = validatedConfig.data

  return deepMerge<Config>(defaultConfig, config)
})
