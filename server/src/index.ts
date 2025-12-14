import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import sweetsRouter from "./routes/sweets.routes";
import authRouter from "./routes/auth.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/sweets", sweetsRouter);
app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Sweets Management API is running");
});

console.log("hello");

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
