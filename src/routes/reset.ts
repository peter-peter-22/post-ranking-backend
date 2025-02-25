import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { clearAllTables } from '../db/reset/clearTables';
import { seedAll } from '../db/seed/all';

const router = Router();

const resetQuerySchema = z.object({
    seed: z.coerce.boolean().optional(),
    multiplier: z.coerce.number().int().optional()
})

/**
 * Clear all tables
 * 
 * @param seed if true, all tables are seeded
 * @param multiplier multiplies the count of the generated rows
 */
router.get('/all', async (req: Request, res: Response) => {
    const { seed, multiplier } = resetQuerySchema.parse(req.query);

    await clearAllTables()
    if (seed)
        await seedAll(multiplier)
    res.sendStatus(200)
});


export default router;