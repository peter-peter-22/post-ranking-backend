import { and, desc, inArray, isNull, notInArray } from "drizzle-orm";
import { db } from "../../db";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { getIndirectFollowedUsers } from "../../db/controllers/users/getIndirectFollowers";
import { isPost } from "./filters";

/** Max count of posts */
const count = 450;

/** Selecting candidate posts from the users the  */
export async function getInNetworkCandidates({ user, followedUsers }: { user: User, followedUsers: string[] }) {
    const indirectlyFollowedUsers = await getIndirectFollowedUsers({ followedUsers })
    return await db
        .select()
        .from(posts)
        .where(
            and(
                isPost,
                inArray(posts.userId, indirectlyFollowedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
}