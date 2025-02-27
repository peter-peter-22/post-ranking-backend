import { seedReplies } from "./comments";
import { seedFollows } from "./follows";
import { seedLikes } from "./likes";
import { seedPosts } from "./posts";
import { seedMainUser, seedUsers } from "./users";
import { seedViews } from "./views";

/**
 * Seed all tables with test data and create the main user.
 * 
 * @param multiplier multiplies the count of all generated rows.
 */
export async function seedAll(multiplier: number = 1) {
    await seedMainUser()
    await seedUsers(1000 * multiplier)
    await seedPosts(100 * multiplier)
    await seedViews()
    await seedLikes()
    await seedReplies()
    await seedFollows(200 * multiplier)
    console.log("Seeded all tables")
}