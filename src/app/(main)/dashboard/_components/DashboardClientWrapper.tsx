"use client"; 
import dynamic from 'next/dynamic';

const DashboardView = dynamic(
  () => import('./industryinsight'), 
  { 
    ssr: false, 
    loading: () => <div className="h-[400px] w-full bg-muted animate-pulse rounded-lg" /> 
  }
);

export default function ClientDashboardWrapper({ insights }: { insights: any }) {
  return <DashboardView insights={insights} />;
}