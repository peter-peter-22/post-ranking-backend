import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema, splitPosts } from '../../../posts/common';
import { getFeed } from '../../../posts/forYou';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { skipIds, limit } = BasicFeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await getFeed({ user, skipIds });
    res.json(splitPosts(posts, limit))
});

export default router;