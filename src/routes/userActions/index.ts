import { Router } from 'express';

import signUpload from "./requestUploadKey"
import createPost from './createPost';

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)


export default router;