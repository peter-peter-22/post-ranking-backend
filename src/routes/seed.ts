import { Request, Response, Router } from 'express';
import { seedUsers } from '../db/seed/seedUsers';
import { countRoute } from '../zod/count';
import { seedPosts } from '../db/seed/seedPosts';

const router = Router();

router.get('/users/:count', async (req: Request, res: Response) => {
    const { count } = countRoute.parse(req.params);
    await seedUsers(count)
    res.sendStatus(200)
});

router.get('/posts/:count', async (req: Request, res: Response) => {
    const { count } = countRoute.parse(req.params);
    await seedPosts(count)
    res.sendStatus(200)
});

export default router;