import { and, desc, inArray, isNull, notInArray } from "drizzle-orm";
import { db } from "../../db";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { getIndirectFollowedUsers } from "../../db/controllers/users/getIndirectFollowers";
import { noReplies } from "./filters";

/** Max count of posts */
const count = 350;

/** Selecting candidate posts from the users those the user follows indirectly.*/
export async function getSocialGraphExpansionCandidates({ user, followedUsers }: { user: User, followedUsers: string[] }) {
    const indirectlyFollowedUsers = await getIndirectFollowedUsers({ followedUsers })
    return await db
        .select()
        .from(posts)
        .where(
            and(
                noReplies,
                inArray(posts.userId, indirectlyFollowedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
}