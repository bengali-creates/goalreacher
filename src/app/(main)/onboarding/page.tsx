import React from 'react'
import OnboardingForm from './_onboarding/onboarding.form'
import { industries } from '@/data/industries'
// import { industryInsights } from '@/db/schema'
const OnboardingPage = () => {
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  )
}

export default OnboardingPage