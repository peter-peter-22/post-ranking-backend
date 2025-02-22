import { Request, Response, Router } from 'express';
import { getUser } from '../authentication';

const router = Router();

router.get('/feed', (req: Request, res: Response) => {
    res.json(getUser(req));
});

export default router;