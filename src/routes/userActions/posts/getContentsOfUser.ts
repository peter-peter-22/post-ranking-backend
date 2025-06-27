import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { getUserContents, UserContentsPageParams } from '../../../posts/contentsOfUser';
import { getPaginatedDirectPosts } from '../../../redis/postFeeds/directPosts';

const router = Router();

const UserContentsSchema = z.object({
    userId: z.string(),
})

router.post('/:userId/posts', async (req: Request, res: Response) => {
    // Get params
    const { userId } = UserContentsSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getPaginatedDirectPosts<UserContentsPageParams>({
        getMore: async (pageParams) => await getUserContents({ user, targetUserId: userId, offset, pageParams, replies: false }),
        feedName: `userContent/${userId}/posts`,
        user,
        offset
    });
    res.json({ posts })
});

router.post('/:userId/replies', async (req: Request, res: Response) => {
    // Get params
    const { userId } = UserContentsSchema.parse(req.params)
    const { offset } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getPaginatedDirectPosts<UserContentsPageParams>({
        getMore: async (pageParams) => await getUserContents({ user, targetUserId: userId, offset, pageParams, replies: true }),
        feedName: `userContent/${userId}/replies`,
        user,
        offset
    });
    res.json({ posts })
});


export default router;