import { Request, Response, Router } from 'express';
import { seedUsers } from '../db/seed/users';
import { countRoute } from '../zod/count';
import { seedPosts } from '../db/seed/posts';
import { seedLikes } from '../db/seed/likes';

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

router.get('/likes/:count', async (req: Request, res: Response) => {
    const { count } = countRoute.parse(req.params);
    await seedLikes(count)
    res.sendStatus(200)
});

export default router;