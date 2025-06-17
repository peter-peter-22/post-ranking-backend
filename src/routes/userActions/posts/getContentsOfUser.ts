import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequest } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { getUserContents } from '../../../posts/contentsOfUser';

const router = Router();

const UserContentsSchema = z.object({
    userId: z.string(),
})

router.post('/:userId/posts', async (req: Request, res: Response) => {
    // Get params
    const { userId } = UserContentsSchema.parse(req.params)
    const { skipIds, limit } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequest(req);
    // Get posts
    const posts = await getUserContents(userId, limit, user, false, skipIds);
    res.json({ posts })
});

router.post('/:userId/replies', async (req: Request, res: Response) => {
    // Get params
    const { userId } = UserContentsSchema.parse(req.params)
    const { skipIds, limit } = BasicFeedSchema.parse(req.body)
    // Get user
    const user = await authRequest(req);
    // Get posts
    const posts = await getUserContents(userId, limit, user, false, skipIds);
    res.json({ posts })
});


export default router;