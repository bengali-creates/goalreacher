
"use server"
import db from "@/db/neon"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { GoogleGenAI } from "@google/genai";
import { industryInsights } from './../src/db/schema';
import {z} from "zod";

const industuInsightSchema=z.object({
  
})

const ai = new GoogleGenAI({});

export const generateAIInsights = async (industry:string) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;


  
   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "",
    },
  });
  const text = response.text;
  if (text){const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);}
  
  console.log(response.text);
};


export async function getIndutryInsights(){
    const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });
  if (!user) throw new Error("User not found");
 const userWithInsight = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
    with: {
      industryInsight: true,
    },
  });

 if (userWithInsight?.industryInsight) {
    return userWithInsight.industryInsight;
  }

  // If no insight exists and user has industry, generate one
  if (user.industry) {
    const insight = await generateAIInsights(user.industry);
    const [newInsight] = await db
      .insert(industryInsights)
      .values({
        industry: user.industry,
        ...insight,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .returning();
    return newInsight;
  }

  // No insight available
  return null;
}