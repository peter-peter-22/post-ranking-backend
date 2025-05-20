import { Request, Response, Router } from 'express';
import { registerSchema } from '../zod/register';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    const data = registerSchema.parse(req.body)
    res.json(data);
});

export default router;