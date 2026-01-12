import { BarLoader } from "react-spinners";
import { Suspense } from "react";

// Add { } around children to destructure it correctly
export default function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
   
    <div className="m-auto py-20 ">
      <div className="flex items-center justify-between">
        <h1 className="text-6xl font-bold gradient-title px-30">Industry Insights</h1>
      </div>
      
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
     
        {children}
      </Suspense>
    </div>
  );
}