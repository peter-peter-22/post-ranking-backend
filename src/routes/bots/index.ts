import { Router } from 'express';
import likes from "./likes";
import scenes from "./scenes";

const router = Router();

router.use(likes)
router.use("/scenes", scenes)

export default router;