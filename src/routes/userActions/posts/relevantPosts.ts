import { Request, Response, Router } from 'express';
import { getRelevantPosts } from '../../../posts/relevantPosts/getRelevantPosts';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { splitPosts } from '../../../posts/common';

const router = Router();

const relevantPostsUrlSchema = z.object({
    postId: z.string(),
})

const relevantPostsBodySchema = z.object({
    skipIds: z.array(z.string()).optional(),
    limit: z.number()
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = relevantPostsUrlSchema.parse(req.params)
    // Get body
    const { skipIds, limit } = relevantPostsBodySchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getRelevantPosts({ user, postId, skipIds, });
    res.json(splitPosts(posts, limit))
});

export default router;