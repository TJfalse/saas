import { Router } from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware";
import tenantMiddleware from "../middlewares/tenant.middleware";
import {
  validateRequest,
  validateQuery,
} from "../middlewares/validate.middleware";
import {
  bulkUploadSchema,
  bulkUploadQuerySchema,
} from "../validators/upload.validators";
import UploadController from "../controllers/upload.controller";

const upload = multer({ dest: "/tmp/uploads" });
const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post(
  "/bulk",
  validateRequest(bulkUploadSchema),
  validateQuery(bulkUploadQuerySchema),
  upload.single("file"),
  UploadController.bulkUpload
);

export default router;
