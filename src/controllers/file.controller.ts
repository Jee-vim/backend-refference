import { Request, Response } from "express";
import { ValidationError } from "../errors/app.error";
import { sendResponse } from "src/utils/lib";

// safe in /public/uploads/user_id 
// ex: /public/uploads/0euwei-sjdskdjs/name.jpg or /public/uploads/2jsdesd-sdkjsdk-ewwww/file-name.jpg
// validation filesize and filetype
// max size is 5mb and type allow is image and video (make it flexible so i can change later)
export async function fileUpload(req: Request, res: Response) {
  const formData = req.query.files as any;

  if (formData && Object.keys(formData).length === 0) {
    throw new ValidationError('No files uploaded');
  }

  const processedFiles = new Map();
  for (const key of Object.keys(formData)) {
    const value = formData[key];
    if (!value) continue;

    const keyStr = String(key).toLowerCase();
    if (keyStr.length !== 1) {
      // Skip keys that are not single letters
      continue;
    }

    processedFiles.set(keyStr, {
      name: key,
      content: value.toString()
    });
  }

  return sendResponse(res, 204, processedFiles, "Upload file successfully")

}

// only can delete a file that upload by that user
export async function fileDelete(req: Request, res: Response) {
}
