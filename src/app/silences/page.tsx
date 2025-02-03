import SilencesTemplate from "@/components/silences/template";
import { SilencesProvider } from "@/contexts/silences";

export default function SilencesPage() {
  return (
    <SilencesProvider>
      <SilencesTemplate />
    </SilencesProvider>
  )
}
