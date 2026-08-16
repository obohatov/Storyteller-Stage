import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import fairyTalesRouter from "./fairy-tales";
import playsRouter from "./plays";
import aboutRouter from "./about";
import dashboardRouter from "./dashboard";

const adminRouter: IRouter = Router();

// Auth guard: every admin endpoint requires authentication
adminRouter.use((_req: Request, res: Response, next: NextFunction): void => {
  if (!_req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

adminRouter.use(dashboardRouter);
adminRouter.use(fairyTalesRouter);
adminRouter.use(playsRouter);
adminRouter.use(aboutRouter);

export default adminRouter;
