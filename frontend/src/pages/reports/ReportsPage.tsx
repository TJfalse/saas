import React, { useEffect, useState } from "react";
import { Download, Loader, BarChart3, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { reportService } from "@/api/services";
import { useDataStore } from "@/store";

const ReportsPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "sales" | "inventory" | "staff" | "payment" | "dashboard"
  >("sales");
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, [tenantId, activeTab, startDate, endDate]);

  const loadReport = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      let result;

      switch (activeTab) {
        case "sales":
          result = await reportService.getSalesReport(
            tenantId,
            startDate,
            endDate,
            "daily"
          );
          break;
        case "inventory":
          result = await reportService.getInventoryReport(tenantId);
          break;
        case "staff":
          result = await reportService.getStaffPerformanceReport(
            tenantId,
            startDate,
            endDate
          );
          break;
        case "payment":
          result = await reportService.getPaymentReport(
            tenantId,
            startDate,
            endDate
          );
          break;
        case "dashboard":
          result = await reportService.getDashboardSummary(tenantId);
          break;
      }
      setData(result);
    } catch (error: any) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      await reportService.exportSalesData(tenantId, "csv", startDate, endDate);
      toast.success("Report exported!");
    } catch (error: any) {
      toast.error("Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Reports & Analytics
        </h1>
        <button
          onClick={handleExport}
          className="bg-success-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-success-700 flex items-center gap-2"
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-slate-200">
          {["sales", "inventory", "staff", "payment", "dashboard"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-3 font-medium text-sm capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-primary-600" size={48} />
            </div>
          ) : data ? (
            <div className="space-y-4">
              {/* Sales Report */}
              {activeTab === "sales" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={24} />
                    Sales Report
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Total Sales</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${data?.totalSales?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Transactions</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {data?.totalTransactions || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Average Order</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${data?.avgOrder?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">
                            Date
                          </th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Sales
                          </th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Orders
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(data?.daily) &&
                          data.daily.map((row: any, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-slate-50"
                            >
                              <td className="px-4 py-2">{row.date}</td>
                              <td className="px-4 py-2 text-right">
                                ${row.sales?.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {row.orders}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inventory Report */}
              {activeTab === "inventory" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Inventory Status
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Total Items</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {data?.totalItems || 0}
                      </p>
                    </div>
                    <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
                      <p className="text-xs text-warning-600">Low Stock</p>
                      <p className="text-2xl font-bold text-warning-900 mt-1">
                        {data?.lowStock || 0}
                      </p>
                    </div>
                    <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                      <p className="text-xs text-success-600">In Stock</p>
                      <p className="text-2xl font-bold text-success-900 mt-1">
                        {data?.inStock || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Total Value</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${data?.totalValue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Report */}
              {activeTab === "staff" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={24} />
                    Staff Performance
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">
                            Staff Member
                          </th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Orders
                          </th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Sales
                          </th>
                          <th className="px-4 py-2 text-right font-semibold">
                            Avg Order
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(data?.staff) &&
                          data.staff.map((row: any, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-slate-50"
                            >
                              <td className="px-4 py-2 font-medium">
                                {row.name}
                              </td>
                              <td className="px-4 py-2 text-right">
                                {row.orders}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${row.sales?.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-right">
                                ${row.avgOrder?.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Report */}
              {activeTab === "payment" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Payment Breakdown
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600">Cash</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">
                        ${data?.cash?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600">Card</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        ${data?.card?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600">UPI</p>
                      <p className="text-2xl font-bold text-orange-900 mt-1">
                        ${data?.upi?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Other</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        ${data?.other?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dashboard Summary */}
              {activeTab === "dashboard" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Dashboard Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Total Orders</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {data?.totalOrders || 0}
                      </p>
                    </div>
                    <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                      <p className="text-xs text-success-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-success-900 mt-1">
                        ${data?.totalRevenue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Active Customers</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {data?.activeCustomers || 0}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-xs text-slate-500">Growth Rate</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {data?.growthRate?.toFixed(1) || "0"}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No data available for the selected period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
