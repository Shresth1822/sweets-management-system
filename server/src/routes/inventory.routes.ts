import { Router, Response } from "express";
import { query } from "../db/index";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { purchaseSchema, restockSchema } from "../utils/schemas";

const router = Router();

// POST /api/inventory/:id/purchase
// Transactional: Decrement quantity if available
router.post(
  "/:id/purchase",
  authenticateToken,
  validate(purchaseSchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quantityToBuy } = req.body; // Expecting { quantityToBuy: number }
    const qty = quantityToBuy || 1; // Default to 1 if not specified

    try {
      await query("BEGIN");

      // 1. Check current stock
      const sweetResult = await query(
        "SELECT quantity, name FROM sweets WHERE id = $1 FOR UPDATE",
        [id]
      );

      if (sweetResult.rows.length === 0) {
        await query("ROLLBACK");
        res.status(404).json({ error: "Sweet not found" });
        return;
      }

      const currentQty = sweetResult.rows[0].quantity;

      if (currentQty < qty) {
        await query("ROLLBACK");
        res
          .status(400)
          .json({ error: `Not enough stock. Available: ${currentQty}` });
        return;
      }

      // 2. Decrement stock
      const updateResult = await query(
        "UPDATE sweets SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [qty, id]
      );

      await query("COMMIT");
      res
        .status(200)
        .json({ message: "Purchase successful", sweet: updateResult.rows[0] });
    } catch (err) {
      await query("ROLLBACK");
      console.error("Purchase error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/inventory/:id/restock - Admin Only
router.post(
  "/:id/restock",
  authenticateToken,
  requireAdmin,
  validate(restockSchema),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quantityToAdd } = req.body;

    try {
      const result = await query(
        "UPDATE sweets SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
        [quantityToAdd, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Sweet not found" });
        return;
      }

      res
        .status(200)
        .json({ message: "Restock successful", sweet: result.rows[0] });
    } catch (err) {
      console.error("Restock error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
