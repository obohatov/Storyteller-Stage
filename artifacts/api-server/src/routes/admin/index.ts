import { Router, type IRouter } from "express";
import { requireAdmin } from "../../lib/adminGuard";
import fairyTalesRouter from "./fairy-tales";
import playsRouter from "./plays";
import aboutRouter from "./about";
import dashboardRouter from "./dashboard";

const adminRouter: IRouter = Router();

// Guard: every /admin/* endpoint requires a verified admin identity (401 / 403).
adminRouter.use(requireAdmin);

adminRouter.use(dashboardRouter);
adminRouter.use(fairyTalesRouter);
adminRouter.use(playsRouter);
adminRouter.use(aboutRouter);

export default adminRouter;
