import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Home() {
  const latestPage = (await cookies()).get('latest_page')
  if (latestPage) {
    return redirect(latestPage.value)
  }

  return redirect("/alerts")
}
