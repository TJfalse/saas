/**
 * upload.service.ts
 * Production-ready file upload and bulk import service.
 * Handles CSV/Excel uploads for data import with queue processing.
 */

import prisma from "../config/db.config";
import { getQueue } from "../queues/queue.config";
import logger from "../config/logger";

interface BulkImportData {
  filePath: string;
  filename: string;
  tenantId: string;
}

class UploadService {
  /**
   * Enqueue bulk import job
   */
  static async enqueueBulkImport({
    filePath,
    filename,
    tenantId,
  }: BulkImportData) {
    try {
      // Validate input
      if (!tenantId || !filename || !filePath) {
        throw new Error("tenantId, filename, and filePath are required");
      }

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      // Create bulk import job record
      const job = await prisma.bulkImportJob.create({
        data: {
          tenantId,
          filename,
          status: "PENDING",
        },
      });

      logger.info(`Bulk import job created: ${job.id} for tenant ${tenantId}`);

      // Enqueue background processing
      const q = getQueue("bulkImport");
      await q.add("process-file", {
        jobId: job.id,
        filePath,
        filename,
        tenantId,
      });

      return {
        id: job.id,
        tenantId: job.tenantId,
        filename: job.filename,
        status: job.status,
        createdAt: job.createdAt,
      };
    } catch (error) {
      logger.error("Error enqueuing bulk import:", error);
      throw error;
    }
  }

  /**
   * Get bulk import job status
   */
  static async getJobStatus(jobId: string, tenantId: string) {
    try {
      const job = await prisma.bulkImportJob.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error("Import job not found");
      }

      if (job.tenantId !== tenantId) {
        throw new Error("Unauthorized: Job does not belong to tenant");
      }

      return job;
    } catch (error) {
      logger.error("Error fetching job status:", error);
      throw error;
    }
  }

  /**
   * Update job status after processing
   */
  static async updateJobStatus(
    jobId: string,
    status: "PROCESSING" | "COMPLETED" | "FAILED",
    successCount?: number,
    errors?: number
  ) {
    try {
      const job = await prisma.bulkImportJob.update({
        where: { id: jobId },
        data: {
          status,
          successCount: successCount || 0,
          errors: errors || 0,
          completedAt: ["COMPLETED", "FAILED"].includes(status)
            ? new Date()
            : null,
        },
      });

      logger.info(`Job ${jobId} status updated to ${status}`);

      return job;
    } catch (error) {
      logger.error("Error updating job status:", error);
      throw error;
    }
  }

  /**
   * Get all import jobs for tenant
   */
  static async getImportHistory(tenantId: string, limit: number = 50) {
    try {
      const jobs = await prisma.bulkImportJob.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return jobs;
    } catch (error) {
      logger.error("Error fetching import history:", error);
      throw error;
    }
  }
}

export default UploadService;
