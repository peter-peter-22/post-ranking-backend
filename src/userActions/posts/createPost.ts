import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { pendingUploads } from "../../db/schema/pendingUploads";
import { Post, posts, PostToInsert } from "../../db/schema/posts";
import { chunkedInsert } from "../../db/utils/chunkedInsert";
import { PostToFinalize } from "../../routes/userActions/posts/createPost";
import { prepareAnyPost, preparePosts, prepareReplies } from "./preparePost";
import { HttpError } from "../../middlewares/errorHandler";

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
    const postToInsert = await prepareAnyPost(post)
    // Exclude the id from the update to avoid error
    const { id, ...valuesToUpdate } = postToInsert
    // Update the pending post to set it's values and remove the pending status
    return await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
}

/** Validate and finalize the media files of a post. */
async function finalizeMediaOfPost(post: PostToFinalize) {
    if (!post.media || post.media.length === 0)
        return
    const bucketName = getBucketName(post.media)
    const objectnames = post.media.map(file => file.objectName)
    // Get the pending upload entries from the database
    const validUploads = await db
        .select()
        .from(pendingUploads)
        .where(
            and(
                eq(pendingUploads.bucketName, bucketName),
                inArray(pendingUploads.objectName, objectnames)
            )
        )
    // If the number of the deleted pending upload receipts is different from the number of media in the post, then they are invalid or expired.
    if (validUploads.length !== post.media.length)
        throw new Error(`The uploaded files are invalid or expired. Uploaded file count: ${post.media.length}, valid file count: ${validUploads.length}`)
    // Delete the pending upload entries from the database
    await db
        .delete(pendingUploads)
        .where(
            and(
                eq(pendingUploads.bucketName, bucketName),
                inArray(pendingUploads.objectName, objectnames)
            )
        )
}

/** Check if the bucket names of the files are equal and return the bucket name. */
export function getBucketName(media: { bucketName: string }[]) {
    const bucketName = media[0].bucketName;
    media.forEach(file => {
        if (file.bucketName !== bucketName)
            throw new HttpError(400, "The bucket names of the files are not equal")
    })
    return bucketName
}