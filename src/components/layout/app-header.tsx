'use client'

import { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface Props {
  children: ReactNode
}

const Header = ({ children }: Props) => {
  return (
    <header className="flex text-sm items-center px-2 lg:px-6 border-b w-full h-[50px] shrink-0 bg-400">
      <div className="flex items-center gap-2 w-full">
        <SidebarTrigger />
        <div className="w-full">
          {children}
        </div>
      </div>
    </header>
  )
}

export default Header
