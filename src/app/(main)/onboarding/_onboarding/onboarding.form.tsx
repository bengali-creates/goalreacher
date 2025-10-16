import { Industry,Industries } from "@/data/industries";

const OnboardingForm = ({industries}:Industries) => {
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