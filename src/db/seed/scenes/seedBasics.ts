import { seedFollows } from "../follows";
import { seedPosts } from "../posts";
import { seedMainUser, seedUsers } from "../users";

/**
 * Seed users, the main user, posts, and follows.
 * 
 * @param multiplier multiplies the count of all generated rows.
 */
export async function seedBasics(multiplier: number = 1) {
    await seedMainUser()
    const allUsers = await seedUsers(10000 * multiplier)
    const allPosts = await seedPosts(1000 * multiplier)
    await seedFollows({ from: allUsers, to: allUsers })
    console.log("Seeded basics")
}