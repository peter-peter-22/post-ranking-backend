import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { BasicFeedSchema } from '../../../posts/common';
import { ForYouPageParams, getMainFeed } from '../../../posts/forYou';
import { getPaginatedPosts } from '../../../posts/postMemory';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { offset } = BasicFeedSchema.parse(req.body)
    const user = await authRequestStrict(req);
    const posts = await getPaginatedPosts({
        getMore: async (pageParams?: ForYouPageParams) => await getMainFeed({ user, pageParams,offset }),
        feedName: "foryou",
        user,
        offset
    });
    res.json({ posts })
});

export default router;