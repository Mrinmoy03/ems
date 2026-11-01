import { Router } from "express";
import {
  getEodReports,
  submitEodReport,
  downloadEodPdf,
} from "../controllers/reportController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/eod", authenticateToken, getEodReports);
router.post("/eod", authenticateToken, submitEodReport);
// PDF download can be accessed with token in query or auth header
router.get("/eod/pdf", downloadEodPdf);

export default router;

