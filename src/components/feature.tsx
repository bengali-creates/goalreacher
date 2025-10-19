import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeatureCardProps {
  title: string
  description: string
  children: React.ReactNode // This is where the image will go
}

export function FeatureCard({ title, description, children }: FeatureCardProps) {
  return (
   
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {children}
      </CardContent>
    </Card>
  )
}