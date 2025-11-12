/**
 * dashboard.service.ts
 * Production-ready dashboard and analytics operations via Prisma.
 *
 * Provides statistics, charts, and overview data with proper aggregations and filtering.
 */

import prisma from "../config/db.config";
import logger from "../config/logger";

/**
 * Get dashboard overview for today and overall
 */
export async function getDashboardOverview(
  tenantId: string,
  branchId?: string
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where: any = { tenantId };
    if (branchId) {
      where.branchId = branchId;
    }

    // Get today's orders
    const todayOrders = await prisma.order.count({
      where: {
        ...where,
        createdAt: { gte: today },
      },
    });

    // Get total orders
    const totalOrders = await prisma.order.count({
      where,
    });

    // Get total revenue (today)
    const todayRevenueData = await prisma.order.aggregate({
      where: {
        ...where,
        createdAt: { gte: today },
      },
      _sum: {
        total: true,
      },
    });

    const todayRevenue = todayRevenueData._sum.total || 0;

    // Get total revenue (all time)
    const totalRevenueData = await prisma.order.aggregate({
      where,
      _sum: {
        total: true,
      },
    });

    const totalRevenue = totalRevenueData._sum.total || 0;

    // Get unique customers for today
    const todayBookings = await prisma.booking.count({
      where: {
        ...where,
        createdAt: { gte: today },
      },
    });

    // Get booking count for a rough customer count
    const totalCustomers = await prisma.booking.findMany({
      where,
      distinct: ["customerPhone"],
      select: { customerPhone: true },
    });

    const overview = {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toString()),
      todayOrders,
      todayRevenue: parseFloat(todayRevenue.toString()),
      totalCustomers: totalCustomers.length,
      totalBookings: todayBookings,
    };

    logger.info(`Dashboard overview fetched for tenant ${tenantId}`);

    return overview;
  } catch (error) {
    logger.error("Error fetching dashboard overview:", error);
    throw error;
  }
}

/**
 * Get sales analytics for a date range
 */
export async function getSalesAnalytics(
  tenantId: string,
  startDate: string,
  endDate: string,
  branchId?: string
) {
  try {
    if (!tenantId || !startDate || !endDate) {
      throw new Error("Tenant ID, start date, and end date are required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new Error("Start date must be before end date");
    }

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    const where: any = {
      tenantId,
      createdAt: { gte: start, lte: end },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        tax: true,
        discount: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
      totalTax: orders.reduce((sum, order) => sum + Number(order.tax), 0),
      totalDiscount: orders.reduce((sum, order) => sum + Number(order.discount), 0),
      orders,
      startDate,
      endDate,
    };

    logger.info(
      `Sales analytics fetched for tenant ${tenantId} from ${startDate} to ${endDate}`
    );

    return analytics;
  } catch (error) {
    logger.error("Error fetching sales analytics:", error);
    throw error;
  }
}

/**
 * Get revenue charts (daily, weekly, monthly)
 */
export async function getRevenueCharts(
  tenantId: string,
  branchId?: string,
  days = 30
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Group by day
    const dailyData: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      dailyData[date] = (dailyData[date] || 0) + Number(order.total);
    });

    // Group by week
    const weeklyData: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + Number(order.total);
    });

    // Group by month
    const monthlyData: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      const monthKey = date.substring(0, 7); // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.total);
    });

    const charts = {
      daily: Object.entries(dailyData).map(([date, revenue]) => ({
        date,
        revenue,
      })),
      weekly: Object.entries(weeklyData).map(([week, revenue]) => ({
        week,
        revenue,
      })),
      monthly: Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue,
      })),
    };

    logger.info(`Revenue charts fetched for tenant ${tenantId}`);

    return charts;
  } catch (error) {
    logger.error("Error fetching revenue charts:", error);
    throw error;
  }
}

/**
 * Get top products by revenue or quantity
 */
export async function getTopProducts(
  tenantId: string,
  limit = 10,
  branchId?: string
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const where: any = {
      order: {
        tenantId,
      },
    };

    if (branchId) {
      where.order.branchId = branchId;
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where,
      _sum: {
        qty: true,
        price: true,
      },
      orderBy: {
        _sum: {
          price: "desc",
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = topProducts.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const result = topProducts.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || "Unknown",
        quantity: item._sum.qty || 0,
        revenue: item._sum.price || 0,
      };
    });

    logger.info(`Top products fetched for tenant ${tenantId}`);

    return result;
  } catch (error) {
    logger.error("Error fetching top products:", error);
    throw error;
  }
}

/**
 * Get booking statistics
 */
export async function getBookingStats(tenantId: string, branchId?: string) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const where: any = { tenantId };
    if (branchId) {
      where.branchId = branchId;
    }

    const stats = {
      totalBookings: await prisma.booking.count({ where }),
      pendingBookings: await prisma.booking.count({
        where: { ...where, status: "PENDING" },
      }),
      confirmedBookings: await prisma.booking.count({
        where: { ...where, status: "CONFIRMED" },
      }),
      completedBookings: await prisma.booking.count({
        where: { ...where, status: "COMPLETED" },
      }),
      cancelledBookings: await prisma.booking.count({
        where: { ...where, status: "CANCELLED" },
      }),
      noShowBookings: await prisma.booking.count({
        where: { ...where, status: "NO_SHOW" },
      }),
    };

    logger.info(`Booking stats fetched for tenant ${tenantId}`);

    return stats;
  } catch (error) {
    logger.error("Error fetching booking stats:", error);
    throw error;
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(tenantId: string, branchId?: string) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const where: any = { tenantId };
    if (branchId) {
      where.invoice = { order: { branchId } };
    }

    const stats = {
      totalInvoices: await prisma.invoice.count({ where }),
      draftInvoices: await prisma.invoice.count({
        where: { ...where, status: "DRAFT" },
      }),
      sentInvoices: await prisma.invoice.count({
        where: { ...where, status: "SENT" },
      }),
      paidInvoices: await prisma.invoice.count({
        where: { ...where, status: "PAID" },
      }),
      overdueInvoices: await prisma.invoice.count({
        where: { ...where, status: "OVERDUE" },
      }),
    };

    logger.info(`Payment stats fetched for tenant ${tenantId}`);

    return stats;
  } catch (error) {
    logger.error("Error fetching payment stats:", error);
    throw error;
  }
}

/**
 * Get comprehensive dashboard report
 */
export async function getComprehensiveReport(
  tenantId: string,
  branchId?: string
) {
  try {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    const [overview, bookingStats, paymentStats, topProducts] =
      await Promise.all([
        getDashboardOverview(tenantId, branchId),
        getBookingStats(tenantId, branchId),
        getPaymentStats(tenantId, branchId),
        getTopProducts(tenantId, 5, branchId),
      ]);

    const report = {
      overview,
      bookingStats,
      paymentStats,
      topProducts,
      generatedAt: new Date(),
    };

    logger.info(`Comprehensive report generated for tenant ${tenantId}`);

    return report;
  } catch (error) {
    logger.error("Error generating comprehensive report:", error);
    throw error;
  }
}
