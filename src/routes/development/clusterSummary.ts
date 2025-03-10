import { Request, Response, Router } from 'express';
import { getClustersTexts } from '../../clusters/getClusterTexts';

const router = Router();

router.get('/clusterTexts', async (req: Request, res: Response) => {
    const result=await getClustersTexts()
    res.json(result)
});

export default router;