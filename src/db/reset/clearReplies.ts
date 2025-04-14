import { isNotNull } from 'drizzle-orm';
import { posts } from '../schema/posts';
import { db } from '..';

/**
 * Clear all replies from posts.
 */
export async function clearReplies() {
    await db.delete(posts).where(isNotNull(posts.replyingTo))
}