import { AlertsTemplate } from "@/components/alerts/template"
import { config } from "@/config"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ handle: string }>
}

export default async function AlertsViewPage(props: Props) {
  const { handle } = await props.params

  if (!config.views[handle]) {
    return notFound()
  }

  return (
    <AlertsTemplate view={handle} />
  )
}

