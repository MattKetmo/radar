import * as fs from 'fs/promises'
import * as path from 'path'
import { Config } from './types'
import { parse as yamlParse } from 'yaml'

export async function resolveConfigFile(filenames: string[], directory: string): Promise<string> {
  for (const filename of filenames) {
    try {
      const filepath = path.resolve(directory, filename)
      const stat = await fs.stat(filepath)
      if (stat.isFile()) {
        return filepath
      }
    } catch { }
  }
  throw new Error('No config file found')
}

export async function parseConfigFile(filepath: string): Promise<Config> {
  const rawConfig = await fs.readFile(filepath, 'utf-8')
  let parsedConfig

  const fileExtension = path.extname(filepath)
  switch (fileExtension) {
    case '.json':
      parsedConfig = JSON.parse(rawConfig)
      break
    case '.yaml':
    case '.yml':
      parsedConfig = yamlParse(rawConfig)
      break
    default:
      throw new Error('Unsupported config file format: ' + fileExtension)
  }

  return parsedConfig
}


export function resolveEnvVars(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\${([^}]+)}/g, (match, key) => {
      return process.env[key] || match
    })
  } else if (Array.isArray(obj)) {
    return obj.map((item) => resolveEnvVars(item))
  } else if (typeof obj === 'object') {
    const resolvedObj: any = {}
    for (const key in obj) {
      resolvedObj[key] = resolveEnvVars(obj[key])
    }
    return resolvedObj
  } else {
    return obj
  }
}


export const memoize = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  const cache = new Map<string, ReturnType<T>>()
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    const result = await fn(...args)
    cache.set(key, result)
    return result
  }
}


export const deepMerge = <T extends { [key: string]: any }>(target: T, source: T): T => {
  const result = { ...target } as Record<string, any>;
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result as T;
};
