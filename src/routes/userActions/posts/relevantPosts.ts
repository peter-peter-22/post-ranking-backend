import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { getPaginatedRankedPosts } from '../../../redis/postFeeds/rankedPosts';
import { getRelevantPosts, RelevantPostsPageParams } from '../../../posts/relevantPosts';

const router = Router();

const relevantPostsUrlSchema = z.object({
    postId: z.string(),
})

router.post('/:postId', async (req: Request, res: Response) => {
    const { postId } = relevantPostsUrlSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await getPaginatedRankedPosts({
        getMore: async (pageParams?: RelevantPostsPageParams) => await getRelevantPosts({ user, pageParams, offset, postId }),
        feedName: `relevantPosts/${postId}`,
        user,
        offset
    });
    res.json({ posts })
});

export default router;