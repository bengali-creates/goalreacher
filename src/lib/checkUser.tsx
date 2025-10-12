import { currentUser } from "@clerk/nextjs/server";
import db  from "@/db/neon"; // Assuming 'db' is your exported Drizzle instance
import { users } from "@/db/schema"; // Import the users table schema
import { eq } from "drizzle-orm";

  const checkUser = async () => {
  const user = await currentUser();

 
  if (!user) {
   
    return null;
  }

 
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, user.id),
  });

  
  if (existingUser) {
    return existingUser;
  }

  
  try {
    const name = user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '';

    const [newUser] = await db.insert(users).values({
        clerkUserId: user.id,
        name: name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      }).returning(); // .returning() sends the new user data back

    return newUser;

  } catch (error) {
    console.error("Error creating new user in database:", error);
    // Depending on your app's needs, you might want to re-throw the error
    // or return null to indicate failure.
    return null;
  }
};

export default checkUser;