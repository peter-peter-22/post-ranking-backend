import { eq } from "drizzle-orm"
import { db } from "../.."
import { getOrGenerateCache } from "../../../redis/cachedRead"
import { follows } from "../../schema/follows"
import { UserCommon } from "../../schema/users"

/** The expiration time of the cache. */
const expiration = 60 * 5; // 5 minutes

/** Get the ids of the users those are followed by the selected user.
 * @param user The selected user.
 * @returns The ids of the followed users.
*/
export async function getFollowedUsers({ user }: { user: UserCommon }): Promise<string[]> {
    /** Get the ids of the followeds of a user. */
    const query = async () => {
        return (
            await db
                .select()
                .from(follows)
                .where(eq(follows.followerId, user.id))
        ).map(follow => follow.followedId)
    }

    // Use the cache.
    return await getOrGenerateCache<string[]>(`users/${user.id}/followers`, query, expiration)
} 