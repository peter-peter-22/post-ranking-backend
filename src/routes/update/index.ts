import { Request, Response, Router } from 'express';
import { updateUserEmbeddings } from '../../embedding/updateUserEmbedding';
import { updateUserClusters } from '../../clusters/updateClusters';

const router = Router();

router.get('/updateUserEmbeddings', async (req: Request, res: Response) => {
    await updateUserEmbeddings()
    res.sendStatus(200)
});

router.get('/updateUserClusters', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

export default router;