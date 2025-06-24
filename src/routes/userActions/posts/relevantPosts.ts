import { Request, Response, Router } from 'express';
import { getRelevantPosts } from '../../../posts/relevantPosts/getRelevantPosts';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';

const router = Router();

const relevantPostsUrlSchema = z.object({
    postId: z.string(),
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = relevantPostsUrlSchema.parse(req.params)
    // Get body
    const {  } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getRelevantPosts({ user, postId });
    res.json({posts})
});

export default router;