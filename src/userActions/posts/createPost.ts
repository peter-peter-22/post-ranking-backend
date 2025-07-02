import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { pendingUploads } from "../../db/schema/pendingUploads";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { PostToFinalize } from "../../routes/userActions/posts/createPost";
import { preparePosts, prepareReplies } from "./preparePost";

/** Calculate the metadata of posts and insert them into the database. */
export async function createPosts(data: PostToInsert[]) {
    console.log(`Creating ${data.length} posts...`)
    const postsToInsert = await preparePosts(data)
    return await insertPosts(postsToInsert)
}

/** Insert replies into the database. */
export async function createReplies(data: PostToInsert[]) {
    console.log(`Creating ${data.length} replies...`)
    const postsToInsert = await prepareReplies(data)
    return await insertPosts(postsToInsert)
}

/** Insert posts to the database. */
async function insertPosts(postsToInsert: PostToInsert[]) {
    // Insert to db and return
    console.log(`Inserting posts`)
    const inserted: Post[] = []
    await db.transaction(async tx => {
        await chunkedInsert(
            postsToInsert,
            async (rows) => {
                const res = await tx
                    .insert(posts)
                    .values(rows)
                    .onConflictDoNothing()
                    .returning()
                inserted.push(...res)
            }
        )
    })
    console.log(`Posts inserted`)
    return inserted
}

/** Validate and finalize a post and it's media files. */
export async function finalizePost(post: PostToFinalize) {
    console.log("Finalizing post..")
    // Finalize media files, and check if they are valid
    await finalizeMediaOfPost(post)
    // Prepare the post to insert
    const [postToInsert] = post.replyingTo ?
        await prepareReplies([{ ...post }])
        :
        await preparePosts([{ ...post }])
    // Exclude the id from the update to avoid error
    const { id, ...valuesToUpdate } = postToInsert
    // Update the pending post to set it's values and remove the pending status
    return await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
}

/** Validate and finalize a post and it's media files. */
export async function finalizeReply(post: PostToFinalize) {
    // Finalize media files, and check if they are valid
    await finalizeMediaOfPost(post)
    // Exclude the id from the update to avoid error
    const { id, ...valuesToUpdate } = post
    // Update the pending post to set it's values and remove the pending status
    return await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, id))
        .returning()
}

/** Validate and finalize the media files of a post. */
async function finalizeMediaOfPost(post: PostToFinalize) {
    if (!post.media || post.media.length === 0)
        return
    // Delete the pending upload entries from the database
    const deleted = (
        await Promise.all(
            post.media.map((file) => (
                db.delete(pendingUploads).where(
                    and(
                        eq(pendingUploads.bucketName, file?.bucketName),
                        eq(pendingUploads.objectName, file?.objectName),
                        // Check if the user uploaded the file
                        eq(pendingUploads.userId, post.userId)
                    )
                ).returning()
            ))
        )
    ).flat()
    // If the number of the deleted pending upload receipts is different from the number of media in the post, then they are invalid or expired.
    if (deleted.length !== post.media.length)
        throw new Error(`The uploaded files are invalid or expired. Uploaded file count: ${post.media.length}, valid file count: ${deleted.length}`)
}

