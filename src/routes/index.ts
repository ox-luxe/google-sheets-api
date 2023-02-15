import express from "express";
import { googleSheetRoute } from "./googleSheet";
const router = express.Router();

function routes() {
  router.get("/healthcheck", (req, res) => {
    res.send({ message: "Server Active!" });
  });
  router.use("/api/googlesheet/product-inbound", googleSheetRoute());
  return router;
}

export { routes };
