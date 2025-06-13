import { Router } from 'express';

import signUpload from "./posts/requestUploadKey"
import createPost from './posts/createPost';
import feed from "./posts/feed";
import getPost from "./posts/getPost";
import relevantPosts from "./posts/relevantPosts";
import commentSection from "./posts/commentSection";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/getPost", getPost)
router.use("/relevantPosts", relevantPosts)
router.use("/commentSection", commentSection)

export default router;