import { Request, Response, Router } from 'express';
import { getUserOrThrow } from '../../authentication';
import { getRelevantPosts } from '../../relevantPosts/getRelevantPosts';
import { z } from 'zod';

const router = Router();

const relevantPostsSchema = z.object({
    postId: z.string(),
})

router.get('/', async (req: Request, res: Response) => {
    // Get params
    const {postId} = relevantPostsSchema.parse(req.query)
    // Get user
    const user = getUserOrThrow(req);
    // Get posts
    const posts = await getRelevantPosts({ user, postId });
    res.json(posts)
});

export default router;