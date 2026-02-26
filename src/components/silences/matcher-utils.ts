import { MatcherOperator } from "@/types/alertmanager";

export function operatorToMatcher(
  op: MatcherOperator
): { isEqual: boolean; isRegex: boolean } {
  switch (op) {
    case "=":
      return { isEqual: true, isRegex: false };
    case "!=":
      return { isEqual: false, isRegex: false };
    case "=~":
      return { isEqual: true, isRegex: true };
    case "!~":
      return { isEqual: false, isRegex: true };
  }
}

export function matcherToOperator(
  isEqual: boolean,
  isRegex: boolean
): MatcherOperator {
  if (isRegex) return isEqual ? "=~" : "!~";
  return isEqual ? "=" : "!=";
}
