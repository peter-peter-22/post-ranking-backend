import { Request, Response, Router } from 'express';
import { updateUserClusters } from '../../clusters/updateClusters';
import { updateUserEmbeddings } from '../../embedding/updateUserEmbedding';
import { updateTrendsList } from '../../trends/calculateTrends';

const router = Router();

router.get('/userEmbeddings', async (req: Request, res: Response) => {
    await updateUserEmbeddings()
    res.sendStatus(200)
});

router.get('/userClusters', async (req: Request, res: Response) => {
    await updateUserClusters()
    res.sendStatus(200)
});

router.get('/trends', async (req: Request, res: Response) => {
    await updateTrendsList()
    res.sendStatus(200)
});

export default router;