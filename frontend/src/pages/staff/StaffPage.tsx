import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Loader,
  Search,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { staffService } from "@/api/services";
import { useAuthStore, useDataStore } from "@/store";
import { Staff, CreateStaffPayload } from "@/types/api.types";

const StaffPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateStaffPayload>({
    email: "",
    password: "",
    name: "",
    role: "STAFF",
    branchId: "",
  });

  useEffect(() => {
    loadStaff();
  }, [tenantId]);

  useEffect(() => {
    const filtered = staff.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchTerm, staff]);

  const loadStaff = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const data = await staffService.getAll(tenantId);
      setStaff(data || []);
    } catch (error: any) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !formData.email || !formData.name || !formData.role || !formData.branchId) {
      toast.error("Fill all required fields (including branchId)");
      return;
    }

    if (!editingId && !formData.password) {
      toast.error("Password required for new staff");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        const updatePayload = {
          name: formData.name,
          role: formData.role,
          branchId: formData.branchId,
        };
        await staffService.update(tenantId, editingId, updatePayload);
        toast.success("Staff updated!");
      } else {
        await staffService.create(tenantId, formData);
        toast.success("Staff created!");
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      loadStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "STAFF",
      branchId: "",
    });
  };

  const handleEdit = (s: Staff) => {
    setFormData({
      email: s.email,
      password: "",
      name: s.name,
      role: s.role,
      branchId: s.branchId || "",
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDeactivate = async (staffId: string) => {
    if (!tenantId || !window.confirm("Deactivate staff?")) return;
    try {
      await staffService.deactivate(tenantId, staffId);
      toast.success("Staff deactivated!");
      loadStaff();
    } catch (error: any) {
      toast.error("Failed to deactivate");
    }
  };

  const handleAssignRole = async (staffId: string, newRole: string) => {
    if (!tenantId) return;
    try {
      await staffService.assignRole(tenantId, staffId, {
        role: newRole as any,
      });
      toast.success("Role assigned!");
      loadStaff();
    } catch (error: any) {
      toast.error("Failed to assign role");
    }
  };

  if (loading && !staff.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            if (!showForm) resetForm();
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add Staff
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
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="staff@cafe.com"
                disabled={!!editingId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {editingId ? "New Password" : "Password *"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingId ? "Leave blank to keep current" : "••••••••"
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
                placeholder="Staff name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="KITCHEN">Kitchen</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Branch ID *
              </label>
              <input
                type="text"
                value={formData.branchId}
                onChange={(e) =>
                  setFormData({ ...formData, branchId: e.target.value })
                }
                placeholder="Branch ID (required)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="bg-slate-200 text-slate-900 px-6 py-2 rounded-lg font-medium hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Name
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Email
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Role
                </th>
                <th className="text-left text-sm font-semibold text-slate-600 py-3 px-4">
                  Branch
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
              {filteredStaff.length > 0 ? (
                filteredStaff.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={s.role}
                        onChange={(e) => handleAssignRole(s.id, e.target.value)}
                        className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="STAFF">Staff</option>
                        <option value="MANAGER">Manager</option>
                        <option value="KITCHEN">Kitchen</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.branchId ? (
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {s.branchId.substring(0, 8)}...
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          s.isActive
                            ? "bg-success-100 text-success-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(s)}
                        className="text-primary-600 hover:text-primary-700 p-1"
                      >
                        <Edit size={18} />
                      </button>
                      {s.isActive && (
                        <button
                          onClick={() => handleDeactivate(s.id)}
                          className="text-secondary-600 hover:text-secondary-700 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No staff found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-slate-600 text-sm">Total Staff</p>
          <p className="text-2xl font-bold text-slate-900">{staff.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-slate-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-success-600">
            {staff.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-slate-600 text-sm">Managers</p>
          <p className="text-2xl font-bold text-primary-600">
            {staff.filter((s) => s.role === "MANAGER").length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
