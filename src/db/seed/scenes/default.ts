import { updateUserEmbeddings } from "../../../embedding/updateUserEmbedding";
import { seedReplies } from "../comments";
import { seedFollows } from "../follows";
import { seedLikes } from "../likes";
import { seedPosts } from "../posts";
import { seedMainUser, seedUsers } from "../users";
import { seedViews } from "../views";
import { updateUserClusters } from "../../../clusters/updateClusters";
import { updateTrendsList } from "../../../trends/calculateTrends";

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
    await updateUserEmbeddings()
    await updateUserClusters()
    await updateTrendsList()
    console.log("Seeded all tables")
}