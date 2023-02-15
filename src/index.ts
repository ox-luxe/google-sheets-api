import express, { Express } from "express";
import { routes } from "./routes";

const app: Express = express();

app.use(express.json()); // to support JSON-encoded bodies
app.use("/", routes());

app.listen(process.env.PORT || 8080, () => {
  console.log("App running on port 8080...");
});

export default app;
