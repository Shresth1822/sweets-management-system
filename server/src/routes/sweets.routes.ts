import { Router, Request, Response } from "express";
import { query } from "../db/index";

const router = Router();

// GET /api/sweets
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM sweets");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching sweets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
