import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { MediaFileSchema } from '../../../db/common';
import { createPendingPost } from '../../../userActions/posts/createPendingPost';
import { createPosts, createReplies, finalizePost } from '../../../userActions/posts/createPost';
import { authRequestStrict } from '../../../authentication';
import { personalizePosts } from '../../../posts/hydratePosts';
import { getOnePost } from '../../getPost';
import { db } from '../../../db';
import { posts } from '../../../db/schema/posts';
import { eq } from 'drizzle-orm';
import { HttpError } from '../../../middlewares/errorHandler';

const router = Router();

export const createPostSchema = z.object({
    text: z.string().optional(),
    replyingTo: z.string().optional(),
    media: z.array(MediaFileSchema).optional()
})
export type PostToCreate = z.infer<typeof createPostSchema> & { userId: string }

const finalizePostSchema = createPostSchema.extend({
    id: z.string()
})
export type PostToFinalize = z.infer<typeof finalizePostSchema> & { userId: string }

router.post('/post', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const post = createPostSchema.parse(req.body);
    // Create the posts
    const [created] = post.replyingTo ?
        await createReplies([{ ...post, userId: user.id }])
        :
        await createPosts([{ ...post, userId: user.id }])
    // Format the post to the standard format
    const [personalPost] = await personalizePosts(getOnePost(created.id), user)
    // Return created posts
    res.status(201).json({ created: personalPost })
    console.log("Post created")
});

router.post('/finalizePost', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const post = finalizePostSchema.parse(req.body);
    // Check if the finalized post is valid
    const [previousPost] = await db
        .select({
            userId: posts.userId,
            pending: posts.pending
        })
        .from(posts)
        .where(eq(posts.id, post.id))
    if (previousPost.userId !== user.id) throw new HttpError(401, "This is not your post")
    if (previousPost.pending !== true) throw new HttpError(400, "This post is not pending")
    // Update the posts
    const [created] = await finalizePost({ ...post, userId: user.id })
    // Format the post to the standard format
    const [personalPost] = await personalizePosts(getOnePost(created.id), user)
    // Return updated posts
    res.status(201).json({ created: personalPost })
    console.log("Post finalized")
});

router.post('/pendingPost', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Create pending posts
    const id = await createPendingPost(user.id)
    // Send back the id
    res.status(201).json({ id })
    console.log("Pending post created")
});

export default router;