import { db } from "..";
import { updateViewCounts } from "../controllers/views/count";
import { posts } from "../schema/posts";
import { views, ViewToInsert } from "../schema/views";
import { getAllBots } from "./utils";

/**Create organic likes for all posts*/
export async function seedViews() {
    const allBots = await getAllBots()
    const allPosts = await db.select().from(posts);
    const viewsToInsert: ViewToInsert[] = allBots.flatMap(bot => allPosts.map(post => ({
        postId: post.id,
        userId: bot.id
    })))
    await db.insert(views)
        .values(viewsToInsert)
        .onConflictDoNothing();
    updateViewCounts()
    console.log(`Created ${viewsToInsert.length} views`)
}