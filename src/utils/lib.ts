import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

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
  page: number,
  limit: number,
  message: string = ""
) => {
  const total_pages = Math.ceil(total_items / limit);

  return res.status(code).json({
    success: code >= 200 && code < 300,
    code,
    message,
    data: {
      items: data,
      pagination: {
        total_items,
        total_pages,
        current_page: page,
        limit,
      },
    },
  });
};

export const validate = (schema: z.ZodTypeAny, target: "body" | "query" | "params" = "body") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync(req[target] || {});

      // Instead of req[target] = parsedData, do this:
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
