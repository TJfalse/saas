/**
 * report.service.ts
 * Production-ready reporting and export service.
 * Generates sales, inventory, and staff performance reports with data analysis.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";
import { Decimal } from "@prisma/client/runtime/library";

class ReportService {
  /**
   * Generate sales report for date range
   */
  static async getSalesReport(
    tenantId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Get completed orders in date range
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          status: "COMPLETED",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          items: true,
          invoices: {
            select: { status: true },
          },
          branch: { select: { name: true } },
        },
      });

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, o) => {
        const oTotal =
          o.total instanceof Decimal ? o.total : new Decimal(o.total);
        return sum.plus(oTotal);
      }, new Decimal(0));

      const totalTax = orders.reduce((sum, o) => {
        const oTax = o.tax instanceof Decimal ? o.tax : new Decimal(o.tax || 0);
        return sum.plus(oTax);
      }, new Decimal(0));

      const totalDiscount = orders.reduce((sum, o) => {
        const oDiscount =
          o.discount instanceof Decimal
            ? o.discount
            : new Decimal(o.discount || 0);
        return sum.plus(oDiscount);
      }, new Decimal(0));

      const totalItems = orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
        0
      );
      const paidOrders = orders.filter((o) =>
        o.invoices.some((inv) => inv.status === "PAID")
      ).length;

      logger.info(
        `Sales report generated for tenant ${tenantId}: ${orders.length} orders`
      );

      return {
        period: {
          startDate,
          endDate,
        },
        summary: {
          totalOrders: orders.length,
          paidOrders,
          totalRevenue: totalRevenue.toString(),
          totalTax: totalTax.toString(),
          totalDiscount: totalDiscount.toString(),
          netRevenue: totalRevenue.minus(totalDiscount).toString(),
          averageOrderValue:
            orders.length > 0
              ? parseFloat(
                  totalRevenue
                    .dividedBy(orders.length)
                    .toDecimalPlaces(2)
                    .toString()
                )
              : 0,
          totalItems,
        },
        byBranch: this.groupByBranch(orders),
        orders: orders.map((o) => ({
          id: o.id,
          branch: o.branch.name,
          total: o.total,
          tax: o.tax,
          discount: o.discount,
          items: o.items.length,
          createdAt: o.createdAt,
        })),
      };
    } catch (error) {
      logger.error("Error generating sales report:", error);
      throw error;
    }
  }

  /**
   * Generate inventory report
   */
  static async getInventoryReport(tenantId: string, branchId?: string) {
    try {
      const query: any = { where: { tenantId } };
      if (branchId) query.where.branchId = branchId;

      // Get all stock items with product details
      const stockItems = await prisma.stockItem.findMany({
        ...query,
        include: {
          product: {
            select: {
              sku: true,
              name: true,
              category: true,
              price: true,
              costPrice: true,
            },
          },
        },
      });

      // Calculate metrics
      const lowStockItems = stockItems.filter((s) => s.qty <= s.minQty);
      const outOfStockItems = stockItems.filter((s) => s.qty === 0);
      const totalInventoryValue = stockItems.reduce(
        (sum, s) => sum + ((s as any).product.costPrice || 0) * s.qty,
        0
      );

      logger.info(
        `Inventory report generated for tenant ${tenantId}: ${stockItems.length} items`
      );

      return {
        summary: {
          totalItems: stockItems.length,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length,
          totalInventoryValue,
          averageItemValue:
            stockItems.length > 0 ? totalInventoryValue / stockItems.length : 0,
        },
        lowStock: lowStockItems.map((s) => ({
          productId: s.productId,
          productName: (s as any).product.name,
          sku: (s as any).product.sku,
          category: (s as any).product.category,
          currentQty: s.qty,
          minQty: s.minQty,
          costPrice: (s as any).product.costPrice,
          value: ((s as any).product.costPrice || 0) * s.qty,
        })),
        outOfStock: outOfStockItems.map((s) => ({
          productId: s.productId,
          productName: (s as any).product.name,
          sku: (s as any).product.sku,
          category: (s as any).product.category,
          lastUpdated: s.updatedAt,
        })),
      };
    } catch (error) {
      logger.error("Error generating inventory report:", error);
      throw error;
    }
  }

  /**
   * Generate staff performance report
   */
  static async getStaffPerformanceReport(
    tenantId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Get all staff
      const staff = await prisma.user.findMany({
        where: {
          tenantId,
          role: { in: ["WAITER", "KITCHEN", "STAFF"] },
        },
      });

      // Get orders by staff
      const orders = await prisma.order.findMany({
        where: {
          tenantId,
          userId: { in: staff.map((s) => s.id) },
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      // Group by staff
      const performanceByStaff = staff.map((s) => {
        const staffOrders = orders.filter((o) => o.userId === s.id);
        const totalRevenue = staffOrders.reduce((sum, o) => {
          const oTotal =
            o.total instanceof Decimal ? o.total : new Decimal(o.total);
          return sum.plus(oTotal);
        }, new Decimal(0));

        return {
          staffId: s.id,
          staffName: s.name || s.email,
          role: s.role,
          ordersCount: staffOrders.length,
          totalRevenue: totalRevenue.toString(),
          averageOrderValue:
            staffOrders.length > 0
              ? parseFloat(
                  totalRevenue
                    .dividedBy(staffOrders.length)
                    .toDecimalPlaces(2)
                    .toString()
                )
              : 0,
          lastLogin: s.lastLogin,
        };
      });

      logger.info(
        `Staff performance report generated for tenant ${tenantId}: ${staff.length} staff`
      );

      return {
        period: {
          startDate,
          endDate,
        },
        totalStaff: staff.length,
        activeStaff: performanceByStaff.filter((p) => p.ordersCount > 0).length,
        topPerformers: performanceByStaff
          .sort((a, b) => {
            const aRev = new Decimal(a.totalRevenue);
            const bRev = new Decimal(b.totalRevenue);
            return bRev.minus(aRev).toNumber();
          })
          .slice(0, 5),
        performance: performanceByStaff,
      };
    } catch (error) {
      logger.error("Error generating staff performance report:", error);
      throw error;
    }
  }

  /**
   * Generate payment report
   */
  static async getPaymentReport(
    tenantId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Get all payments
      const payments = await prisma.payment.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          invoice: {
            select: { invoiceNumber: true, orderId: true },
          },
        },
      });

      // Group by method
      const byMethod = payments.reduce((acc: any, p) => {
        if (!acc[p.method]) acc[p.method] = [];
        acc[p.method].push(p);
        return acc;
      }, {});

      // Calculate metrics
      const completedPayments = payments.filter(
        (p) => p.status === "COMPLETED"
      );
      const failedPayments = payments.filter((p) => p.status === "FAILED");
      const totalAmount = completedPayments.reduce((sum, p) => {
        const pAmount =
          p.amount instanceof Decimal ? p.amount : new Decimal(p.amount);
        return sum.plus(pAmount);
      }, new Decimal(0));

      logger.info(
        `Payment report generated for tenant ${tenantId}: ${payments.length} payments`
      );

      return {
        period: { startDate, endDate },
        summary: {
          totalPayments: payments.length,
          completedPayments: completedPayments.length,
          failedPayments: failedPayments.length,
          totalAmount: totalAmount.toString(),
          successRate:
            payments.length > 0
              ? (completedPayments.length / payments.length) * 100
              : 0,
        },
        byMethod: Object.entries(byMethod).map(
          ([method, methodPayments]: any) => ({
            method,
            count: methodPayments.length,
            amount: methodPayments.reduce((s: any, p: any) => s + p.amount, 0),
          })
        ),
        payments: payments.map((p) => ({
          id: p.id,
          invoiceNumber: p.invoice.invoiceNumber,
          method: p.method,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
        })),
      };
    } catch (error) {
      logger.error("Error generating payment report:", error);
      throw error;
    }
  }

  /**
   * Export sales data as JSON
   */
  static async exportSalesData(
    tenantId: string,
    startDate: string,
    endDate: string
  ) {
    try {
      const report = await this.getSalesReport(tenantId, startDate, endDate);

      const json = JSON.stringify(report, null, 2);
      const buffer = Buffer.from(json);

      logger.info(`Sales data exported for tenant ${tenantId}`);

      return buffer;
    } catch (error) {
      logger.error("Error exporting sales data:", error);
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  static async getDashboardSummary(tenantId: string) {
    try {
      // Get today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayOrders = await prisma.order.findMany({
        where: {
          tenantId,
          status: "COMPLETED",
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const todaySales = todayOrders.reduce((sum, o) => {
        const oTotal =
          o.total instanceof Decimal ? o.total : new Decimal(o.total);
        return sum.plus(oTotal);
      }, new Decimal(0));

      // Get pending orders
      const pendingOrders = await prisma.order.count({
        where: { tenantId, status: "PENDING" },
      });

      // Get low stock items
      const lowStock = await prisma.stockItem.findMany({
        where: { tenantId },
      });
      const lowStockCount = lowStock.filter((s) => s.qty <= s.minQty).length;

      // Get pending invoices
      const pendingInvoices = await prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ["DRAFT", "SENT"] },
        },
      });

      logger.info(`Dashboard summary generated for tenant ${tenantId}`);

      return {
        sales: {
          todayRevenue: todaySales.toString(),
          todayOrders: todayOrders.length,
        },
        orders: {
          pendingCount: pendingOrders,
        },
        inventory: {
          lowStockCount,
        },
        billing: {
          pendingInvoices,
        },
      };
    } catch (error) {
      logger.error("Error generating dashboard summary:", error);
      throw error;
    }
  }

  /**
   * Helper: Group orders by branch
   */
  private static groupByBranch(orders: any[]) {
    const grouped = orders.reduce((acc: any, o: any) => {
      const branchName = o.branch?.name || "Unknown";
      if (!acc[branchName]) {
        acc[branchName] = [];
      }
      acc[branchName].push(o);
      return acc;
    }, {});

    return Object.entries(grouped).map(([branch, branchOrders]: any) => ({
      branch,
      count: branchOrders.length,
      revenue: branchOrders.reduce((s: any, o: any) => s + o.total, 0),
    }));
  }
}

export default ReportService;
