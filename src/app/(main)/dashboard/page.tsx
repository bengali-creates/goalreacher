import React from 'react'
import DashboardView from './_components/industryinsight'
import { getIndutryInsights } from 'actions/dashboard'
import { getUserOnboardingStatus } from 'actions/user'
import { redirect } from "next/navigation";
const IndustryInsight = async () => {

  const isOnboarded = await getUserOnboardingStatus()
if (!isOnboarded.isOnboarded) {
  redirect("/onboarding");
}
const insight = await getIndutryInsights()
 return (
    <div className="container mx-auto">
      <DashboardView insights={insight} />
    </div>
  );
}

export default IndustryInsight