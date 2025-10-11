// schema.ts

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  real,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums for cleaner, type-safe columns
export const coverLetterStatusEnum = pgEnum('cover_letter_status', ['draft', 'completed']);
export const demandLevelEnum = pgEnum('demand_level', ['High', 'Medium', 'Low']);
export const marketOutlookEnum = pgEnum('market_outlook', ['Positive', 'Neutral', 'Negative']);

// -- TABLE DEFINITIONS --

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: varchar('clerk_user_id').notNull().unique(),
  email: varchar('email').notNull().unique(),
  name: varchar('name'),
  imageUrl: varchar('image_url'),
  industry: varchar('industry').references(() => industryInsights.industry),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),

  // Profile fields
  bio: text('bio'),
  experience: integer('experience'),

  // Relations
  skills: text('skills').array().notNull().default([]),
});

export const assessments = pgTable('assessments', {
  id: varchar('id', { length: 25 }).primaryKey(), // Using varchar for CUIDs
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  quizScore: real('quiz_score').notNull(),
  questions: jsonb('questions').array().notNull().default([]),
  category: varchar('category').notNull(),
  improvementTip: text('improvement_tip'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    userIdIndex: index('assessment_user_id_idx').on(table.userId),
  };
});

export const resumes = pgTable('resumes', {
  id: varchar('id', { length: 25 }).primaryKey(), // Using varchar for CUIDs
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  atsScore: real('ats_score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const coverLetters = pgTable('cover_letters', {
  id: varchar('id', { length: 25 }).primaryKey(), // Using varchar for CUIDs
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  jobDescription: text('job_description'),
  companyName: varchar('company_name').notNull(),
  jobTitle: varchar('job_title').notNull(),
  status: coverLetterStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => {
  return {
    userIdIndex: index('cover_letter_user_id_idx').on(table.userId),
  };
});

export const industryInsights = pgTable('industry_insights', {
  id: varchar('id', { length: 25 }).primaryKey(), // Using varchar for CUIDs
  industry: varchar('industry').notNull().unique(),

  // Salary data
  salaryRanges: jsonb('salary_ranges').array().notNull().default([]),

  // Industry trends
  growthRate: real('growth_rate').notNull(),
  demandLevel: demandLevelEnum('demand_level').notNull(),
  topSkills: text('top_skills').array().notNull().default([]),

  // Market conditions
  marketOutlook: marketOutlookEnum('market_outlook').notNull(),
  keyTrends: text('key_trends').array().notNull().default([]),

  // Learning suggestions
  recommendedSkills: text('recommended_skills').array().notNull().default([]),

  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  nextUpdate: timestamp('next_update').notNull(),
}, (table) => {
  return {
    industryIndex: index('industry_idx').on(table.industry),
  };
});


// -- RELATIONS --

export const usersRelations = relations(users, ({ one, many }) => ({
  industryInsight: one(industryInsights, {
    fields: [users.industry],
    references: [industryInsights.industry],
  }),
  assessments: many(assessments),
  resume: one(resumes),
  coverLetters: many(coverLetters),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
  user: one(users, {
    fields: [coverLetters.userId],
    references: [users.id],
  }),
}));

export const industryInsightsRelations = relations(industryInsights, ({ many }) => ({
  users: many(users),
}));