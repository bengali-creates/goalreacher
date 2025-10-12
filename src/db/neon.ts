import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'; // 👈 Step 1: Import your schema

// Step 2: Check for the environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Step 3: Create the connection client
const sql = neon(process.env.DATABASE_URL);


const db = drizzle(sql, { schema });
export default db;