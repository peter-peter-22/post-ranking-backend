import { Request, Response, Router } from 'express';
import { getUser } from '../authentication';
import { getCandidates } from '../feed/candidates';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUser(req);
    if (!user)
        return;

    const posts = await getCandidates({ user })
    res.json(posts)
});

export default router;