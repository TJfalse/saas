/**
 * booking.service.ts
 * Production-ready booking/reservation management service.
 * Handles table reservations, availability checks, and booking lifecycle.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";

import { BookingStatus } from "@prisma/client";

interface BookingData {
  tenantId: string;
  branchId: string;
  tableId?: string;
  customerName: string;
  customerPhone?: string;
  partySize: number;
  startTime: Date;
  endTime: Date;
  deposit?: number;
  notes?: string;
}

class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(bookingData: BookingData) {
    try {
      // Validate input
      if (
        !bookingData.tenantId ||
        !bookingData.branchId ||
        !bookingData.customerName ||
        !bookingData.partySize
      ) {
        throw new Error(
          "Tenant ID, branch ID, customer name, and party size are required"
        );
      }

      if (bookingData.partySize <= 0) {
        throw new Error("Party size must be greater than 0");
      }

      // Validate dates
      if (bookingData.startTime >= bookingData.endTime) {
        throw new Error("End time must be after start time");
      }

      if (bookingData.startTime < new Date()) {
        throw new Error("Cannot book in the past");
      }

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: bookingData.tenantId },
      });

      if (!tenant) {
        throw new Error("Tenant not found");
      }

      // Verify branch belongs to tenant
      const branch = await prisma.branch.findFirst({
        where: {
          id: bookingData.branchId,
          tenantId: bookingData.tenantId,
        },
      });

      if (!branch) {
        throw new Error("Branch not found or does not belong to this tenant");
      }

      // Check table capacity if table is selected
      if (bookingData.tableId) {
        const table = await prisma.table.findFirst({
          where: {
            id: bookingData.tableId,
            branchId: bookingData.branchId,
          },
        });

        if (!table) {
          throw new Error("Table not found");
        }

        if (!table.isActive) {
          throw new Error("Table is not active");
        }

        if (bookingData.partySize > table.capacity) {
          throw new Error(`Table capacity is ${table.capacity}`);
        }

        // Check for conflicting bookings
        const conflictingBooking = await prisma.booking.findFirst({
          where: {
            tableId: bookingData.tableId,
            status: { in: ["PENDING", "CONFIRMED"] },
            OR: [
              {
                startTime: { lt: bookingData.endTime },
                endTime: { gt: bookingData.startTime },
              },
            ],
          },
        });

        if (conflictingBooking) {
          throw new Error("Table not available for this time slot");
        }
      }

      const booking = await prisma.booking.create({
        data: {
          tenantId: bookingData.tenantId,
          branchId: bookingData.branchId,
          tableId: bookingData.tableId,
          customerName: bookingData.customerName,
          customerPhone: bookingData.customerPhone,
          partySize: bookingData.partySize,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          deposit: bookingData.deposit,
          notes: bookingData.notes,
          status: "PENDING",
        },
        include: { table: true, branch: true },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          tenantId: bookingData.tenantId,
          action: "CREATE",
          resource: "Booking",
          newValues: booking as any,
        },
      });

      logger.info(`Booking created: ${booking.id}`);

      return booking;
    } catch (error) {
      logger.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Get booking by ID with proper tenant isolation
   */
  static async getBookingById(bookingId: string, tenantId: string) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          tenantId,
        },
        include: {
          table: true,
          branch: true,
          tenant: true,
        },
      });

      if (!booking) {
        throw new Error("Booking not found");
      }

      return booking;
    } catch (error) {
      logger.error("Error getting booking:", error);
      throw error;
    }
  }

  /**
   * Get all bookings for a branch
   */
  static async getBookingsByBranch(
    branchId: string,
    tenantId: string,
    page = 1,
    limit = 20,
    status?: string
  ) {
    try {
      if (!branchId || !tenantId) {
        throw new Error("Branch ID and tenant ID are required");
      }

      if (page < 1 || limit < 1) {
        throw new Error("Page and limit must be positive numbers");
      }

      const skip = (page - 1) * limit;

      const where: any = {
        branchId,
        tenantId,
      };

      if (status) {
        where.status = status;
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: { table: true },
          skip,
          take: limit,
          orderBy: { startTime: "desc" },
        }),
        prisma.booking.count({ where }),
      ]);

      return {
        bookings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Error getting bookings:", error);
      throw error;
    }
  }

  /**
   * Update booking (for modifying time, party size, etc.)
   */
  static async updateBooking(
    bookingId: string,
    tenantId: string,
    updateData: Partial<BookingData> & { status?: string }
  ) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      // Get current booking
      const currentBooking = await this.getBookingById(bookingId, tenantId);

      // Can't update confirmed or completed bookings
      if (
        ["CONFIRMED", "COMPLETED", "CANCELLED"].includes(currentBooking.status)
      ) {
        throw new Error(`Cannot update ${currentBooking.status} bookings`);
      }

      // Re-validate if times are being changed
      if (updateData.startTime && updateData.endTime) {
        if (updateData.startTime >= updateData.endTime) {
          throw new Error("End time must be after start time");
        }

        // Check for conflicts with new time
        if (currentBooking.tableId) {
          const conflict = await prisma.booking.findFirst({
            where: {
              tableId: currentBooking.tableId,
              id: { not: bookingId },
              status: { in: ["PENDING", "CONFIRMED"] },
              startTime: { lt: updateData.endTime },
              endTime: { gt: updateData.startTime },
            },
          });

          if (conflict) {
            throw new Error("Table not available for this new time slot");
          }
        }
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          customerName: updateData.customerName,
          customerPhone: updateData.customerPhone,
          partySize: updateData.partySize,
          startTime: updateData.startTime,
          endTime: updateData.endTime,
          deposit: updateData.deposit,
          notes: updateData.notes,
          status: updateData.status as BookingStatus | undefined,
        },
        include: { table: true, branch: true },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          tenantId,
          action: "UPDATE",
          resource: "Booking",
          oldValues: currentBooking as any,
          newValues: updated as any,
        },
      });

      logger.info(`Booking updated: ${bookingId}`);

      return updated;
    } catch (error) {
      logger.error("Error updating booking:", error);
      throw error;
    }
  }

  /**
   * Confirm a pending booking
   */
  static async confirmBooking(bookingId: string, tenantId: string) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      const booking = await this.getBookingById(bookingId, tenantId);

      if (booking.status !== "PENDING") {
        throw new Error(`Cannot confirm ${booking.status} bookings`);
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
        include: { table: true, branch: true },
      });

      logger.info(`Booking confirmed: ${bookingId}`);

      return updated;
    } catch (error) {
      logger.error("Error confirming booking:", error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(
    bookingId: string,
    tenantId: string,
    reason?: string
  ) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      const booking = await this.getBookingById(bookingId, tenantId);

      if (booking.status === "COMPLETED") {
        throw new Error("Cannot cancel completed bookings");
      }

      if (booking.status === "CANCELLED") {
        throw new Error("Booking already cancelled");
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          notes: reason
            ? `${
                booking.notes ? booking.notes + " | " : ""
              }Cancelled: ${reason}`
            : undefined,
        },
        include: { table: true, branch: true },
      });

      logger.info(`Booking cancelled: ${bookingId}`);

      return updated;
    } catch (error) {
      logger.error("Error cancelling booking:", error);
      throw error;
    }
  }

  /**
   * Complete a booking
   */
  static async completeBooking(bookingId: string, tenantId: string) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      const booking = await this.getBookingById(bookingId, tenantId);

      if (booking.status === "COMPLETED") {
        throw new Error("Booking already completed");
      }

      if (booking.status === "CANCELLED") {
        throw new Error("Cannot complete cancelled bookings");
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "COMPLETED" },
        include: { table: true, branch: true },
      });

      logger.info(`Booking completed: ${bookingId}`);

      return updated;
    } catch (error) {
      logger.error("Error completing booking:", error);
      throw error;
    }
  }

  /**
   * Mark booking as NO_SHOW
   */
  static async markNoShow(bookingId: string, tenantId: string) {
    try {
      if (!bookingId || !tenantId) {
        throw new Error("Booking ID and tenant ID are required");
      }

      const booking = await this.getBookingById(bookingId, tenantId);

      if (booking.status === "NO_SHOW") {
        throw new Error("Booking already marked as NO_SHOW");
      }

      if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
        throw new Error(
          "Cannot mark completed or cancelled bookings as NO_SHOW"
        );
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "NO_SHOW" },
        include: { table: true, branch: true },
      });

      logger.info(`Booking marked as NO_SHOW: ${bookingId}`);

      return updated;
    } catch (error) {
      logger.error("Error marking booking as NO_SHOW:", error);
      throw error;
    }
  }

  /**
   * Check table availability
   */
  static async checkTableAvailability(
    tableId: string,
    startTime: Date,
    endTime: Date,
    tenantId: string
  ) {
    try {
      if (!tableId || !startTime || !endTime || !tenantId) {
        throw new Error("Table ID, times, and tenant ID are required");
      }

      const conflict = await prisma.booking.findFirst({
        where: {
          tableId,
          status: { in: ["PENDING", "CONFIRMED"] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
          tenantId,
        },
      });

      return !conflict;
    } catch (error) {
      logger.error("Error checking availability:", error);
      throw error;
    }
  }

  /**
   * Get available tables for a branch
   */
  static async getAvailableTables(
    branchId: string,
    tenantId: string,
    startTime: Date,
    endTime: Date,
    partySize: number
  ) {
    try {
      if (!branchId || !tenantId || !startTime || !endTime || !partySize) {
        throw new Error("All parameters are required");
      }

      if (partySize <= 0) {
        throw new Error("Party size must be greater than 0");
      }

      const tables = await prisma.table.findMany({
        where: {
          branchId,
          capacity: { gte: partySize },
          isActive: true,
          bookings: {
            none: {
              status: { in: ["PENDING", "CONFIRMED"] },
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          },
        },
        orderBy: { capacity: "asc" },
      });

      return tables;
    } catch (error) {
      logger.error("Error getting available tables:", error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings for a branch
   */
  static async getUpcomingBookings(
    branchId: string,
    tenantId: string,
    hours = 24
  ) {
    try {
      if (!branchId || !tenantId) {
        throw new Error("Branch ID and tenant ID are required");
      }

      const now = new Date();
      const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

      const bookings = await prisma.booking.findMany({
        where: {
          branchId,
          tenantId,
          startTime: { gte: now, lte: future },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        include: { table: true },
        orderBy: { startTime: "asc" },
      });

      return bookings;
    } catch (error) {
      logger.error("Error getting upcoming bookings:", error);
      throw error;
    }
  }

  /**
   * Create a new booking (alias for createBooking)
   */
  static async create(bookingData: BookingData) {
    return this.createBooking(bookingData);
  }

  /**
   * List bookings by branch (alias for getBookingsByBranch)
   */
  static async listByBranch(
    branchId: string,
    tenantId: string,
    page = 1,
    limit = 20
  ) {
    return this.getBookingsByBranch(branchId, tenantId, page, limit);
  }
}

export default BookingService;
