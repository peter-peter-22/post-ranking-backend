import { User } from "../../db/schema/users";
import { getCandidates, getCommonData } from ".";
import { rankPosts } from "../feed/ranker";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { eq } from "drizzle-orm";

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, postId, limit = 50, offset = 0 }: { user: User, postId: string, limit?: number, offset?: number }) {
    // Select the main post
    const [post] = await db.select().from(posts).where(eq(posts.id,postId))
    if(!post)
        throw new Error("Post not found")
    // Select relevant posts
    const common = await getCommonData(user,post)
    const candidates = await getCandidates(common)
    const finalPosts = await rankPosts(candidates)
    return finalPosts
}