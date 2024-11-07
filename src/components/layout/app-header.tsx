'use client'

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

const Header = ({ children }: Props) => {
  const sidebar = useSidebar()

  return (
    <header className="flex text-sm items-center px-6 border-b w-full h-[50px] shrink-0">
      <div className="flex items-center gap-2">
        {!sidebar.open ? (
          <SidebarTrigger />
        ) : null}
        <>
          {children}
        </>
      </div>
    </header>
  )
}

export default Header
