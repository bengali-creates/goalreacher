"use server"
import db from "@/db/neon"
import { auth } from "@clerk/nextjs/server"
import { eq,asc } from "drizzle-orm";
import { users } from "@/db/schema";
import { GoogleGenAI } from "@google/genai";
import { assessments } from './../src/db/schema';
import {string, z} from "zod";
import { nanoid } from "nanoid";
const ai = new GoogleGenAI({});

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuestionResult {
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export async function generateQuiz() {
   const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "",
    },
  });
    const response = result.text;
   
    const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText!);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function saveQuizResult({question,answer,score}:{question:QuizQuestion[],answer:(string | null)[],score:number}) {
   const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });

  if (!user) throw new Error("User not found");

   const questionResults = question.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answer[index],
    isCorrect: answer[index] === q.correctAnswer,
    explanation: q.explanation,
  }));
   const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;
    try{
      const result = await ai.models.generateContent({ model: "gemini-2.5-flash",
    contents: improvementPrompt,
    config: {
      systemInstruction: "",
    },
  });
    const response = result.text;
   console.log('response', response)
   improvementTip =response?.trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
    }
  }

  try {
  
    const assessment = await db.insert(assessments).values({
      id:nanoid(),
      userId: user.id,
      quizScore: score,
      questions: questionResults,
        category: "Technical",
        improvementTip,
      },).returning()

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq( users.clerkUserId, userId ),
  });

  if (!user) throw new Error("User not found");

  try {
    const assessmentsdb = await db.query.assessments.findMany({
      where: eq(assessments.userId, user.id),
      orderBy: (asc(assessments.createdAt)),
    });

    return assessmentsdb;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}