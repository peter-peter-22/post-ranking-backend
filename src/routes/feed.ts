import { Request, Response, Router } from 'express';
import { getUser } from '../authentication';
import { getFeed, getFeedSimplified } from '../feed';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUser(req);
    if(!user)
        return;

    const posts = await getFeed({user});
    res.json(posts)
});

router.get('/simplified', async (req: Request, res: Response) => {
    const user = getUser(req);
    if(!user)
        return;

    const posts = await getFeedSimplified({user});
    res.json(posts)
});

export default router;