import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { getFeed, preparePosts } from '../../../posts/feed';
import { hydratePostsWithMeta } from '../../../posts/hydratePosts';
import { PostCandidateSchema } from '../../../posts/feed/candidates';

const router = Router();

const FeedSchema = z.object({
    limit: z.number().int(),
    skipIds: z.array(z.string()).optional()
})

router.post('/', async (req: Request, res: Response) => {
    const { skipIds, limit } = FeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await getFeed({ user,skipIds });
    res.json(preparePosts(posts, limit))
});

const HydrateSchema=z.object({
    dehydrated:PostCandidateSchema.array()
})

router.post('/hydrate', async (req: Request, res: Response) => {
    const { dehydrated } = HydrateSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const hydrated = await hydratePostsWithMeta(dehydrated,user)
    res.json({hydrated})
});

export default router;