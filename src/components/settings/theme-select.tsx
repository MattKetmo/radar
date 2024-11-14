import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import UiDark from "@/assets/images/ui-dark.png"
import UiLight from "@/assets/images/ui-light.png"
import UiSystem from "@/assets/images/ui-system.png"
import { Check, Minus } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

const items = [
  { id: "radio-18-r1", value: "light", label: "Light", image: UiLight },
  { id: "radio-18-r2", value: "dark", label: "Dark", image: UiDark },
  { id: "radio-18-r3", value: "system", label: "System", image: UiSystem },
]


export default function ThemeSelect() {
  const { setTheme, theme } = useTheme()

  return (

    <RadioGroup value={theme} onValueChange={setTheme} className="flex gap-3" defaultValue="r1">
      {items.map((item) => (
        <label key={item.id}>
          <RadioGroupItem
            id={item.id}
            value={item.value}
            className="peer sr-only after:absolute after:inset-0"
          />
          <Image
            src={item.image}
            alt={item.label}
            width={88}
            height={70}
            className="relative cursor-pointer overflow-hidden rounded-lg border border-input shadow-sm shadow-black/5 ring-offset-background transition-colors peer-[:focus-visible]:ring-2 peer-[:focus-visible]:ring-ring/70 peer-[:focus-visible]:ring-offset-2 peer-data-[disabled]:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-[disabled]:opacity-50"
          />
          <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
            <Check
              size={16}
              strokeWidth={2}
              className="peer-data-[state=unchecked]:group-[]:hidden"
              aria-hidden="true"
            />
            <Minus
              size={16}
              strokeWidth={2}
              className="peer-data-[state=checked]:group-[]:hidden"
              aria-hidden="true"
            />
            <span className="text-xs font-medium">{item.label}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}
