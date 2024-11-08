import { parseConfigFile, resolveConfigFile, resolveEnvVars } from './utils'
import { Config, ConfigSchema } from './types'

const defaultConfigFiles = [
  'config.json',
  'config.yaml',
  'config.yml',
]

/* eslint-disable @typescript-eslint/no-explicit-any */
const memoize = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  const cache = new Map<string, ReturnType<T>>()
  return async function(...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    const result = await fn(...args)
    cache.set(key, result)
    return result
  }
}

export const getConfig = memoize(async function() {
  const configPath = process.env.APP_CONFIG || await resolveConfigFile(defaultConfigFiles, process.cwd())

  console.log(`Using config file: ${configPath}`)

  const parsedConfig = await parseConfigFile(configPath)
  const resolvedConfig = resolveEnvVars(parsedConfig)

  const validatedConfig = ConfigSchema.safeParse(resolvedConfig)
  if (!validatedConfig.success) {
    throw new Error('Invalid config file: ' + validatedConfig.error.errors)
  }

  const config: Config = validatedConfig.data

  return config
})
