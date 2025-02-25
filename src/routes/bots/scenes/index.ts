import { Request, Response, Router } from 'express';
import { followScene } from '../../../db/seed/scenes/followed';

const router = Router();

router.get('/follow', async (req: Request, res: Response) => {
    await followScene();
    res.sendStatus(200)
});

export default router;