import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import storageRouter from "./storage";
import publicContentRouter from "./public-content";
import publicMessagesRouter from "./public-messages";
import adminRouter from "./admin/index";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(storageRouter);
router.use(publicContentRouter);
router.use(publicMessagesRouter);
router.use(adminRouter);

export default router;
