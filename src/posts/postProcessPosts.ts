import { postClickCounterRedis } from "../jobs/clickCount";
import { postReplyCounterRedis } from "../jobs/replyCount";
import { postViewCounterRedis } from "../jobs/viewCount";
import { redisClient } from "../redis/connect";
import { postLikeCounterRedis } from "../userActions/posts/like";
import { PersonalPost } from "./hydratePosts";

/** Apply changes to the fetched posts before sending them to the clients.
 ** Hide the contents of the deleted posts.
  */
export async function postProcessPosts(posts: PersonalPost[]) {
    posts.forEach(post => {
        if (post.deleted) {
            post.text = null
            post.media = null
        }
    })
    await applyRealtimeEngagements(posts)
    return posts
}

async function applyRealtimeEngagements(posts: PersonalPost[]) {
    // Get the realtime engagements for each post
    const tx = redisClient.multi()
    for (const post of posts) {
        tx.get(postLikeCounterRedis(post.id))
        tx.get(postClickCounterRedis(post.id))
        tx.get(postReplyCounterRedis(post.id))
        tx.get(postViewCounterRedis(post.id))
    }
    const results = await tx.exec()
    // Add the results to the posts
    for (let i = 0; i < posts.length; i++) {
        const redisIndex = i * 4
        const likes = results[redisIndex]
        const clicks = results[redisIndex + 1]
        const replies = results[redisIndex + 2]
        const views = results[redisIndex + 3]
        const post = posts[i]
        if (likes) post.likes = parseInt(likes.toString())
        if (clicks) post.clicks = parseInt(clicks.toString())
        if (replies) post.replies = parseInt(replies.toString())
        if (views) post.views = parseInt(views.toString())
    }
}