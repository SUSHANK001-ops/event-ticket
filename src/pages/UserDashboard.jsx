import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/api";

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      console.log("📚 Fetching bookings from database...");
      const response = await bookingService.getMyBookings();

      if (response.success) {
        console.log("✅ Bookings fetched successfully:", response.data);
        setBookings(response.data || []);
      } else {
        throw new Error(response.error || "Failed to fetch bookings");
      }
    } catch (err) {
      console.error("Fetch bookings error:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setCancelLoading(true);

      const response = await bookingService.cancelBooking(
        bookingId,
        "Cancelled by user"
      );

      if (response.success) {
        // Update the cancelled booking in the list
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking._id === bookingId
              ? {
                  ...booking,
                  bookingStatus: "cancelled",
                  paymentStatus: "refunded",
                }
              : booking
          )
        );
        alert(
          "Booking cancelled successfully! Refund will be processed within 3-5 business days."
        );
      } else {
        throw new Error(response.error || "Failed to cancel booking");
      }
    } catch (err) {
      setError(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatVenue = (venue) => {
    if (!venue) return "TBA";
    if (typeof venue === "string") return venue;
    const parts = [venue.name, venue.city, venue.state].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your bookings and account settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  My Event Bookings
                </h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No bookings yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start exploring events and book your first ticket!
                    </p>
                    <div className="mt-6">
                      <a
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Browse Events
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="bg-gray-50 rounded-lg p-6"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-4">
                              <img
                                src={
                                  booking.event.image ||
                                  "/api/placeholder/64/64"
                                }
                                alt={booking.event.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {booking.event.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {formatDate(booking.event.date)} •{" "}
                                  {formatVenue(booking.event.venue)}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">
                                  Booking Reference:
                                </span>
                                <span className="ml-2 font-medium font-mono text-xs">
                                  {booking.bookingReference}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Tickets:</span>
                                <span className="ml-2 font-medium">
                                  {booking.ticketQuantity}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Total Paid:
                                </span>
                                <span className="ml-2 font-medium">
                                  ${booking.totalAmount}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Booked on:
                                </span>
                                <span className="ml-2 font-medium">
                                  {formatDate(booking.createdAt)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <span
                                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    booking.bookingStatus
                                  )}`}
                                >
                                  {booking.bookingStatus
                                    ? booking.bookingStatus
                                        .charAt(0)
                                        .toUpperCase() +
                                      booking.bookingStatus.slice(1)
                                    : "Unknown"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Payment:</span>
                                <span
                                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    booking.paymentStatus
                                  )}`}
                                >
                                  {booking.paymentStatus
                                    .charAt(0)
                                    .toUpperCase() +
                                    booking.paymentStatus.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                              View Details
                            </button>
                            {booking.bookingStatus === "confirmed" &&
                              booking.paymentStatus === "paid" && (
                                <button
                                  onClick={() =>
                                    handleCancelBooking(booking._id)
                                  }
                                  disabled={cancelLoading}
                                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-red-400 disabled:cursor-not-allowed"
                                >
                                  {cancelLoading
                                    ? "Cancelling..."
                                    : "Cancel Booking"}
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Profile Settings
                </h2>

                <form className="space-y-6 max-w-lg">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      defaultValue={user?.name}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      defaultValue={user?.email}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="notifications"
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        id="notifications"
                        defaultChecked
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Receive email notifications about upcoming events
                      </span>
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>

                <div className="mt-12 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Change Password
                    </button>
                    <br />
                    <button className="text-red-600 hover:text-red-800 text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
