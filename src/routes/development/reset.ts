import { Request, Response, Router } from 'express';
import { clearAllTables } from '../../db/reset/clearTables';

const router = Router();

/**
 * Clear all tables
 */
router.get('/all', async (req: Request, res: Response) => {
    await clearAllTables()
    res.sendStatus(200)
});


export default router;