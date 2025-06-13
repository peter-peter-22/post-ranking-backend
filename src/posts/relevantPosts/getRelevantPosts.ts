import { eq } from "drizzle-orm";
import { getCandidates, getCommonData } from ".";
import { db } from "../../db";
import { posts } from "../../db/schema/posts";
import { User } from "../../db/schema/users";
import { rankPosts } from "../feed/ranker";
import { hydratePostsWithSources } from "../hydratePosts";

/** Get posts from the main feed of a user. */
export async function getRelevantPosts({ user, postId }: { user: User, postId: string, limit?: number, offset?: number }) {
    // Select the main post
    const [post] = await db.select().from(posts).where(eq(posts.id, postId))
    if (!post)
        throw new Error("Post not found")
    // Select relevant posts
    const common = await getCommonData(user, post)
    let candidates = await getCandidates(common)
    // Remove the main post from the candidate list
    candidates = candidates.filter(p => p.id !== postId)
    let finalPosts = await hydratePostsWithSources(candidates, user)
    return await rankPosts(finalPosts)
}