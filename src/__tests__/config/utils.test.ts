import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { resolveEnvVars, deepMerge } from "@/config/utils"

describe("resolveEnvVars", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("substitutes ${VAR} in strings with env value", () => {
    process.env.MY_HOST = "localhost"
    const result = resolveEnvVars("http://${MY_HOST}:9093")
    expect(result).toBe("http://localhost:9093")
  })

  it("leaves unset env vars as-is", () => {
    delete process.env.MISSING_VAR
    const result = resolveEnvVars("${MISSING_VAR}")
    expect(result).toBe("${MISSING_VAR}")
  })

  it("resolves env vars in nested objects", () => {
    process.env.DB_HOST = "db.example.com"
    const input = { connection: { host: "${DB_HOST}", port: 5432 } }
    const result = resolveEnvVars(input)
    expect(result).toEqual({ connection: { host: "db.example.com", port: 5432 } })
  })

  it("resolves env vars in arrays", () => {
    process.env.ITEM_A = "alpha"
    process.env.ITEM_B = "beta"
    const result = resolveEnvVars(["${ITEM_A}", "${ITEM_B}", "static"])
    expect(result).toEqual(["alpha", "beta", "static"])
  })

  it("returns non-string/object/array primitives unchanged", () => {
    expect(resolveEnvVars(42)).toBe(42)
    expect(resolveEnvVars(true)).toBe(true)
    expect(resolveEnvVars(undefined)).toBe(undefined)
  })
})

describe("deepMerge", () => {
  it("merges shallow properties", () => {
    const target = { a: 1, b: 2 }
    const source = { b: 3, c: 4 }
    const result = deepMerge(target, source)
    expect(result).toEqual({ a: 1, b: 3, c: 4 })
  })

  it("deep merges nested objects", () => {
    const target = { nested: { a: 1, b: 2 } }
    const source = { nested: { b: 3, c: 4 } }
    const result = deepMerge(target, source)
    expect(result).toEqual({ nested: { a: 1, b: 3, c: 4 } })
  })

  it("does not mutate the original target", () => {
    const target = { nested: { a: 1 } }
    const source = { nested: { b: 2 } }
    deepMerge(target, source)
    expect(target).toEqual({ nested: { a: 1 } })
  })

  it("overwrites arrays instead of merging them", () => {
    const target = { items: [1, 2, 3] }
    const source = { items: [4, 5] }
    const result = deepMerge(target, source)
    expect(result).toEqual({ items: [4, 5] })
  })
})
