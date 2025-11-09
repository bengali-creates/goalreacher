
"use server";
import db from "@/db/neon";
import { users, industryInsights } from "@/db/schema";
import { Industry } from "@/data/industries";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";
import { OnboardingFormValues } from "@/app/(main)/onboarding/_onboarding/onboarding.form";
import { uuid} from 'drizzle-orm/pg-core';
interface UpdateUserData {
  industry: string;
  // subIndustry: string;
  experience: number;      // number
  skills: string[];        // array of strings
  bio?: string;
}

type DemandLevel = "HIGH" | "MEDIUM" | "LOW";
type MarketOutlook = "POSITIVE" | "NEUTRAL" | "STABLE" | "NEGATIVE";
// export interface IndustryInsightType {
//   industry: string;
//   salaryRanges: string[];
//   topSkills: string[];
//   recommendedSkills: string[];
//   keyTrends: string[];
//   growthRate: number;
//   demandLevel: DemandLevel;
//   marketOutlook: MarketOutlook;
//   nextUpdate: Date;
//   lastUpdated: Date;
// }
export type NewIndustryInsight = typeof industryInsights.$inferInsert;

export async function updateUser(data: UpdateUserData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });
  if (!user) throw new Error("User not found");

  try {
const industryInsight = await db.query.industryInsights.findFirst({
  where: eq(industryInsights.industry, data.industry),
});

if (!industryInsight) {
  const newInsightData: NewIndustryInsight = {
    industry: data.industry,
    salaryRanges: [],
    topSkills: [],
    recommendedSkills: [],
    keyTrends: [],
    growthRate: 0,
    demandLevel: "Medium",
    marketOutlook: "Positive",
    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  await db.insert(industryInsights).values(newInsightData).returning();
}

await db.update(users)
  .set({
    industry: data.industry,
    experience: data.experience,
    bio: data.bio,
    skills: data.skills,
  })
  .where(eq(users.clerkUserId, userId));
  } catch (error) {
    console.error("Error updating user:", error);
    // throw new Error("Error updating user");
  }
}
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq( users.clerkUserId, userId ),
  });

  if (!user) throw new Error("User not found");

  try {
    const user = await db.query.users.findFirst({
      where :eq(users.clerkUserId,userId),
      columns: {
    industry: true,
  },
    })

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}