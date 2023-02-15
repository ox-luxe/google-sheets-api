import express from "express";
import multer from "multer";

import { googleSheetControllers } from "../controllers/googleSheetControllers";
const router = express.Router();
const upload = multer();

function googleSheetRoute() {
  router.route("/").post(upload.none(), googleSheetControllers.addNewProducts);
  return router;
}

export { googleSheetRoute };
