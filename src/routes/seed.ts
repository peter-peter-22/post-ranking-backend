import { Request, Response, Router } from 'express';
import { seedUsers } from '../db/seed/users/seedUsers';
import { countRoute } from '../zod/count';

const router = Router();

router.get('/users/:count', async (req: Request, res: Response) => {
    const { count } = countRoute.parse(req.params);
    await seedUsers(count)
    res.sendStatus(200)
});


export default router;