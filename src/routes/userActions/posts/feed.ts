import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { hydratePostsWithMeta } from '../../../posts/hydratePosts';
import { getFeed } from '../../../posts/forYou';
import { PostCandidateSchema, splitPosts } from '../../../posts/common';

const router = Router();

const FeedSchema = z.object({
    limit: z.number().int(),
    skipIds: z.array(z.string()).optional()
})

router.post('/', async (req: Request, res: Response) => {
    const { skipIds, limit } = FeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await getFeed({ user, skipIds });
    res.json(splitPosts(posts, limit))
});

const HydrateSchema = z.object({
    dehydrated: PostCandidateSchema.array()
})

router.post('/hydrate', async (req: Request, res: Response) => {
    const { dehydrated } = HydrateSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const hydrated = await hydratePostsWithMeta(dehydrated, user)
    res.json({ hydrated })
});

export default router;