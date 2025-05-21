import { Router } from 'express';

import signUpload from "./requestUploadKey"
import createPost from './createPost';
import feed from "./feed";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)


export default router;