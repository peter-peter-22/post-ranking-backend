import { Router } from 'express';
import z from "zod";
import { clearAllTables } from '../../../db/reset/clearTables';
import { seedAll } from '../../../db/seed/scenes/all';

const router = Router();

const multiplierSchema = z.object({
    multiplier: z.coerce.number().optional()
})

router.get("/default", async (req, res) => {
    const { multiplier } = multiplierSchema.parse(req.query)
    await clearAllTables()
    await seedAll(multiplier)
    res.sendStatus(200)
})

export default router;