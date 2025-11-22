import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { dashboardService, reportService } from "@/api/services";
import { useAuthStore, useDataStore } from "@/store";
import {
  DashboardOverview,
  SalesAnalytics,
  TopProduct,
} from "@/types/api.types";
import { Navigate } from "react-router-dom";

interface ChartData {
  date: string;
  revenue: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [analytics, setAnalytics] = useState<SalesAnalytics[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!tenantId) {
            toast.error("tenant Id not set");
            setLoading(false);
            return
}


      try {
        setLoading(true);
        const [overviewData, analyticsData, chartsData, productsData] =
          await Promise.all([
            dashboardService.getOverview(tenantId),
            dashboardService.getSalesAnalytics(tenantId),
            dashboardService.getRevenueCharts(tenantId),
            dashboardService.getTopProducts(tenantId, 5),
          ]);

        setOverview(overviewData);
        setAnalytics(analyticsData || []);
        setCharts(chartsData || []);
        setTopProducts(productsData || []);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {overview?.totalOrders || 0}
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <ShoppingCart size={24} className="text-primary-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${overview?.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-success-100 p-3 rounded-lg">
              <DollarSign size={24} className="text-success-600" />
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-warning-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Avg Order Value
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${overview?.avgOrderValue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="bg-warning-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-warning-600" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-secondary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {overview?.pendingOrders || 0}
              </p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-lg">
              <Users size={24} className="text-secondary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Revenue Trend
          </h2>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600">
                Chart visualization will render here
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Total data points: {charts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Sales Analytics
          </h2>
          <div className="space-y-3">
            {analytics.length > 0 ? (
              analytics.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded"
                >
                  <span className="text-sm text-slate-600">{item.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (item.sales / (Math.max(...analytics.map((a) => a.sales)) || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 min-w-16">
                      ${item.sales.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">
                No analytics data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Product
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Sales
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Revenue
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">
                      {product.sales}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-slate-900">
                      {product.quantity}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No products data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
