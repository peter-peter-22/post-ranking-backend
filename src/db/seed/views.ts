import { aliasedTable, eq, exists, sql } from "drizzle-orm";
import { db } from "..";
import { updateViewCounts } from "../controllers/views/count";
import { posts } from "../schema/posts";
import { users } from "../schema/users";
import { views, ViewToInsert } from "../schema/views";
import { getAllBots } from "./utils";
import { likes } from "../schema/likes";

const comments = aliasedTable(posts, "comments")

/**Create organic views for all posts.
 **Generates views based on the engagements and randomity. 
 */
export async function seedViews() {
    /**the chance to view a post without interacting with it*/
    const minChanceToView = 50;

    /**What interactions the users did the posts.*/
    const userInteractions = await db
        .select({
            postId: posts.id,
            userId: users.id,
            commented: exists(db.select().from(comments).where(eq(comments.replyingTo, posts.id))),
            liked: exists(db.select().from(likes).where(eq(likes.postId, posts.id))),
        })
        .from(posts)
        .leftJoin(users, sql<boolean>`true`)

    /**What posts the users viewed. 
     ** When a user reacted to a post, a view is be added regardless of randomity.
     */
    const viewsToInsert: ViewToInsert[] = userInteractions
        .filter(({ commented, liked }) => (commented || liked || minChanceToView > Math.random() * 100))
        .map(({ postId, userId }) => ({
            postId,
            userId,
        }))

    await db.insert(views)
        .values(viewsToInsert)
        .onConflictDoNothing();
    updateViewCounts()

    console.log(`Created ${viewsToInsert.length} views`)
}