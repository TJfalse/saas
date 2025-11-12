/**
 * upload.controller.ts
 * Handles file uploads and creates a BulkImportJob record.
 */

import { Request, Response, NextFunction } from "express";
import UploadService from "../services/upload.service";

class UploadController {
  static async bulkUpload(
    req: Request & any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const file = req.file;
      const tenantId = req.user?.tenantId;
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      const job = await UploadService.enqueueBulkImport({
        filePath: file.path,
        filename: file.originalname,
        tenantId,
      });
      res.json(job);
    } catch (err) {
      next(err);
    }
  }
}

export default UploadController;
