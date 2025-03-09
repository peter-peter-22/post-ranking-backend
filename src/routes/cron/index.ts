import { Request, Response, Router } from 'express';
import { updateUserEmbeddings } from '../../db/controllers/users/updateUserEmbedding';

const router = Router();

router.get('/updateUserEmbeddings', async (req: Request, res: Response) => {
    await updateUserEmbeddings()
    res.sendStatus(200)
});

export default router;