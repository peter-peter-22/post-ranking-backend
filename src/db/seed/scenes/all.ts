import { updateEngagementAggregations } from "../../controllers/posts/engagement/engagements";
import { seedReplies } from "../comments";
import { seedFollows } from "../follows";
import { seedLikes } from "../likes";
import { seedPosts } from "../posts";
import { seedMainUser, seedUsers } from "../users";
import { seedViews } from "../views";

/**
 * Seed all tables with test data and create the main user.
 * 
 * @param multiplier multiplies the count of all generated rows.
 */
export async function seedAll(multiplier: number = 1) {
    await seedMainUser()
    const allUsers = await seedUsers(1000 * multiplier)
    const allPosts = await seedPosts(500 * multiplier)
    await seedLikes({ users: allUsers, posts: allPosts })
    await seedReplies({ users: allUsers, posts: allPosts })
    await seedFollows({ from: allUsers, to: allUsers })
    await seedViews({})
    await updateEngagementAggregations();
    console.log("Seeded all tables")
}