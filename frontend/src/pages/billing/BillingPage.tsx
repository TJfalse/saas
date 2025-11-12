import React, { useEffect, useState } from "react";
import { Eye, DollarSign, Loader, Search } from "lucide-react";
import toast from "react-hot-toast";
import { billingService } from "@/api/services";
import { useDataStore } from "@/store";
import { Invoice, ProcessPaymentPayload } from "@/types/api.types";

const BillingPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    pendingInvoices: number;
  } | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<ProcessPaymentPayload>({
    amount: 0,
    method: "CASH",
    reference: "",
  });

  useEffect(() => {
    loadBilling();
  }, [tenantId]);

  const loadBilling = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [summaryData, invoicesData] = await Promise.all([
        billingService.getSummary(tenantId),
        billingService.getInvoices(tenantId),
      ]);
      setSummary(summaryData);
      setInvoices(invoicesData || []);
    } catch (error: any) {
      toast.error("Failed to load billing");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedInvoice) return;

    try {
      setLoading(true);
      await billingService.processPayment(
        tenantId,
        selectedInvoice.id,
        paymentData
      );
      toast.success("Payment processed!");
      setShowPaymentForm(false);
      setSelectedInvoice(null);
      loadBilling();
    } catch (error: any) {
      toast.error("Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId: string) => {
    if (!tenantId) return;
    try {
      const invoice = await billingService.getInvoiceById(tenantId, invoiceId);
      setSelectedInvoice(invoice);
    } catch (error: any) {
      toast.error("Failed to load invoice");
    }
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !invoices.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Billing & Invoices</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success-500">
          <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            ${summary?.totalRevenue?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-warning-500">
          <p className="text-slate-600 text-sm font-medium">Pending Invoices</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {summary?.pendingInvoices || 0}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search invoices..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Invoice #
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Amount
                </th>
                <th className="text-center text-sm font-semibold text-slate-600 py-3 px-4">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Date
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ${invoice.finalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === "PAID"
                            ? "bg-success-100 text-success-800"
                            : invoice.status === "SENT"
                              ? "bg-primary-100 text-primary-800"
                              : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto"
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && !showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-slate-900">
                  Invoice Details
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Invoice #</p>
                  <p className="font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{selectedInvoice.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="font-semibold">
                    ${selectedInvoice.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tax</p>
                  <p className="font-semibold">
                    ${selectedInvoice.tax.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Discount</p>
                  <p className="font-semibold">
                    ${selectedInvoice.discount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="font-semibold">
                    {selectedInvoice.dueDate
                      ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-lg font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${selectedInvoice.finalAmount.toFixed(2)}</span>
                </p>
              </div>

              {selectedInvoice.status !== "PAID" && (
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="w-full bg-success-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-success-700 flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  Record Payment
                </button>
              )}

              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Record Payment
            </h2>
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">Amount Due</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${selectedInvoice.finalAmount.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  step="0.01"
                  max={selectedInvoice.finalAmount}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      method: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="WALLET">Wallet</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reference (optional)
                </label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      reference: e.target.value,
                    })
                  }
                  placeholder="Transaction ID, Check #, etc"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-success-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-success-700 disabled:opacity-50"
                >
                  Process Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
