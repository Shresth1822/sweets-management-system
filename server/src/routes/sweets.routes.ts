import { Router, Request, Response } from "express";
import { query } from "../db/index";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

// GET /api/sweets
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await query("SELECT * FROM sweets ORDER BY name ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching sweets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/sweets/search
router.get("/search", async (req: Request, res: Response) => {
  const { name, category, minPrice, maxPrice } = req.query;

  let queryText = "SELECT * FROM sweets WHERE 1=1";
  const queryParams: any[] = [];
  let paramCount = 1;

  if (name) {
    queryText += ` AND name ILIKE $${paramCount}`;
    queryParams.push(`%${name}%`);
    paramCount++;
  }

  if (category) {
    queryText += ` AND category ILIKE $${paramCount}`;
    queryParams.push(`%${category}%`);
    paramCount++;
  }

  if (minPrice) {
    queryText += ` AND price >= $${paramCount}`;
    queryParams.push(minPrice);
    paramCount++;
  }

  if (maxPrice) {
    queryText += ` AND price <= $${paramCount}`;
    queryParams.push(maxPrice);
    paramCount++;
  }

  queryText += " ORDER BY name ASC";

  try {
    const result = await query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error searching sweets:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sweets - Protected
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, category, price, quantity } = req.body;
  try {
    const result = await query(
      "INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, category, price, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating sweet:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/sweets/:id - Protected
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, category, price, quantity } = req.body;
    try {
      const result = await query(
        "UPDATE sweets SET name = $1, category = $2, price = $3, quantity = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
        [name, category, price, quantity, id]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error updating sweet:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// DELETE /api/sweets/:id - Admin Only
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      const result = await query(
        "DELETE FROM sweets WHERE id = $1 RETURNING *",
        [id]
      );
      res.status(200).json({ message: "Sweet deleted successfully" });
    } catch (err) {
      console.error("Error deleting sweet:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
