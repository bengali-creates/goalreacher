import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { type LucideIcon } from "lucide-react"

interface IconCardProps {
  title: string
  icon: React.ReactElement // Pass an icon component like <Globe />
}

export function IconCard({ title, icon }: IconCardProps) {
  return (
    
    <Card className="h-full w-full">
      <CardContent className="flex flex-col items-center justify-center p-6 h-full gap-3">
        {React.cloneElement(icon, { className: "w-8 h-8 text-blue-600" })}
        <span className="text-center font-medium">{title}</span>
      </CardContent>
    </Card>
  )
}