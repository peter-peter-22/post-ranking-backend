import { eq } from "drizzle-orm";
import { db } from "..";
import { User, users } from "../schema/users";
import { Post } from "../schema/posts";

/**
 * Return all users those are marked as bots
 * @returns array of users
 */
export async function getAllBots(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.bot, true));
}

/**
 * Return if the post is engaging enough to make the user interact.
 * @param multiplier 
 * @param post The tested post
 * @param user The user who is looking at the post 
 * @returns True if interaction should happen
 * @todo Give a small chance to interact when user is not interested in the topic but follows the publisher of the post
 */
export function isEngaging({ post, user, multiplier = 1 }: { post: Post, user: User, multiplier?: number }): boolean {
    /** Is the topic of the post among the interests of the user? */
    const interested = post.topic && user.interests.includes(post.topic)

    //if not interested, no engagement
    if (!interested)
        return false

    /** The chance for engagement. */
    const engagementProbability = multiplier * post.engaging;

    //if the motivation is enough, return true
    return Math.random() < engagementProbability
}