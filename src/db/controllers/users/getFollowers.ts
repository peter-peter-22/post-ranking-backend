import { eq } from "drizzle-orm"
import { db } from "../.."
import { follows } from "../../schema/follows"
import { User } from "../../schema/users"

export async function getFollowedUsers({ user }: { user: User }): Promise<string[]> {
    return (
        await db
            .select({
                id: follows.followedId,
            })
            .from(follows)
            .where(eq(follows.followerId, user.id))
    ).map(follow => follow.id)
} 