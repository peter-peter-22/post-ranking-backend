import { Request, Response, Router } from 'express';
import { getUser } from '../../authentication';
import { getCandidates, getCommonData } from '../../feed/candidates';
import { getEmbeddingSimilarityCandidates } from '../../feed/candidates/embedding';
import { getInNetworkCandidates } from '../../feed/candidates/inNetwork';
import { getSocialGraphExpansionCandidates } from '../../feed/candidates/socialGraphExpansion';

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

    const posts = await getInNetworkCandidates((await getCommonData(user)))
    res.json(posts)
});

router.get('/sge', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getSocialGraphExpansionCandidates((await getCommonData(user)))
    res.json(posts)
});

router.get('/embedding', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getEmbeddingSimilarityCandidates((await getCommonData(user)))
    res.json(posts)
});

export default router;