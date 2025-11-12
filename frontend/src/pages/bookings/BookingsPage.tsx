import React, { useEffect, useState } from "react";
import { Plus, Loader, Calendar, Clock, Users } from "lucide-react";
import toast from "react-hot-toast";
import { bookingService } from "@/api/services";
import { useDataStore } from "@/store";
import { Booking } from "@/types/api.types";

const BookingsPage: React.FC = () => {
  const { branchId } = useDataStore();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    partySize: 1,
    startTime: new Date().toISOString().split("T")[0] + "T18:00",
    endTime: new Date().toISOString().split("T")[0] + "T20:00",
    notes: "",
  });

  useEffect(() => {
    loadBookings();
  }, [branchId]);

  const loadBookings = async () => {
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }
    try {
      setLoading(true);
      const data = await bookingService.getByBranch(branchId);
      setBookings(data || []);
    } catch (error: any) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) return;

    try {
      setLoading(true);
      await bookingService.create({
        branchId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        partySize: formData.partySize,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes,
      });
      toast.success("Booking created!");
      setShowForm(false);
      resetForm();
      loadBookings();
    } catch (error: any) {
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      partySize: 1,
      startTime: new Date().toISOString().split("T")[0] + "T18:00",
      endTime: new Date().toISOString().split("T")[0] + "T20:00",
      notes: "",
    });
  };

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.startTime) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.startTime) <= new Date()
  );

  if (loading && !bookings.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
          <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {bookings.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-success-500">
          <p className="text-slate-600 text-sm font-medium">Upcoming</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {upcomingBookings.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-slate-500">
          <p className="text-slate-600 text-sm font-medium">Total Guests</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {bookings.reduce((sum, b) => sum + b.partySize, 0)}
          </p>
        </div>
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Upcoming Bookings
          </h2>
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {booking.customerName}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {booking.partySize} guests
                    </span>
                  </div>
                  {booking.notes && (
                    <p className="text-sm text-slate-500 mt-2">
                      {booking.notes}
                    </p>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      booking.status === "CONFIRMED"
                        ? "bg-success-100 text-success-800"
                        : booking.status === "PENDING"
                          ? "bg-warning-100 text-warning-800"
                          : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Past Bookings
          </h2>
          <div className="space-y-3">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-50 rounded-lg shadow-sm p-4 flex justify-between items-start sm:items-center gap-4 opacity-75"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {booking.customerName}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {booking.partySize} guests
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-slate-500">No bookings yet</p>
        </div>
      )}

      {/* Booking Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              New Booking
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="+1234567890"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Party Size *
                </label>
                <input
                  type="number"
                  value={formData.partySize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partySize: parseInt(e.target.value),
                    })
                  }
                  placeholder="1"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any allergies, preferences, etc."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
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

export default BookingsPage;
