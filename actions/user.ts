"use server";
import db from "@/db/neon";
import { users, industryInsights } from "@/db/schema";
import { Industry } from "@/data/industries";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { createId } from "@paralleldrive/cuid2";

interface UpdateUserData {
  industry: string;
}

type DemandLevel = "HIGH" | "MEDIUM" | "LOW";
type MarketOutlook = "POSITIVE" | "NEUTRAL" | "STABLE" | "NEGATIVE";
// interface IndustryInsightInsert {
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
type NewIndustryInsight = typeof industryInsights.$inferInsert;

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

    const result = await db.transaction(async (tx) => {
      let industryInsight = tx.query.industryInsights.findFirst({
        where: eq(industryInsights.industry, data.industry),
      });
      if (!industryInsight) {
        const newInsightData: NewIndustryInsight = {
          id: createId(), // Don't forget to generate the ID
          industry: data.industry,
          salaryRanges: [], // Correctly typed as jsonb[]
          topSkills: [],
          recommendedSkills: [],
          keyTrends: [],
          growthRate: 0,
          demandLevel: "Medium",
          marketOutlook: "Positive",
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          // `lastUpdated` is handled by `defaultNow()` and is optional here
        };
        const [newInsight] = await tx
          .insert(industryInsights)
          .values(newInsightData)
          .returning();
      }
       await tx.update(users)
      .set({
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      })
      .where(eq(users.id, userId));
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Error updating user");
  }
}
