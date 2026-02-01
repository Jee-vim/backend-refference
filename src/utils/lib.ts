import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import rateLimit from "express-rate-limit";

export const getSafeParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 10);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const sendResponse = (res: Response, code: number, data: any = null, message: string = "") => {
  return res.status(code).json({
    success: code >= 200 && code < 300,
    code,
    message,
    data,
  });
};

export const sendPaginatedResponse = (
  res: Response,
  code: number,
  data: any[],
  total_items: number,
  page: any,
  limit: any,
  message: string = ""
) => {
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.max(1, parseInt(limit) || 10);
  const safeTotalItems = Math.max(0, total_items || 0);

  const total_pages = Math.ceil(safeTotalItems / safeLimit);

  return res.status(code).json({
    success: code >= 200 && code < 300,
    code,
    message,
    data: {
      items: data || [],
      pagination: {
        total_items: safeTotalItems,
        total_pages,
        current_page: safePage,
        limit: safeLimit,
      },
    },
  });
};

export const validate = (schema: z.ZodTypeAny, target: "body" | "query" | "params" = "body") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync(req[target] || {});

      if (target === "query" || target === "params") {
        Object.assign(req[target], parsedData);
      } else {
        req[target] = parsedData;
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return sendResponse(res, 400, null, message);
      }
      return sendResponse(res, 500, null, "Internal server error");
    }
  };
};

export const createLimiter = (maxRequests: number, windowMinutes: number) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (_, res) => {
      return sendResponse(
        res,
        429,
        null,
        `Too many requests. Please try again after ${windowMinutes} minutes.`
      );
    },
  });
};

export const generalLimiter = createLimiter(100, 15);
export const authLimiter = createLimiter(5, 10);
