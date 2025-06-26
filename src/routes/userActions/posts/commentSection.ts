import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { CommentsPageParams, getReplies } from '../../../posts/comments/getReplies';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { getPaginatedDirectPosts } from '../../../redis/postFeeds/directPosts';

const router = Router();

const CommentSectionUrlSchema = z.object({
    postId: z.string(),
})

router.post('/:postId', async (req: Request, res: Response) => {
    // Get params
    const { postId } = CommentSectionUrlSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getPaginatedDirectPosts<CommentsPageParams>({
        getMore: async (pageParams) => await getReplies({ user, postId, offset, pageParams }),
        feedName: `replies/${postId}`,
        user,
        offset
    });
    res.json({ posts })
});

export default router;