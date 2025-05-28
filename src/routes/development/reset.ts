import { Request, Response, Router } from 'express';
import { clearAllTables } from '../../db/reset/clearTables';
import { resetWeaviateSchema } from '../../weaviate/controllers/reset';

const router = Router();

router.get('/all', async (req: Request, res: Response) => {
    await clearAllTables()
    res.sendStatus(200)
});

router.get('/vectorsSchema', async (req: Request, res: Response) => {
    await resetWeaviateSchema()
    res.sendStatus(200)
});

export default router;