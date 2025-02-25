import { Request, Response, Router } from 'express';
import { getUser } from '../authentication';
import { getFeed } from '../feed';

const router = Router();

router.get('/feed', async (req: Request, res: Response) => {
    const user = getUser(req);
    if(!user)
        return;

    const posts = await getFeed({user});
    res.json(posts)
});

export default router;