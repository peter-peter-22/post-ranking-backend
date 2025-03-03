import { aliasedTable, and, eq, exists, isNull } from "drizzle-orm";
import { db } from "..";
import { chunkedInsert } from "../chunkedInsert";
import { updateClickCounts } from "../controllers/posts/engagement/clicks/count";
import { updateViewCounts } from "../controllers/posts/engagement/views/count";
import { clicks, ClicksToInsert } from "../schema/clicks";
import { likes } from "../schema/likes";
import { posts } from "../schema/posts";
import { users } from "../schema/users";
import { views, ViewToInsert } from "../schema/views";

const comments = aliasedTable(posts, "comments")

/**Create organic views and clicks for all posts based on the engagements and randomity. */
export async function seedViews() {
    /**The chance of viewing a post the user didn't interacted with. */
    const chanceToView = 0.5;
    /**The chance of clicking a post the viewed but didnt replied to. Relative to the engaging modifier of the post. */
    const relativeChanceToClick = 1;

    /**What interactions the users did the posts.*/
    const userInteractions = await db
        .select({
            postId: posts.id,
            userId: users.id,
            engaging: posts.engaging,
            commented: exists(db.select().from(comments).where(and(eq(comments.replyingTo, posts.id), eq(users.id, comments.userId)))),
            liked: exists(db.select().from(likes).where(and(eq(likes.postId, posts.id), eq(likes.userId, users.id)))),
        })
        .from(posts)
        .where(isNull(posts.replyingTo))
        .leftJoin(users, eq(users.bot, true))

    /**What posts the users viewed. 
    ** When a user reacted to a post, a view is be added regardless of randomity.
    */
    const viewsToInsert: ViewToInsert[] = []

    /**What posts the clicked viewed. 
    ** When a user commented to a post, a click is be added regardless of randomity.
    */
    const clicksToInsert: ViewToInsert[] = []

    //generate the clicks and views 
    userInteractions.forEach(({ postId, userId, engaging, commented, liked }) => {
        const view = commented || liked || Math.random() < chanceToView;
        const click = commented || view && Math.random() < relativeChanceToClick * engaging;
        if (view) viewsToInsert.push({ postId, userId })
        if (click) clicksToInsert.push({ postId, userId })
    })

    //insert views
    await chunkedInsert(viewsToInsert, async (rows: ViewToInsert[]) => {
        await db.insert(views)
            .values(rows)
            .onConflictDoNothing();
    })
    await updateViewCounts()

    //insert clicks
    await chunkedInsert(clicksToInsert, async (rows: ClicksToInsert[]) => {
        await db.insert(clicks)
            .values(rows)
            .onConflictDoNothing();
    })
    await updateClickCounts()

    console.log(`Created ${viewsToInsert.length} views and ${clicksToInsert.length} clicks`)
}