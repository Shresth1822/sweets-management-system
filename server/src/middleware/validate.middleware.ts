import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === "body") {
        req.body = schema.parse(req.body);
      } else if (source === "query") {
        req.query = schema.parse(req.query) as any;
      } else if (source === "params") {
        req.params = schema.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: (error as any).errors.map((e: any) => ({
            path: e.path,
            message: e.message,
          })),
        });
      } else {
        res.status(500).json({ error: "Internal validation error" });
      }
    }
  };
