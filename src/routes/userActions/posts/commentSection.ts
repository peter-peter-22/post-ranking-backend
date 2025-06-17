import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { getReplies } from '../../../posts/comments/getReplies';
import { authRequestStrict } from '../../../authentication';

const router = Router();

const commentSectionUrlSchema = z.object({
    postId: z.string(),
})

const commentSectionBodySchema = z.object({
    skipIds: z.array(z.string()).optional(),
    limit: z.number()
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = commentSectionUrlSchema.parse(req.params)
    const { skipIds, limit } = commentSectionBodySchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getReplies(postId, user, limit, skipIds);
    res.json({ posts })
});

export default router;