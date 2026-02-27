import { describe, it, expect } from "vitest"
import { operatorToMatcher, matcherToOperator } from "@/components/silences/matcher-utils"

describe("operatorToMatcher", () => {
  it("= maps to isEqual:true, isRegex:false", () => {
    expect(operatorToMatcher("=")).toEqual({ isEqual: true, isRegex: false })
  })

  it("!= maps to isEqual:false, isRegex:false", () => {
    expect(operatorToMatcher("!=")).toEqual({ isEqual: false, isRegex: false })
  })

  it("=~ maps to isEqual:true, isRegex:true", () => {
    expect(operatorToMatcher("=~")).toEqual({ isEqual: true, isRegex: true })
  })

  it("!~ maps to isEqual:false, isRegex:true", () => {
    expect(operatorToMatcher("!~")).toEqual({ isEqual: false, isRegex: true })
  })
})

describe("matcherToOperator", () => {
  it("isEqual:true, isRegex:false → =", () => {
    expect(matcherToOperator(true, false)).toBe("=")
  })

  it("isEqual:false, isRegex:false → !=", () => {
    expect(matcherToOperator(false, false)).toBe("!=")
  })

  it("isEqual:true, isRegex:true → =~", () => {
    expect(matcherToOperator(true, true)).toBe("=~")
  })

  it("isEqual:false, isRegex:true → !~", () => {
    expect(matcherToOperator(false, true)).toBe("!~")
  })
})

describe("round-trip", () => {
  it("= round-trips", () => {
    const { isEqual, isRegex } = operatorToMatcher("=")
    expect(matcherToOperator(isEqual, isRegex)).toBe("=")
  })

  it("!= round-trips", () => {
    const { isEqual, isRegex } = operatorToMatcher("!=")
    expect(matcherToOperator(isEqual, isRegex)).toBe("!=")
  })

  it("=~ round-trips", () => {
    const { isEqual, isRegex } = operatorToMatcher("=~")
    expect(matcherToOperator(isEqual, isRegex)).toBe("=~")
  })

  it("!~ round-trips", () => {
    const { isEqual, isRegex } = operatorToMatcher("!~")
    expect(matcherToOperator(isEqual, isRegex)).toBe("!~")
  })
})
