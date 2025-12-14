import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Sweets Schemas
export const createSweetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
});

export const updateSweetSchema = createSweetSchema.partial();

export const searchSweetSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(), // Coerce query params to numbers
  maxPrice: z.coerce.number().optional(),
});

// Inventory Schemas
export const purchaseSchema = z.object({
  quantityToBuy: z.number().int().positive().default(1),
});

export const restockSchema = z.object({
  quantityToAdd: z.number().int().positive(),
});
