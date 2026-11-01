"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/eod", auth_1.authenticateToken, reportController_1.getEodReports);
router.post("/eod", auth_1.authenticateToken, reportController_1.submitEodReport);
// PDF download can be accessed with token in query or auth header
router.get("/eod/pdf", reportController_1.downloadEodPdf);
exports.default = router;
