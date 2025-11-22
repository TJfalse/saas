import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader, Search } from "lucide-react";
import toast from "react-hot-toast";
import { menuService } from "@/api/services";
import { useAuthStore, useDataStore } from "@/store";
import { MenuItem, CreateMenuItemPayload } from "@/types/api.types";

const MenuPage: React.FC = () => {
  const { user } = useAuthStore();
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMenuItemPayload>({
    name: "",
    price: 0,
    category: "",
    description: "",
    sku: "",
    costPrice: 0,
    isInventoryTracked: false,
  });

  // Load items
  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, [tenantId, selectedCategory]);

  const loadMenuItems = async () => {
    if (!tenantId) {
      setError("Tenant ID not found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let data: MenuItem[];
      if (selectedCategory) {
        data = await menuService.getByCategory(tenantId, selectedCategory);
      } else {
        data = await menuService.getAll(tenantId);
      }
      setItems(data || []);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to load menu items";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error loading menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!tenantId) return;
    try {
      const data = await menuService.getCategories(tenantId);
      setCategories(data || []);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(tenantId);
    if (!tenantId || !formData.name || !formData.price) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await menuService.update(tenantId, editingId, formData);
        toast.success("Item updated!");
      } else {
        await menuService.create(tenantId, formData);
        toast.success("Item created!");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        price: 0,
        category: "",
        description: "",
        sku: "",
        costPrice: 0,
        isInventoryTracked: false,
      });
      loadMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description,
      sku: item.sku,
      costPrice: item.costPrice,
      isInventoryTracked: item.isInventoryTracked,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeactivate = async (itemId: string) => {
    if (!tenantId) return;
    try {
      await menuService.deactivate(tenantId, itemId);
      toast.success("Item deactivated!");
      loadMenuItems();
    } catch (error: any) {
      toast.error("Failed to deactivate");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await menuService.deactivate(tenantId!, itemId);
      toast.success("Deleted!");
      loadMenuItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredItems = Array.isArray(items)
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg text-slate-900 font-semibold mb-2">
            Error Loading Menu
          </p>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadMenuItems();
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">
            Tenant information not found
          </p>
          <p className="text-sm text-slate-500">Please log in again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Item name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Beverages"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="SKU-001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cost Price
              </label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: parseFloat(e.target.value),
                  })
                }
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isInventoryTracked}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isInventoryTracked: e.target.checked,
                    })
                  }
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-slate-700">
                  Track Inventory
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Item description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          {Array.isArray(categories) &&
            categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Item
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Price
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Category
                </th>
                <th className="text-center text-sm font-semibold text-slate-600 py-3 px-4">
                  Status
                </th>
                <th className="text-right text-sm font-semibold text-slate-600 py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.sku}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900 font-semibold">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.category || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.isActive ? (
                        <span className="text-xs bg-success-100 text-success-800 px-2 py-1 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="text-warning-600 hover:text-warning-700"
                      >
                        {item.isActive ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-secondary-600 hover:text-secondary-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No items found
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

export default MenuPage;
