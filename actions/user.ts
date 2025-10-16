
"use server"
import db from "@/db/neon"
import { users,industryInsights } from "@/db/schema"
import { Industry } from "@/data/industries"
import { eq } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

interface UpdateUserData {
    industry: string;
    
}

export async function updateUser (data:UpdateUserData) {
    const { userId } = await auth()
    if (!userId) {
        throw new Error("User not authenticated")
    }
    const user= await db.query.users.findFirst({
        where: eq(users.clerkUserId, userId)
    })
    if (!user) throw new Error('User not found')

    try{
        const result=await db.transaction(async(tx)=>{
            let industryInsight=tx.query.industryInsights.findFirst({
                where:eq(industryInsights.industry,data.industry)
            })
        })

    }catch(error){
        console.error("Error updating user:", error)
        throw new Error("Error updating user")
    }
}
