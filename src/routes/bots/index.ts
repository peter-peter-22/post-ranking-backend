import { Router } from 'express';
import likes from "./likes";

const router = Router();

router.use(likes)

export default router;