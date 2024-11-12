import { z } from "zod"

const ClusterSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Name must be alphanumeric with dashes'),
  endpoint: z.string(),
  labels: z.record(z.string()),
})

export const ViewCategorySchema = z.object({
  name: z.string(),
})

export const ViewsSchema = z.object({
  name: z.string().optional().default(''),
  groupBy: z.string(),
  category: z.string().optional().default(''),
  filters: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.array(z.string())]),
      exclude: z.boolean().optional().default(false),
      regex: z.boolean().optional().default(false),
    })
  ),
})

export const ConfigSchema = z.object({
  clusters: z.array(ClusterSchema),
  viewCategories: z.record(ViewCategorySchema),
  views: z.record(ViewsSchema),
})

export type ClusterConfig = z.infer<typeof ClusterSchema>
export type ViewCategoryConfig = z.infer<typeof ViewCategorySchema>
export type ViewConfig = z.infer<typeof ViewsSchema>
export type Config = z.infer<typeof ConfigSchema>
