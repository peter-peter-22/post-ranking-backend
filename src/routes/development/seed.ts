import { Request, Response, Router } from 'express';
import { seedMainUser, seedUsers } from '../../db/seed/users';
import { countRoute } from '../../zod/count';
import { seedPosts } from '../../db/seed/posts';
import { seedLikes } from '../../db/seed/likes';
import { seedFollows } from '../../db/seed/follows';

const router = Router();

router.get('/users/main', async (req: Request, res: Response) => {
    await seedMainUser()
    res.sendStatus(200)
});

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

router.get('/likes', async (req: Request, res: Response) => {
    await seedLikes()
    res.sendStatus(200)
});

router.get('/follows', async (req: Request, res: Response) => {
    await seedFollows()
    res.sendStatus(200)
});

export default router;