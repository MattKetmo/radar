import { AlertsTemplate } from "@/components/alerts/template"

type Props = {
  params: Promise<{ handle: string }>
}

export default async function AlertsViewPage(props: Props) {
  const { handle } = await props.params

  return (
    <AlertsTemplate view={handle} />
  )
}

