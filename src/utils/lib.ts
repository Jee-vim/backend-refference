import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import rateLimit from "express-rate-limit";

export const getSafeParams = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, parseInt(query.page ?? "1"));
  const limit = Math.max(1, parseInt(query.limit ?? "10"));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const sendResponse = (
  res: Response,
  code: number,
  data: unknown = null,
  message: string = "",
) => {
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
  data: unknown[],
  total_items: number,
  page: number = 1,
  limit: number = 10,
  message: string = "",
) => {
  const safeTotalItems = Math.max(0, total_items || 0);

  const total_pages = Math.ceil(safeTotalItems / limit);

  return res.status(code).json({
    success: code >= 200 && code < 300,
    code,
    message,
    data: {
      items: data || [],
      pagination: {
        total_items: safeTotalItems,
        total_pages,
        current_page: page,
        limit,
      },
    },
  });
};

export const validate = (
  schema: z.ZodTypeAny,
  target: "body" | "query" | "params" = "body",
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync(req[target] || {});

      if (target === "query" || target === "params") {
        Object.assign(req[target], parsedData);
      } else {
        req[target] = parsedData;
      }

      next();
    } catch (error) {
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
    standardHeaders: true,
    legacyHeaders: false,
    // This keyGenerator works for both public and private routes
    /* eslint-disable @typescript-eslint/no-explicit-any */
    keyGenerator: (req: any) => req.user?.userId || req.ip,
    // Disable the IPv6 warning for custom key generators
    validate: { keyGeneratorIpFallback: false },
    handler: (_, res) => {
      return sendResponse(
        res,
        429,
        null,
        `Too many requests. Please try again after ${windowMinutes} minutes.`,
      );
    },
  });
};

const MINUTE = 15;
const LIMIT = 100;
export const authLimiter = createLimiter(10, 10);
export const generalLimiter = createLimiter(LIMIT, MINUTE);
export const userLimiter = createLimiter(LIMIT, MINUTE);
export const uploadLimiter = createLimiter(10, 10);
