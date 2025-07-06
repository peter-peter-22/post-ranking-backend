import { and, eq, inArray } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { db } from '../../../db';
import { MediaFile } from '../../../db/common';
import { pendingUploads } from '../../../db/schema/pendingUploads';
import { posts } from '../../../db/schema/posts';
import { HttpError } from '../../../middlewares/errorHandler';
import { minioClient } from '../../../objectStorage/client';
import { personalizePosts } from '../../../posts/hydratePosts';
import { getBucketName } from '../../../userActions/posts/createPost';
import { prepareAnyPost } from '../../../userActions/posts/preparePost';
import { getOnePost } from '../../getPost';
import { createPostSchema } from './createPost';

const router = Router();

const UpdatePostSchema = createPostSchema.extend({
    id: z.string()
})

router.post('/', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the updated values of the post
    const post = UpdatePostSchema.parse(req.body);
    // Check if the updated post is valid
    const [previousPost] = await db
        .select({
            userId: posts.userId,
            pending: posts.pending,
            media: posts.media
        })
        .from(posts)
        .where(eq(posts.id, post.id))
    if (previousPost.userId !== user.id) throw new HttpError(401, "This is not your post")
    if (previousPost.pending === true) throw new HttpError(400, "This post is still pending")
    // Update the media of the post
    await updateMediaOfPost(previousPost.media || [], post.media || [])
    // Prepare the post
    const postToInsert = await prepareAnyPost({ ...post, userId: user.id })
    // Exclude the id from the update to avoid error while updating
    const { id, ...valuesToUpdate } = postToInsert
    // Update the post
    const [updatedPost] = await db
        .update(posts)
        .set({ ...valuesToUpdate, pending: false })
        .where(eq(posts.id, post.id))
        .returning()
    // Format the post to the standard format
    const [personalPost] = await personalizePosts(getOnePost(updatedPost.id), user)
    // Return updated posts
    res.status(201).json({ post: personalPost })
    console.log("Post updated")
});

function mediaEqual(a: MediaFile, b: MediaFile) {
    return a.objectName === b.objectName && a.bucketName === b.bucketName && a.lastModified === b.lastModified
}

/** Validate and finalize the media files of a post. */
async function updateMediaOfPost(oldMedia: MediaFile[], newMedia: MediaFile[]) {
    const newUploads: MediaFile[] = newMedia.filter(newFile => {
        return !oldMedia.some(oldFile => mediaEqual(oldFile, newFile))
    })
    const deletedFiles: MediaFile[] = oldMedia.filter(oldFile => {
        return !newMedia.some(newFile => mediaEqual(newFile, oldFile))
    })
    await deleteFiles(deletedFiles)
    await addFiles(newUploads)
}

async function deleteFiles(deletedFiles: MediaFile[]) {
    if (deletedFiles.length === 0) return
    console.log(`Deleting ${deleteFiles.length} files`)
    const bucketName = getBucketName(deletedFiles)
    // Remove the deleted files from the object storage
    const oldObjectNames = deletedFiles.map(file => file.objectName)
    if (deletedFiles.length > 0) minioClient.removeObjects(bucketName, oldObjectNames)
}

async function addFiles(newUploads: MediaFile[]) {
    if (newUploads.length === 0) return
    const bucketName = getBucketName(newUploads)
    const newObjectnames = newUploads.map(file => file.objectName)
    const [validUploads] = await Promise.all([
        // Get the pending upload entries from the database
        db
            .select()
            .from(pendingUploads)
            .where(
                and(
                    eq(pendingUploads.bucketName, bucketName),
                    inArray(pendingUploads.objectName, newObjectnames)
                )
            ),
    ])
    // If the number of the deleted pending upload receipts is different from the number of media in the post, then they are invalid or expired.
    if (validUploads.length !== newUploads.length)
        throw new Error(`The uploaded files are invalid or expired. Uploaded file count: ${newUploads.length}, valid file count: ${validUploads.length}`)
    // Delete the pending upload entries from the database
    await db
        .delete(pendingUploads)
        .where(
            and(
                eq(pendingUploads.bucketName, bucketName),
                inArray(pendingUploads.objectName, newObjectnames)
            )
        )
}

export default router;