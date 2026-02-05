import { Request, Response } from "express";
import { ValidationError, NotFoundError } from "../errors/app.error";
import { sendResponse } from "../utils/lib";
import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/", "video/"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function fileUpload(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const userId = (req as any).userId;

  if (!files || files.length === 0) {
    throw new ValidationError("No files uploaded");
  }

  const uploadedPaths: string[] = [];

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      throw new ValidationError(`File ${file.originalname} exceeds 5MB limit`);
    }

    const isAllowedType = ALLOWED_TYPES.some((type) =>
      file.mimetype.startsWith(type),
    );
    if (!isAllowedType) {
      throw new ValidationError(`File type ${file.mimetype} is not allowed`);
    }

    const uploadDir = path.join(process.cwd(), "public/uploads", userId);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, file.originalname);
    await fs.writeFile(filePath, file.buffer);

    uploadedPaths.push(`/uploads/${userId}/${file.originalname}`);
  }

  return sendResponse(
    res,
    201,
    { paths: uploadedPaths },
    "Upload file successfully",
  );
}

export async function fileDelete(req: Request, res: Response) {
  const { filename } = req.params;
  const userId = (req as any).userId;

  if (!filename) {
    throw new ValidationError("Filename is required");
  }
  if (typeof filename !== "string") {
    throw new ValidationError("Invalid filename");
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    userId,
    filename,
  );

  try {
    // Check if file exists first
    await fs.access(filePath);
    // Delete the file
    await fs.unlink(filePath);

    return sendResponse(res, 200, null, "File deleted successfully");
  } catch (error) {
    // If access or unlink fails, the file doesn't exist or permissions are wrong
    throw new NotFoundError("File not found or unauthorized");
  }
}
