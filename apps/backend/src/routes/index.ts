import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import leadsRouter from "./leads";
import tasksRouter from "./tasks";
import teamRouter from "./team";
import dashboardRouter from "./dashboard";
import analyticsRouter from "./analytics";
import activitiesRouter from "./activities";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(leadsRouter);
router.use(tasksRouter);
router.use(teamRouter);
router.use(dashboardRouter);
router.use(analyticsRouter);
router.use(activitiesRouter);

export default router;
