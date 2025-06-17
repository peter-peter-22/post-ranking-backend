import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { PostCandidateSchema } from '../../../posts/common';
import { hydratePostsWithMeta } from '../../../posts/hydratePosts';

const router = Router();

const HydrateSchema = z.object({
    dehydrated: PostCandidateSchema.array()
})

router.post('/', async (req: Request, res: Response) => {
    const { dehydrated } = HydrateSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const hydrated = await hydratePostsWithMeta(dehydrated, user)
    res.json({ hydrated })
});

export default router;