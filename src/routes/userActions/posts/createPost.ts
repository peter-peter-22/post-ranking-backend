import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { mediaFileSchema } from '../../../db/common';
import { createPendingPost } from '../../../userActions/posts/createPendingPost';
import { createPosts, createReplies, finalizePost } from '../../../userActions/posts/createPost';
import { authRequestStrict } from '../../../authentication';

const router = Router();

const createPostSchema = z.object({
    text: z.string().optional(),
    replyingTo: z.string().optional(),
    media: z.array(mediaFileSchema).optional()
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
    // Return created posts
    res.status(201).json({ created })
});

router.post('/finalizePost', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Get the values of the post
    const post = finalizePostSchema.parse(req.body);
    // Update the posts
    const [created] = await finalizePost({ ...post, userId: user.id })
    // Return updated posts
    res.status(201).json({ created })
});

router.post('/pendingPost', async (req: Request, res: Response) => {
    // Get user
    const user = await authRequestStrict(req)
    // Create pending posts
    const id = await createPendingPost(user.id)
    // Send back the id
    res.status(201).json({ id })
});

export default router;