import { Silence } from "@/types/alertmanager"

export type Group = {
  name: string
  silences: Silence[]
}

