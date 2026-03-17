import { addMinutes, addHours, addDays, addWeeks } from "date-fns"

export function parseDurationInput(input: string, referenceDate?: Date): Date | null {
  const trimmed = input.trim()

  if (!trimmed) {
    return null
  }

  const ref = referenceDate || new Date()

  const shorthandPattern = /^(\d+(?:\.\d+)?)\s*(m|min|mins|h|hr|hrs|d|day|days|w|week|weeks)$/i
  const naturalPattern = /^in\s+(\d+(?:\.\d+)?)\s*(minutes?|hours?|days?|weeks?)$/i
  const pluralPattern = /^(\d+(?:\.\d+)?)\s+(minutes?|hours?|days?|weeks?)$/i

  const shorthandMatch = trimmed.match(shorthandPattern)
  if (shorthandMatch) {
    const value = parseFloat(shorthandMatch[1])
    const unit = shorthandMatch[2].toLowerCase()

    if (value <= 0) {
      return null
    }

    switch (unit) {
      case "m":
      case "min":
      case "mins":
        return addMinutes(ref, value)
      case "h":
      case "hr":
      case "hrs":
        return addHours(ref, value)
      case "d":
      case "day":
      case "days":
        return addDays(ref, value)
      case "w":
      case "week":
      case "weeks":
        return addWeeks(ref, value)
      default:
        return null
    }
  }

  const naturalMatch = trimmed.match(naturalPattern)
  if (naturalMatch) {
    const value = parseFloat(naturalMatch[1])
    const unit = naturalMatch[2].toLowerCase()

    if (value <= 0) {
      return null
    }

    switch (unit) {
      case "minute":
      case "minutes":
        return addMinutes(ref, value)
      case "hour":
      case "hours":
        return addHours(ref, value)
      case "day":
      case "days":
        return addDays(ref, value)
      case "week":
      case "weeks":
        return addWeeks(ref, value)
      default:
        return null
    }
  }

  const pluralMatch = trimmed.match(pluralPattern)
  if (pluralMatch) {
    const value = parseFloat(pluralMatch[1])
    const unit = pluralMatch[2].toLowerCase()

    if (value <= 0) {
      return null
    }

    switch (unit) {
      case "minute":
      case "minutes":
        return addMinutes(ref, value)
      case "hour":
      case "hours":
        return addHours(ref, value)
      case "day":
      case "days":
        return addDays(ref, value)
      case "week":
      case "weeks":
        return addWeeks(ref, value)
      default:
        return null
    }
  }

  return null
}
