import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
 
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-4xl md:text-6xl font-bold gradient-title tracking-tight">
          Industry Insights
        </h1>
      </div>
      
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {/* The children will now start exactly where the title starts */}
        <div className="w-full">
          {children}
        </div>
      </Suspense>
    </div>
  );
}