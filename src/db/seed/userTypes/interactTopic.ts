import { eq, inArray } from "drizzle-orm";
import { db } from "../..";
import { topics } from "../../../bots/examplePosts";
import { clearMainUser } from "../../reset/clearMainUser";
import { posts } from "../../schema/posts";
import { seedReplies } from "../comments";
import { seedLikes } from "../likes";
import { seedViews } from "../views";
import { users } from "../../schema/users";
import { updateUserEmbeddingVector } from "../../../embedding/updateUserEmbedding";

//** The main user engages with the posts those are related to a topic. */
export async function mainUserTypeInteractTopic() {
    const mainUser = await clearMainUser()

    /** The topic the user likes. */
    const topic = topics[0]

    /** The posts those are related to the selected topic. */
    const relevantPosts = await db.select().from(posts).where(eq(posts.topic, topic))

    // Throw error if no posts match the chosen topic.
    if (relevantPosts.length === 0)
        throw new Error("No posts found with this topic.")

    // Set the interest of the main user to the selected topic to make the engagement generator functions work.
    mainUser.interests = [topic]

    /** The ids of the posts. */
    const postIds = relevantPosts.map(post => post.id)

    //add reactions to the posts
    await Promise.all([
        seedLikes({ posts: relevantPosts, users: [mainUser] }),
        seedViews({ postFilter: inArray(posts.id, postIds), userFilter: eq(users.id, mainUser.id) }),
        seedReplies({ posts: relevantPosts, users: [mainUser] }),
        updateUserEmbeddingVector(mainUser)
    ])

    console.log("Main user type set to \"engage topic\"")
}