import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === "body") {
        req.body = schema.parse(req.body);
      } else if (source === "query") {
        const parsed = schema.parse(req.query);
        // req.query is a getter/read-only in some environments, so we mutate the object
        Object.assign(req.query as object, parsed);
      } else if (source === "params") {
        req.params = schema.parse(req.params) as any;
      }
      next();
    } catch (error) {
      console.error("Validation Error:", error);

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
