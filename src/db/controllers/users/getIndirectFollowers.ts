import { and, inArray, notInArray } from "drizzle-orm"
import { db } from "../.."
import { follows } from "../../schema/follows"

/** Returns the ids of the users who are followed by the provided user ids, while excluding these ids.
 * @param followedUsers The ids of the followed users.
 * @returns The ids of the indirectly followed users
*/
export async function getIndirectFollowedUsers({ followedUsers }: { followedUsers: string[] }): Promise<string[]> {
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