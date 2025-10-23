import React from 'react'
import OnboardingForm from './_onboarding/onboarding.form'
import { industries } from '@/data/industries'
// import { industryInsights } from '@/db/schema'
const OnboardingPage = () => {
  return (
    <main className='pt-[8%] w-[30vw] m-auto'>
      <OnboardingForm industries={industries} />
    </main>
  )
}

export default OnboardingPage