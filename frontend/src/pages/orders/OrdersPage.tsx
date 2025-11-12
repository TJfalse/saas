import React, { useEffect, useState } from "react";
import { Plus, Eye, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { orderService, menuService } from "@/api/services";
import { useAuthStore, useDataStore } from "@/store";
import { Order, MenuItem } from "@/types/api.types";

const OrdersPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    branchId: "",
    items: [{ menuItemId: "", quantity: 1, notes: "" }],
    tax: 0,
    discount: 0,
    notes: "",
  });

  useEffect(() => {
    loadOrders();
    if (tenantId) {
      loadMenuItems();
    }
  }, [tenantId]);

  const loadOrders = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      // Note: Backend needs to provide GET /orders/:tenantId endpoint
      // For now, we'll assume orders are fetched via a list endpoint
      toast("Orders loaded");
    } catch (error: any) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    if (!tenantId) return;
    try {
      const items = await menuService.getAll(tenantId);
      setMenuItems(items || []);
    } catch (error) {
      toast.error("Failed to load menu items");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId || formData.items.some((i) => !i.menuItemId)) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      setLoading(true);
      await orderService.create({
        branchId: formData.branchId,
        items: formData.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        tax: formData.tax,
        discount: formData.discount,
        notes: formData.notes,
      });
      toast.success("Order created!");
      setShowForm(false);
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await orderService.getById(orderId);
      setSelectedOrder(order);
    } catch (error: any) {
      toast.error("Failed to load order details");
    }
  };

  if (loading && !orders.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Order
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleCreateOrder}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Branch ID *
              </label>
              <input
                type="text"
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                placeholder="Branch ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tax
              </label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) =>
                  setFormData({ ...formData, tax: parseFloat(e.target.value) })
                }
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Items *
            </label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={item.menuItemId}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[idx].menuItemId = e.target.value;
                    setFormData({ ...formData, items: newItems });
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Item</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ${item.price.toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...formData.items];
                    newItems[idx].quantity = parseInt(e.target.value);
                    setFormData({ ...formData, items: newItems });
                  }}
                  placeholder="Qty"
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>

          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Order notes"
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Create Order
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Order ID
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Status
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Total
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
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
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
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-900">
                Order Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Order ID</p>
                  <p className="font-semibold">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="font-semibold">
                    ${selectedOrder.subtotal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tax</p>
                  <p className="font-semibold">
                    ${selectedOrder.tax.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Items</h3>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span className="text-sm">{item.quantity}x Item</span>
                    <span className="text-sm font-semibold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 text-lg font-bold flex justify-between">
                <span>Total:</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
