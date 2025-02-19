import { isEqual } from "date-fns";
import { z } from "zod";

export const AlertSchema = z.object({
  labels: z.record(z.string()),
  annotations: z.record(z.string()),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/), // ISO 8601 format
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
  generatorURL: z.string(),
  fingerprint: z.string(),
  status: z.object({
    inhibitedBy: z.array(z.string()),
    silencedBy: z.array(z.string()),
    state: z.string(),
  }),
})

export type Alert = z.infer<typeof AlertSchema>

export const SilenceSchema = z.object({
  id: z.string(),
  matchers: z.array(z.object({
    name: z.string(),
    value: z.string(),
    isEqual: z.boolean(),
    isRegex: z.boolean(),
  })),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
  endsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
  createdBy: z.string(),
  comment: z.string(),
  status: z.object({
    state: z.string(),
  }),
})

export type Silence = z.infer<typeof SilenceSchema>
