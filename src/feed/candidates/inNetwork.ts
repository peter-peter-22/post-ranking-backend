import { and, desc, inArray, isNull } from "drizzle-orm";
import { db } from "../../db";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";

/** Max count of posts */
const count = 750;

export async function getInNetworkCandidates({ user }: { user: User, limit?: number, offset?: number }) {

    const followedUsers = await getFollowedUsers({ user })

    return await db
        .select()
        .from(posts)
        .where(
            and(
                isNull(posts.replyingTo),
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
}