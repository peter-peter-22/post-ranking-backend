import { db } from "../.."
import { Engagement } from "../../../bots/getEngagements"
import { createReplies } from "../../../user_actions/createPost"
import { clicks, ClicksToInsert } from "../../schema/clicks"
import { likes, LikeToInsert } from "../../schema/likes"
import { PostToCreate } from "../../schema/posts"
import { views, ViewToInsert } from "../../schema/views"
import { generateReplyText, getRandomTopicFromUser } from "../../seed/posts"

/** Format the engagement data and insert it into the DB. */
export async function insertEngagements(engagements: Engagement[]) {
    console.log("Inserting engagements...")
    await Promise.all([
        insertLikes(engagements),
        insertReplies(engagements),
        insertClicks(engagements),
        insertViews(engagements)
    ])
    console.log("Inserted engagements")
}

/** Format and insert likes. */
async function insertLikes(engagements: Engagement[]) {
    const likesToInsert: LikeToInsert[] = engagements
        .filter(engagement => engagement.like)
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
        }))
    if (likesToInsert.length === 0) return
    await db.insert(likes).values(likesToInsert)
}

/** Format and insert likes. */
async function insertReplies(engagements: Engagement[]) {
    const replies: PostToCreate[] = engagements
        .filter(engagement => engagement.reply)
        .map(engagement => ({
            replyingTo: engagement.post.id,
            userId: engagement.user.id,
            text: generateReplyText(getRandomTopicFromUser(engagement.user)),
        }))
    if (replies.length === 0) return
    await createReplies(replies)
}

/** Format and insert likes. */
async function insertClicks(engagements: Engagement[]) {
    const clicksToInsert: ClicksToInsert[] = engagements
        .filter(engagement => engagement.click)
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
        }))
    if (clicksToInsert.length === 0) return
    await db.insert(clicks).values(clicksToInsert)
}

/** Format and insert views. */
async function insertViews(engagements: Engagement[]) {
    // All engagement entries cause views.
    const viewsToInsert: ViewToInsert[] = engagements
        .map(engagement => ({
            postId: engagement.post.id,
            userId: engagement.user.id,
        }))
    if (viewsToInsert.length === 0) return
    await db.insert(views).values(viewsToInsert)
}