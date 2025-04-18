import { inArray } from "drizzle-orm";
import { db } from "../..";
import { posts } from "../../schema/posts";

/** Get a nested map of what users replied to what posts. */
async function getCommenterMap(affectedPosts: string[]) {
    // Get the replies those affect thes selected posts from the db
    const allReplies = await db
        .select()
        .from(posts)
        .where(
            inArray(posts.replyingTo, affectedPosts)
        );

    // Build the nested map
    const replyMap = new Map<string, Set<string>>();

    // Add the posts
    affectedPosts.forEach(post => {
        replyMap.set(post, new Set<string>());
    });

    // Add the replies
    allReplies.forEach(reply => {
        if(reply.replyingTo === null) return; // Skip if this isn't a reply. (for typescript)
        replyMap.get(reply.replyingTo)?.add(reply.userId);
    });

    return replyMap
}

/**
 * Fetch the replies of the selected posts and create a function that returns the users who replied to the post.
 * @returns A function that returns the users who replied to the post.
 */
export async function getCommenterChecker(affectedPosts: string[]) {
    console.log("Creating commenter checker...")
    const commenterMap = await getCommenterMap(affectedPosts)
    console.log("Commenter checker created")
    return (postId: string): Set<string>|undefined => {
        return commenterMap.get(postId);
    }
}