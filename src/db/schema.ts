import { date, datetime } from "drizzle-orm/mysql-core";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkUserId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  imageUrl: varchar({ length: 512 }),
  industry: varchar({ length: 512 }),
  // ceatedAt: datetime().notNull().defaultNow(),
  // updatedAt: integer().notNull().default(),
  bio: varchar({ length: 1024}),
  experience: integer().default(0)
});
