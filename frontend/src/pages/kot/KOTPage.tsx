import React, { useEffect, useState } from "react";
import { Printer, Loader, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { kotService } from "@/api/services";
import { useDataStore } from "@/store";

const KOTPage: React.FC = () => {
  const { tenantId, branchId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [kots, setKots] = useState<any[]>([]);

  useEffect(() => {
    loadKOTs();
  }, [tenantId, branchId]);

  const loadKOTs = async () => {
    if (!tenantId || !branchId) {
      toast.error("Please select a branch");
      return;
    }
    try {
      setLoading(true);
      const data = await kotService.getByBranch(tenantId, branchId);
      setKots(data || []);
    } catch (error: any) {
      toast.error("Failed to load KOTs");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (kotId: string) => {
    try {
      setLoading(true);
      await kotService.print(kotId);
      toast.success("KOT printed!");
    } catch (error: any) {
      toast.error("Failed to print KOT");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !kots.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Kitchen Order Tickets (KOT)
      </h1>

      {/* KOT List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  KOT ID
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Order #
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Items
                </th>
                <th className="text-center text-sm font-semibold text-slate-600 py-3 px-4">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Time
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {kots.length > 0 ? (
                kots.map((kot) => (
                  <tr
                    key={kot.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {kot.id}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{kot.orderId}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {Array.isArray(kot.items) &&
                          kot.items.map((item: any, idx: number) => (
                            <span
                              key={idx}
                              className="block text-sm text-slate-600"
                            >
                              {item.name} x{item.qty}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          kot.status === "COMPLETED"
                            ? "bg-success-100 text-success-800"
                            : kot.status === "IN_PROGRESS"
                              ? "bg-primary-100 text-primary-800"
                              : "bg-warning-100 text-warning-800"
                        }`}
                      >
                        {kot.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(kot.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handlePrint(kot.id)}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto"
                      >
                        <Printer size={18} />
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No KOTs available
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

export default KOTPage;
