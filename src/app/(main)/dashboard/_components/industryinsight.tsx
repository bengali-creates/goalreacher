"use client "
import React from 'react'
import { NewIndustryInsight } from 'actions/user'
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
} from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card,CardContent,CardDescription,CardTitle,CardHeader } from '@/components/ui/card';
import { format, formatDistanceToNow } from "date-fns";
import { Progress } from '@/components/ui/progress';
import { BarChart,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,Bar } from 'recharts';

interface DashboardViewProps {
  insights: NewIndustryInsight | NewIndustryInsight[] | undefined
}

const DashboardView = ({ insights }: DashboardViewProps) => {
  if (!insights) {
    return <div>No insights available</div>
  } 
  // Handle both single insight and array of insights
  const insightArray = Array.isArray(insights) ? insights : [insights]
  const salaryData=insightArray[0]?.salaryRanges?.map((range:any)=>({
    name:range.role,
    min:range.min/1000 ,
    max:range.max/1000,
    median:range.median/1000
  }))
  console.log('salaryData', salaryData)
 const getDemandLevelColor = (level:"High"|"Medium"|"Low") => {
    switch (level.toLowerCase()) {
      case "High":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook:any) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };
 
const OutlookIcon = getMarketOutlookInfo(insightArray[0]?.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insightArray[0]?.marketOutlook).color;

  const latestUpdate = insightArray[0]?.lastUpdated 
  ? format(new Date(insightArray[0].lastUpdated), 'dd/MM/yyyy') 
  : 'No data available'
  const newUpdate = insightArray[0]?.nextUpdate
  ? formatDistanceToNow(new Date(insightArray[0].nextUpdate), {addSuffix:true}) 
  : 'No data available'
  return (
     <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last updated: {latestUpdate}</Badge>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insightArray[0]?.marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {newUpdate}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insightArray[0]?.growthRate.toFixed(1)}%
            </div>
            <Progress value={insightArray[0]?.growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insightArray[0]?.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insightArray[0]?.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {/* {if(insightArray[0]?.topSkills){} */
              insightArray[0]?.topSkills?.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
</div>
        {/* graphs for salary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Range by Role </CardTitle>
             <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
        </Card>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Industry Trends</CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insightArray[0]?.keyTrends?.map((trend, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <span>{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended Skills</CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {insightArray[0]?.recommendedSkills?.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      </div>
  )
}

export default DashboardView