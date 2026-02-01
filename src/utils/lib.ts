import { Request, Response, NextFunction } from "express";

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

export const validateBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    requiredFields.forEach((field) => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === "") {
        errors.push(`${field} is required`);
      }
    });

    if (errors.length > 0) {
      return sendResponse(res, 400, null, errors.join(", "));
    }

    next();
  };
};
