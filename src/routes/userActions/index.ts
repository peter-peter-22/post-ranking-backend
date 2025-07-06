import { Router } from 'express';

import commentSection from "./posts/commentSection";
import createPost from './posts/createPost';
import feed from "./posts/feed";
import contentsOfuser from "./posts/getContentsOfUser";
import relevantPosts from "./posts/relevantPosts";
import signUpload from "./posts/requestUploadKey";
import searchPosts from "./posts/search";
import trendFeeds from "./trends/trendFeeds";
import follow from "./users/follow";
import searchUsers from "./users/search";
import whoToFollow from "./users/whoToFollow";
import updatePost from "./posts/updatePost";
import deletePost from "./posts/deletePost";

const router = Router();

router.use("/signUpload", signUpload)
router.use("/create", createPost)
router.use("/feed", feed)
router.use("/relevantPosts", relevantPosts)
router.use("/commentSection", commentSection)
router.use("/userContents", contentsOfuser)
router.use("/follow", follow)
router.use("/whoToFollow", whoToFollow)
router.use("/searchPosts", searchPosts)
router.use("/searchUsers", searchUsers)
router.use("/trends", trendFeeds)
router.use("/updatePost", updatePost)
router.use("/deletePost", deletePost)

export default router;