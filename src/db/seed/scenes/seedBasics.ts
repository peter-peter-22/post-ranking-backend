import { clearAllTables } from "../../reset/clearTables";
import { seedFollows } from "../follows";
import { seedPosts } from "../posts";
import { seedMainUser, seedUsers } from "../users";

/**
 * Seed users, the main user, posts, and follows.
 */
export async function seedBasics() {
    await clearAllTables()
    await seedMainUser()
    const allUsers = await seedUsers(10000)
    await seedPosts(1000 )
    await seedFollows({ from: allUsers, to: allUsers })
    console.log("Seeded basics")
}