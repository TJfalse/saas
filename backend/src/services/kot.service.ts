/**
 * kot.service.ts
 * Production-ready KOT (Kitchen Order Ticket) management service.
 * Handles KOT creation, retrieval, and print orchestration with proper validations.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import { getQueue } from "../queues/queue.config";

interface KOTData {
  orderId: string;
  branchId: string;
  tenantId: string;
  payload: Record<string, any>;
}

class KOTService {
  /**
   * Create a new KOT for an order
   */
  static async createKOT(data: KOTData) {
    try {
      // Validate input
      if (!data.orderId || !data.branchId || !data.tenantId || !data.payload) {
        throw new Error(
          "Order ID, branch ID, tenant ID, and payload are required"
        );
      }

      // Verify order exists and belongs to correct tenant/branch
      const order = await prisma.order.findFirst({
        where: {
          id: data.orderId,
          tenantId: data.tenantId,
          branchId: data.branchId,
        },
      });

      if (!order) {
        throw new Error(
          "Order not found or does not belong to this tenant/branch"
        );
      }

      // Check if KOT already exists for this order
      const existingKOT = await prisma.kOT.findFirst({
        where: { orderId: data.orderId },
      });

      if (existingKOT) {
        throw new Error("KOT already exists for this order");
      }

      // Create KOT
      const kot = await prisma.kOT.create({
        data: {
          orderId: data.orderId,
          branchId: data.branchId,
          tenantId: data.tenantId,
          payload: data.payload,
          printed: false,
        },
      });

      logger.info(`KOT created: ${kot.id} for order ${data.orderId}`);

      return kot;
    } catch (error) {
      logger.error("Error creating KOT:", error);
      throw error;
    }
  }

  /**
   * Get KOT by ID with validation
   */
  static async getKOT(kotId: string, tenantId: string) {
    try {
      if (!kotId || !tenantId) {
        throw new Error("KOT ID and tenant ID are required");
      }

      const kot = await prisma.kOT.findFirst({
        where: {
          id: kotId,
          tenantId,
        },
      });

      if (!kot) {
        throw new Error("KOT not found");
      }

      return kot;
    } catch (error) {
      logger.error("Error getting KOT:", error);
      throw error;
    }
  }

  /**
   * List KOTs by branch with pagination
   */
  static async listByBranch(
    branchId: string,
    tenantId: string,
    page = 1,
    limit = 50
  ) {
    try {
      if (!branchId || !tenantId) {
        throw new Error("Branch ID and tenant ID are required");
      }

      const skip = (page - 1) * limit;

      const [kots, total] = await Promise.all([
        prisma.kOT.findMany({
          where: {
            branchId,
            tenantId,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.kOT.count({
          where: {
            branchId,
            tenantId,
          },
        }),
      ]);

      return { kots, total, page, limit };
    } catch (error) {
      logger.error("Error listing KOTs:", error);
      throw error;
    }
  }

  /**
   * Get unprinted KOTs for a branch
   */
  static async getUnprintedKOTs(branchId: string, tenantId: string) {
    try {
      if (!branchId || !tenantId) {
        throw new Error("Branch ID and tenant ID are required");
      }

      const kots = await prisma.kOT.findMany({
        where: {
          branchId,
          tenantId,
          printed: false,
        },
        orderBy: { createdAt: "asc" },
      });

      return kots;
    } catch (error) {
      logger.error("Error getting unprinted KOTs:", error);
      throw error;
    }
  }

  /**
   * Print a KOT and send to print queue
   */
  static async printKOT(kotId: string, tenantId: string) {
    try {
      if (!kotId || !tenantId) {
        throw new Error("KOT ID and tenant ID are required");
      }

      // Get and validate KOT
      const kot = await this.getKOT(kotId, tenantId);

      if (kot.printed) {
        throw new Error("KOT already printed");
      }

      // Update print status
      const updatedKOT = await prisma.kOT.update({
        where: { id: kotId },
        data: {
          printed: true,
          printedAt: new Date(),
        },
      });

      // Send to print queue
      const q = getQueue("printers");
      await q.add("print-kot", {
        kotId,
        tenantId,
        payload: kot.payload,
        orderId: kot.orderId,
      });

      logger.info(`KOT sent to print: ${kotId}`);

      return updatedKOT;
    } catch (error) {
      logger.error("Error printing KOT:", error);
      throw error;
    }
  }

  /**
   * Print multiple KOTs
   */
  static async printMultipleKOTs(kotIds: string[], tenantId: string) {
    try {
      if (!kotIds || kotIds.length === 0 || !tenantId) {
        throw new Error("KOT IDs array and tenant ID are required");
      }

      const results = [];
      const errors: any[] = [];

      for (const kotId of kotIds) {
        try {
          const result = await this.printKOT(kotId, tenantId);
          results.push(result);
        } catch (error) {
          errors.push({ kotId, error: (error as Error).message });
        }
      }

      logger.info(
        `Batch print completed: ${results.length} successful, ${errors.length} failed`
      );

      return { results, errors };
    } catch (error) {
      logger.error("Error printing multiple KOTs:", error);
      throw error;
    }
  }

  /**
   * Mark KOT as printed (without queue)
   */
  static async markAsPrinted(kotId: string, tenantId: string) {
    try {
      if (!kotId || !tenantId) {
        throw new Error("KOT ID and tenant ID are required");
      }

      const kot = await prisma.kOT.update({
        where: { id: kotId },
        data: {
          printed: true,
          printedAt: new Date(),
        },
      });

      logger.info(`KOT marked as printed: ${kotId}`);

      return kot;
    } catch (error) {
      logger.error("Error marking KOT as printed:", error);
      throw error;
    }
  }

  /**
   * Delete KOT (soft delete not implemented, hard delete for unpublished)
   */
  static async deleteKOT(kotId: string, tenantId: string) {
    try {
      if (!kotId || !tenantId) {
        throw new Error("KOT ID and tenant ID are required");
      }

      const kot = await this.getKOT(kotId, tenantId);

      if (kot.printed) {
        throw new Error("Cannot delete printed KOT");
      }

      await prisma.kOT.delete({
        where: { id: kotId },
      });

      logger.info(`KOT deleted: ${kotId}`);

      return { id: kotId, deleted: true };
    } catch (error) {
      logger.error("Error deleting KOT:", error);
      throw error;
    }
  }
}

export default KOTService;
