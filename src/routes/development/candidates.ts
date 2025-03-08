import { Request, Response, Router } from 'express';
import { getUser } from '../../authentication';
import { getCandidates } from '../../feed/candidates';
import { getFollowedUsers } from '../../db/controllers/users/getFollowers';
import { getInNetworkCandidates } from '../../feed/candidates/inNetwork';
import { getSocialGraphExpansionCandidates } from '../../feed/candidates/socialGraphExpansion';
import { getEmbeddingSimilarityCandidates } from '../../feed/candidates/embedding';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const followedUsers = await getFollowedUsers({ user })

    const posts = await getCandidates({ user, followedUsers })
    res.json(posts)
});

router.get('/inNetwork', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const followedUsers = await getFollowedUsers({ user })

    const posts = await getInNetworkCandidates({ user, followedUsers })
    res.json(posts)
});

router.get('/sge', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const followedUsers = await getFollowedUsers({ user })

    const posts = await getSocialGraphExpansionCandidates({ user, followedUsers })
    res.json(posts)
});

router.get('/embedding', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const followedUsers = await getFollowedUsers({ user })

    const posts = await getEmbeddingSimilarityCandidates({ user, followedUsers })
    res.json(posts)
});

export default router;