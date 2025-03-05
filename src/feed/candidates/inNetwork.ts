import { and, desc, inArray, isNull } from "drizzle-orm";
import { db } from "../../db";
import { getFollowedUsers } from "../../db/controllers/users/getFollowers";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { isPost } from "./filters";

/** Max count of posts */
const count = 750;

/** Selecting candidate posts from the users those the viewer follows */
export async function getInNetworkCandidates({ user, followedUsers }: { user: User, followedUsers:string[] }) {
    return await db
        .select()
        .from(posts)
        .where(
            and(
                isPost,
                inArray(posts.userId, followedUsers)
            )
        )
        .orderBy(desc(posts.createdAt))
        .limit(count)
}