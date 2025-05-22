import { Request, Response, Router } from 'express';
import { getUser } from '../../authentication';
import { getCandidates, getCommonData } from '../../posts/feed/candidates';
import { getEmbeddingSimilarityCandidates } from '../../posts/feed/candidates/sources/embedding';
import { getFollowedCandidates } from '../../posts/feed/candidates/sources/followed';
import { getGraphClusterCandidates } from '../../posts/feed/candidates/sources/graphCluster';
import { getTrendCandidates } from '../../posts/feed/candidates/sources/trending';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const common = await getCommonData(user)
    const posts = await getCandidates(common)
    res.json(posts)
});

router.get('/inNetwork', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getFollowedCandidates(await getCommonData(user))
    res.json(posts)
});

router.get('/cluster', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getGraphClusterCandidates(await getCommonData(user))
    res.json(posts)
});

router.get('/embedding', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getEmbeddingSimilarityCandidates(await getCommonData(user))
    res.json(posts)
});

router.get('/trends', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getTrendCandidates(await getCommonData(user))
    res.json(posts)
});

export default router;