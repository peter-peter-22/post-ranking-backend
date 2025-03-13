import { and, inArray, notInArray } from "drizzle-orm"
import { db } from "../.."
import { follows } from "../../schema/follows"
import { getOrGenerateCache } from "../../../redis/cachedRead"
import { UserCommon } from "../../schema/users"

/** The expiration time of the cache. */
const expiration = 60 * 5; // 5 minutes

/** Returns the ids of the users who are followed by the provided user ids, while excluding these ids.
 * @param user The selected user.
 * @param followedUsers The ids of the followed users.
 * @returns The ids of the indirectly followed users
*/
export async function getIndirectFollowedUsers({user, followedUsers }: {user:UserCommon, followedUsers: string[] }): Promise<string[]> {

    /** Get the ids of the indirect followeds of a user. */
    const query = async () => {
        return (
            await db
                .selectDistinct({
                    id: follows.followedId,
                })
                .from(follows)
                .where(and(
                    inArray(follows.followerId, followedUsers),
                    notInArray(follows.followedId, followedUsers)
                ))
        ).map(follow => follow.id)
    }

    // Use the cache.
    return await getOrGenerateCache<string[]>(`users/${user.id}/followers`, query, expiration)
} 