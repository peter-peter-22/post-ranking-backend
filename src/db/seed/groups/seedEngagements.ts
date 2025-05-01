import { getTableName } from "drizzle-orm";
import { db } from "../..";
import { Engagement, getEngagements, ViewerPublisherRelationship } from "../../../bots/getEngagements";
import { clearClusters } from "../../controllers/clusters/clear";
import { isPost } from "../../controllers/posts/filters";
import { insertEngagements } from "../../controllers/posts/insertEngagement";
import { clearReplies } from "../../reset/clearReplies";
import { clearTables } from "../../reset/clearTables";
import { clicks } from "../../schema/clicks";
import { engagementHistory } from "../../schema/engagementHistory";
import { likes } from "../../schema/likes";
import { persistentDates } from "../../schema/persistentDates";
import { Post, posts } from "../../schema/posts";
import { trends } from "../../schema/trends";
import { User } from "../../schema/users";
import { views } from "../../schema/views";
import { getAllBots } from "../utils";
import { getEngagementHistoryCache } from "./memory caching/engagementHistory";
import { getFollowChecker } from "./memory caching/follows";
import { getEngagementCache } from "./memory caching/postEngagements";
import { getCommenterChecker } from "./memory caching/replies";
import { applyMemoryEngagementCounts, applyMemoryEngagementHistory } from "./memory caching/save_counts";
import { updateHistorySnapshots, updatePostSnapshots } from "./memory caching/updateSnapshots";
import { postSnapshots } from "../../schema/postSnapshots";
import { engagementHistorySnapshots } from "../../schema/engagementHistorySnapshots";
import { followSnapshots } from "../../schema/followSnapshots";

type UserPostPair = [
  user: User,
  post: Post,
  timestamp: number
]

/**
 * Create random and organic engagements.
 */
export async function seedEngagements() {
  // Clear existing engagements, and other related tables.
  await clearTables([
    getTableName(likes),
    getTableName(views),
    getTableName(clicks),
    getTableName(trends),
    getTableName(persistentDates),
    getTableName(engagementHistory),
    getTableName(postSnapshots),
    getTableName(engagementHistorySnapshots),
    getTableName(followSnapshots)
  ])
  await clearReplies()
  await clearClusters()

  // Generate engagements
  await createEngagementsForPairs(await getUsersAndPosts())

  // Update engagement related tables.
  console.log("Updating engagement related tables")
  //await updateUserEmbeddings()
  //await updateUserClusters()
  //await updateTrendsList()// TODO make this faster
  console.log("Seeded engagements")
}

/**
 * Create all kinds of organic engagements for the given user-post pairs.
 * @param pairs Array of user-post pairs.
 */
async function createEngagementsForPairs(pairs: UserPostPair[]) {
  console.log(`Creating engagements for ${pairs.length} pairs`)
  // Get the follow checker.
  const checkFollow = await getFollowChecker()
  // Get the engagement count cache.
  const engagementCounts = getEngagementCache()
  // Get the engagement history cache.
  const engagementHistories = getEngagementHistoryCache()
  // Get the commenter cache.
  const commenterChecker = getCommenterChecker()
  /** The chance to view a post */
  const viewChance = 0.3
  // The number of the engagements those are processed together. 
  const batchSize = 100000;
  const batchCount = Math.ceil(pairs.length / batchSize)
  // Process the pairs
  for (let batch = 0; batch < batchCount; batch++) {
    console.log(`Processing batch ${batch + 1} of ${batchCount}`)
    // The user-post pairs inside the batch.
    const batchPairs = pairs.slice(batch * batchSize, (batch + 1) * batchSize)
    // The engagements created inside the batch.
    const batchEngagements: Engagement[] = []
    // Process the pairs, create their promises.
    batchPairs.map(async ([user, post, timestamp]) => {
      // Get the relationship between the viewer and the publisher.
      const relationship: ViewerPublisherRelationship = {
        followed: checkFollow(user.id, post.userId),
        engagementHistory: engagementHistories.get(user.id, post.userId),
        isRelevant: post.topic ? user.interests.includes(post.topic) : false,
        repliedByFollowed: repliedByFollowed(post, user, checkFollow, commenterChecker.get),
      }
      // Get if the user seen this post.
      const seen = Math.random() < viewChance
      if (!seen) return // Skip if the user didn't see the post.
      // Apply the engagement counts.
      engagementCounts.applyCounts(post)
      // Generate the engagements for the post.
      const engagements = getEngagements(user, post, relationship, new Date(timestamp))
      batchEngagements.push(engagements)
    })
    // After a batch is done, insert and update the engagement counters.
    // Insert the engagements into the database.
    console.log("Inserting engagements...")
    await insertEngagements(batchEngagements)
    // Update the cached engagement counters.
    console.log("Updating counters...")
    engagementCounts.add(batchEngagements)
    engagementHistories.apply(batchEngagements)
    commenterChecker.update(batchEngagements)
    // Create snapshots of the current state of engagements.  
    console.log("Updating snapshots...")
    const updateDate=new Date(batchPairs[batchPairs.length-1][2])
    await updatePostSnapshots(engagementCounts.getAll(),batchEngagements,updateDate)
    await updateHistorySnapshots(engagementHistories.getAll(),batchEngagements,updateDate)
  }
  // Save the engagement counts in the memory to the database to save time.
  console.log("Saving engagement counts...")
  applyMemoryEngagementCounts(engagementCounts.getAll())
  console.log("Saving engagement histories...")
  applyMemoryEngagementHistory(engagementHistories.getAll())
}

/** Check if a post was replied by a user that is followed by the viewer.
 * @param post The post to check.
 * @param viewer The viewer.
 * @param checkFollow The function to check if a user follows another user.
 */
function repliedByFollowed(post: Post, viewer: User, checkFollow: (from: string, to: string) => boolean, commenterChecker: (postId: string) => Set<string> | undefined): boolean {
  // Get the comments of the post.
  const repliers = commenterChecker(post.id)
  if (!repliers) return false // No replies, return false.
  // Check if any of the commenters are followed by the viewer.
  for (const replier of repliers) {
    if (checkFollow(viewer.id, replier)) {
      return true
    }
  }
  // None of the commenters are followed by the viewer, return false.
  return false
}

/** 
* Get all user and post pairs in chronological order.
* @returns Array of pairs. 
*/
async function getUsersAndPosts(): Promise<UserPostPair[]> {
  console.log("Getting all users and posts")
  const allUsers = await getAllBots()
  const allPosts = await db.select().from(posts).where(isPost())
  console.log("Creating user and post pairs")
  // The oldest engagements will have this date.
  const maxDelay = 1 * 24 * 60 * 60 * 1000 // 1 day
  /** All users paired with all posts. */
  let pairs: UserPostPair[] = allUsers
    .flatMap((user) => allPosts.map((post) => [user, post, post.createdAt.getTime() + Math.random() * maxDelay] as UserPostPair))
    .sort((a, b) => a[2] - b[2]);//Sort by date, oldest first.

  return pairs
}