import { Router } from 'express';
import likes from "./likes";
import scenes from "./scenes";
import userTypes from "./userTypes";

const router = Router();

router.use(likes)
router.use("/scenes", scenes)
router.use("/userType", userTypes)

export default router;