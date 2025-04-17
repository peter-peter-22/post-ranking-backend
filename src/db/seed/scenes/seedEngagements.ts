import { db } from "../..";
import { Engagement, getEngagements, ViewerPublisherRelationship } from "../../../bots/getEngagements";
import { updateUserClusters } from "../../../clusters/updateClusters";
import { updateUserEmbeddings } from "../../../embedding/updateUserEmbedding";
import { updateTrendsList } from "../../../trends/calculateTrends";
import { shuffleArray } from "../../../utilities/arrays/shuffleArray";
import { updateReplyCounts } from "../../controllers/posts/count";
import { updateClickCounts } from "../../controllers/posts/engagement/clicks/count";
import { updateAllEngagementHistory } from "../../controllers/posts/engagement/history/updateAll";
import { updateLikeCounts } from "../../controllers/posts/engagement/like/count";
import { updateViewCounts } from "../../controllers/posts/engagement/views/count";
import { insertEngagements } from "../../controllers/posts/insertEngagement";
import { getFollowChecker } from "../../controllers/users/getFollowChecker";
import { getEngagementHistoryReader } from "../../controllers/users/getHistory";
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
  // The the engagement history reader
  const engagementHistoryReader = await getEngagementHistoryReader()
  /** The chance to view a post */
  const viewChance = 0.3
  // The max time between the creation of the post and the engagement.
  const maxDelay = 1 * 24 * 60 * 60 * 1000 // 1 day
  // Engagement counters update interval.
  const counterUpdateInterval = 100;
  // Process the pairs
  const allEngagements: Engagement[] = []
  for (let n = 0; n < pairs.length; n++) {
    const [user, post] = pairs[n]
    // Get the progress of the loop.
    const progress = n / pairs.length
    // Get the relationship between the viewer and the publisher.
    const relationship: ViewerPublisherRelationship = {
      followed: checkFollow(user.id, post.userId),
      engagementHistory: engagementHistoryReader(user.id, post.userId)
    }
    // Get if the user seen this post.
    const seen = Math.random() < viewChance
    if (!seen) continue // Skip if the user didn't see the post.
    // Specify the date. The delay is linear with the progress of the loop to simulate that the post had small engagements at the beginning and more in the end. 
    const date: Date = new Date(post.createdAt.getTime() + maxDelay * progress);
    // Generate the engagements for the post.
    const engagements = getEngagements(user, post, relationship, date)
    allEngagements.push(engagements)
    // Insert the engagements and update the engagement counters every X cycles. This is necessary because the engagement generator takes these counters into account. 
    if (n % counterUpdateInterval === 0) {
      // Insert the engagements into the database.
      await insertEngagements(allEngagements) 
      // Update counters.
      await updateLikeCounts()
      await updateReplyCounts()
      await updateClickCounts()
      await updateViewCounts()
      await updateAllEngagementHistory()
    }
  }
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