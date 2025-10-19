"use client"
import { Industry,Industries } from "@/data/industries";
import { onboardingSchema } from "@/lib/authicator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const OnboardingForm = ({industries}:Industries) => {
    const form=useForm({
        resolver:zodResolver(onboardingSchema),
        defaultValues:{
            industry:"",
            
        }
    })
    return(
        <div>
            onboarding form 
            {industries && industries.map((industry:Industry) => (
                <div key={industry.id}>
                    {industry.name}
                </div>
            ))}
        </div>
    )
}
export default OnboardingForm;