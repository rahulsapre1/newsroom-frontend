"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-[200px] flex-col border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Newsaroo Logo" width={32} height={32} />
          <span className="font-semibold">Newsaroo</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <Link
          href="/news"
          className={cn(
            "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100",
            pathname === "/news" && "bg-gray-100"
          )}
        >
          <Image src="/globe.svg" alt="News Icon" width={16} height={16} />
          <span>News</span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100",
            pathname === "/settings" && "bg-gray-100"
          )}
        >
          <Image src="/window.svg" alt="Settings Icon" width={16} height={16} />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  )
} 