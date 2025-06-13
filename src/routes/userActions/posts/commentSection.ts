import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { getReplies } from '../../../posts/comments/getReplies';
import { authRequestStrict } from '../../../authentication';

const router = Router();

const commentSectionUrlSchema = z.object({
    postId: z.string(),
})

const commentSectionBodySchema = z.object({
    skip: z.array(z.string()).default([]),
})

router.post('/', async (req: Request, res: Response) => {
    // Get params
    const { postId } = commentSectionUrlSchema.parse(req.query)
    const { skip } = commentSectionBodySchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getReplies(postId, user, skip);
    res.json(posts)
});

export default router;