import { Router } from 'express';

//routers

import bot from "./bots";
import reset from "./development/reset";
import home from './home';
import authenticate from "./register";
import update from "./update";
import userActions from "./userActions/index";

const router = Router();

router.use(home);
router.use("/reset", reset);
router.use("/authenticate", authenticate);
router.use("/bots", bot);
router.use("/update", update);
router.use("/userActions", userActions);

export default router;