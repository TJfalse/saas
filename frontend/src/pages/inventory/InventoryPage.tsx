import React, { useEffect, useState } from "react";
import { AlertCircle, Edit2, Trash2, Loader, Search, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { inventoryService } from "@/api/services";
import { useDataStore } from "@/store";
import { InventoryItem } from "@/types/api.types";

const InventoryPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    qty: 0,
    minQty: 10,
  });

  useEffect(() => {
    loadInventory();
  }, [tenantId]);

  const loadInventory = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const [allItems, lowItems] = await Promise.all([
        inventoryService.getAll(tenantId),
        inventoryService.getLowStock(tenantId),
      ]);
      setInventory(allItems || []);
      setLowStock(lowItems || []);
    } catch (error: any) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      setLoading(true);
      if (editingId) {
        await inventoryService.update(editingId, {
          qty: formData.qty,
          minQty: formData.minQty,
        });
        toast.success("Item updated!");
      } else {
        await inventoryService.create(tenantId, {
          productId: formData.productId,
          qty: formData.qty,
          minQty: formData.minQty,
        });
        toast.success("Item added!");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadInventory();
    } catch (error: any) {
      toast.error("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm("Delete this item?")) {
      try {
        await inventoryService.delete(itemId);
        toast.success("Item deleted!");
        loadInventory();
      } catch (error: any) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      productId: item.productId,
      qty: item.qty,
      minQty: item.minQty,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      qty: 0,
      minQty: 10,
    });
  };

  const filteredInventory = inventory.filter((item) =>
    item.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !inventory.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Inventory Management
        </h1>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowForm(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-warning-50 border-l-4 border-warning-500 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="text-warning-600 flex-shrink-0" size={24} />
            <div>
              <p className="font-semibold text-warning-900">Low Stock Alert</p>
              <p className="text-warning-700">
                {lowStock.length} items below minimum quantity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search inventory by product ID..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Product ID
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Current Qty
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Min Qty
                </th>
                <th className="text-center text-sm font-semibold text-slate-600 py-3 px-4">
                  Status
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Last Updated
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.productId}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                      {item.qty}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900">
                      {item.minQty}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.qty < item.minQty
                            ? "bg-danger-100 text-danger-800"
                            : "bg-success-100 text-success-800"
                        }`}
                      >
                        {item.qty < item.minQty ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-sm">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-danger-600 hover:text-danger-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? "Edit Item" : "Add Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product ID *
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) =>
                    setFormData({ ...formData, productId: e.target.value })
                  }
                  placeholder="e.g., PROD-001"
                  required
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qty: parseFloat(e.target.value),
                      })
                    }
                    placeholder="0"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.minQty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minQty: parseFloat(e.target.value),
                      })
                    }
                    placeholder="10"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  Save Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
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

export default InventoryPage;
