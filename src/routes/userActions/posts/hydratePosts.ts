import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';
import { PostCandidateSchema } from '../../../posts/common';
import { HydratedPost, hydratePostsWithMeta } from '../../../posts/hydratePosts';

const router = Router();

const HydrateSchema = z.object({
    dehydrated: PostCandidateSchema.array()
})

router.post('/', async (req: Request, res: Response) => {
    const { dehydrated } = HydrateSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const hydrated = orderPostsByScore(await hydratePostsWithMeta(dehydrated, user))
    res.json({ hydrated })
});

/** Order the posts by score */
function orderPostsByScore(posts: HydratedPost[]) {
    return posts.sort((a, b) => {
        return (b.score || 0) - (a.score || 0)
    })
}

export default router;