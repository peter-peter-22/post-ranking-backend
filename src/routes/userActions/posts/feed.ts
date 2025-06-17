import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { PostCandidateSchema, splitPosts } from '../../../posts/common';
import { getFeed } from '../../../posts/forYou';

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

export default router;