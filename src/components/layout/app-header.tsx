'use client'

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

const Header = ({ children }: Props) => {
  const sidebar = useSidebar()

  return (
    <header className="flex text-sm items-center px-6 border-b w-full h-[50px] shrink-0 bg-400">
      <div className="flex items-center gap-2 w-full">
        {!sidebar.open ? (
          <SidebarTrigger />
        ) : null}
        <div className="w-full">
          {children}
        </div>
      </div>
    </header>
  )
}

export default Header
