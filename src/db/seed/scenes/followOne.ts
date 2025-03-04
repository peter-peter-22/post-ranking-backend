import { updateEngagementAggregations } from "../../controllers/posts/engagement/engagements"
import { clearAllTables } from "../../reset/clearTables"
import { seedReplies } from "../comments"
import { seedFollows } from "../follows"
import { seedLikes } from "../likes"
import { seedPosts } from "../posts"
import { seedMainUser, seedUsers } from "../users"
import { seedViews } from "../views"
import { createFollowedUser } from "./followSimplified"

/**
 * In this scene, the main used follows one user within a normal environment.
 * @param multiplier multiplies the count of all generated rows.
 */
export async function followOneScene(multiplier: number = 1) {
    await clearAllTables()
    const mainUser = await seedMainUser()
    await seedUsers(1000 * multiplier)
    await seedPosts(100 * multiplier)
    await createFollowedUser({mainUser})
    await seedViews()
    await seedLikes()
    await seedReplies()
    await seedFollows()
    updateEngagementAggregations()
    console.log("Seeded all tables")
}