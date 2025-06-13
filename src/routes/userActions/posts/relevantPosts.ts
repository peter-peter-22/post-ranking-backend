import { Request, Response, Router } from 'express';
import { getRelevantPosts } from '../../../posts/relevantPosts/getRelevantPosts';
import { z } from 'zod';
import { authRequestStrict } from '../../../authentication';

const router = Router();

const relevantPostsSchema = z.object({
    postId: z.string(),
})

router.get('/', async (req: Request, res: Response) => {
    // Get params
    const {postId} = relevantPostsSchema.parse(req.query)
    // Get user
    const user = await authRequestStrict(req);
    // Get posts
    const posts = await getRelevantPosts({ user, postId });
    res.json(posts)
});

export default router;