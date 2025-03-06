import { Request, Response, Router } from 'express';
import { mainUserTypeNew } from '../../../db/seed/userTypes/new';

const router = Router();

router.get('/new', async (req: Request, res: Response) => {
    await mainUserTypeNew()
    res.sendStatus(200)
});

export default router;