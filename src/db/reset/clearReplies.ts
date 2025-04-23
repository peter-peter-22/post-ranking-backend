import { db } from '..';
import { isReply } from '../controllers/posts/filters';
import { posts } from '../schema/posts';

/**
 * Clear all replies from posts.
 */
export async function clearReplies() {
    await db.delete(posts).where(isReply())
}