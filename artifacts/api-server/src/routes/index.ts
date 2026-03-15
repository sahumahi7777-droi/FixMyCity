import { Router, type IRouter } from "express";
import healthRouter from "./health";
import issuesRouter from "./issues";

const router: IRouter = Router();

router.use(healthRouter);
router.use(issuesRouter);

export default router;
