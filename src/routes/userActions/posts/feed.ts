import { Request, Response, Router } from 'express';
import { authRequestStrict } from '../../../authentication';
import { dehydratePosts, getFeed } from '../../../posts/feed';
import { ScoredPost } from '../../../posts/feed/ranker';

const router = Router();

const postsPerPage = 50

router.post('/', async (req: Request, res: Response) => {
    const user = await authRequestStrict(req);
    const posts = await getFeed({ user });
    res.json(preparePosts(posts))
});

/** Get the first page of posts and keep them hydrated while dehydrating the others to prevent an additional fetch for the first hydration. */
function preparePosts(posts: ScoredPost[]) {
    const firstPage = posts.slice(0, postsPerPage)
    const rest = posts.slice(postsPerPage)
    const dehydrated = dehydratePosts(rest)
    return { hydrated: firstPage, dehydrated }
}

export default router;