import { db } from "../..";
import { Engagement, getEngagements, ViewerPublisherRelationship } from "../../../bots/getEngagements";
import { updateUserClusters } from "../../../clusters/updateClusters";
import { updateUserEmbeddings } from "../../../embedding/updateUserEmbedding";
import { updateTrendsList } from "../../../trends/calculateTrends";
import { shuffleArray } from "../../../utilities/arrays/shuffleArray";
import { insertEngagements } from "../../controllers/posts/insertEngagement";
import { getFollowChecker } from "../../controllers/users/getFollowChecker";
import { clearTables } from "../../reset/clearTables";
import { Post, posts } from "../../schema/posts";
import { User } from "../../schema/users";
import { getAllBots } from "../utils";

/**
 * Create random and organic engagements.
 */
export async function seedEngagements() {
  // Clear existing engagements, and other related tables.
  await clearTables(["likes", "views", "clicks", "clusters", "trends", "user_vector_updates"])
  // Generate engagements
  await createEngagements()
  // Update engagement related tables.
  await updateUserEmbeddings()
  await updateUserClusters()
  await updateTrendsList()
  console.log("Seeded all tables")
}

async function createEngagements() {
  // Get the users and posts.
  const pairs = await getUsersAndPosts()
  // Get the follow checker
  const checkFollow = await getFollowChecker()
  /** The chance to view a post */
  const viewChance = 0.3
  // Process the pairs
  const allEngagements: Engagement[] = []
  for (const [user, post] of pairs) {
    // Get the relationship between the viewer and the publisher.
    const relationship: ViewerPublisherRelationship = {
      followed: checkFollow(user.id, post.userId)
    }
    // Get if the user seen this post.
    const seen = Math.random() < viewChance
    if (!seen) continue // Skip if the user didn't see the post.
    // Generate the engagements for the post.
    const engagements = getEngagements(user, post, relationship)
    allEngagements.push(engagements)
  }
  // Insert the engagements into the database.
  await insertEngagements(allEngagements) //TODO insert in the for loop per 100 cycles, and calculate engagement history
}

/** 
 * Get all user and post pairs in randomized order.
  @returns Array of pairs. 
  */
async function getUsersAndPosts(): Promise<[User, Post][]> {
  const allUsers = await getAllBots()
  const allPosts = await db.select().from(posts)
  /** All users paired with all posts. */
  let pairs: [User, Post][] = allUsers.flatMap((user) => allPosts.map((post) => [user, post] as [User, Post]))
  pairs = shuffleArray(pairs); // Randomize the order of pairs here
  return pairs
}