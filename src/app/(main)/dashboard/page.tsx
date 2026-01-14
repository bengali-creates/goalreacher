
import { getIndutryInsights } from 'actions/dashboard'
import { getUserOnboardingStatus } from 'actions/user'
import { redirect } from "next/navigation";

import ClientDashboardWrapper from './_components/DashboardClientWrapper';
const IndustryInsight = async () => {

  const isOnboarded = await getUserOnboardingStatus()
if (!isOnboarded.isOnboarded) {
  redirect("/onboarding");
}
 const insight = await getIndutryInsights()
  
console.log('insight', insight)
if (!insight) {
    return (
      <div className="container mx-auto">
        <p>No industry insights available. Please complete your profile.</p>
      </div>
    );
  }
  
 return (
    <div className="container mx-auto py-5">
      <ClientDashboardWrapper insights={insight} />
    </div>
  );
}

export default IndustryInsight