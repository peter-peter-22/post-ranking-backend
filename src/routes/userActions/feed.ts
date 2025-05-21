import { Request, Response, Router } from 'express';
import { getUserOrThrow } from '../../authentication';
import { getFeed } from '../../feed';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const user = getUserOrThrow(req);
    const posts = await getFeed({ user });
    res.json(posts)
});

export default router;