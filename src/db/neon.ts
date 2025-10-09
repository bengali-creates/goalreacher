import { drizzle } from 'drizzle-orm/neon-http';


const db =()=>{
    
    try{
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined in environment variables");
      }
      const conn=drizzle(process.env.DATABASE_URL);
      console.log('connection to the database has been established', )
      return conn;
    }
    catch(err){
        console.error("Error initializing database connection:", err);
    }
}
     
export default db;