import express from "express";
import * as roundResultController from "../controller/roundResultController.js";

const router = express.Router();

router.get("/fetch-round-results/:driveId", roundResultController.fetchRoundResults);
router.delete("/delete-all-rounds/:driveId", roundResultController.deleteRoundResults);

export default router;