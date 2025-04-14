import { db } from "../.."
import { Engagement } from "../../../bots/getEngagements"
import { createPosts } from "../../../user_actions/createPost"
import { clicks, ClicksToInsert } from "../../schema/clicks"
import { likes, LikeToInsert } from "../../schema/likes"
import { PostToCreate } from "../../schema/posts"

/** Format the engagement data and insert it into the DB. */
export async function insertEngagements(engagements: Engagement[]) {
    await insertLikes(engagements)
    await insertReplies(engagements)
    await insertClicks(engagements)
}

/** Format and insert likes. */
async function insertLikes(engagements: Engagement[]) {
    const likesToInsert: LikeToInsert[] = engagements
        .filter(engagement => engagement.like)
        .map(engagement => ({
            postId: engagement.post,
            userId: engagement.user,
        }))
    await db.insert(likes).values(likesToInsert)
}

/** Format and insert likes. */
async function insertReplies(engagements: Engagement[]) {
    const replies: PostToCreate[] = engagements
        .filter(engagement => engagement.reply)
        .map(engagement => ({
            replyingTo: engagement.post,
            userId: engagement.user,
            text: "text"// TODO: Add the logic to generate the reply text.
        }))
    await createPosts(replies)
}

/** Format and insert likes. */
async function insertClicks(engagements: Engagement[]) {
    const clicksToInsert: ClicksToInsert[] = engagements
        .filter(engagement => engagement.like)
        .map(engagement => ({
            postId: engagement.post,
            userId: engagement.user,
        }))
    await db.insert(clicks).values(clicksToInsert)
}