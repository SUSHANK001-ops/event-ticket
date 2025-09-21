import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { eventService, bookingService } from "../services/api";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Use real API to get event details
        const response = await eventService.getEventById(id);
        if (response.success && response.data) {
          setEvent(response.data);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Event Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `$${price}`;
  };

  const handleBookTicket = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    try {
      setBookingLoading(true);
      setError("");

      // Prepare attendee info
      const attendeeInfo = {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      };

      // Create Stripe checkout session
      const response = await bookingService.createCheckoutSession(
        event._id,
        ticketQuantity,
        attendeeInfo
      );

      if (response.success && response.data.sessionUrl) {
        // Redirect to Stripe checkout (test mode)
        console.log(
          "🧪 Redirecting to Stripe test checkout:",
          response.data.sessionUrl
        );
        window.location.href = response.data.sessionUrl;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (err) {
      setError(err.message || "Booking failed. Please try again.");
      setBookingLoading(false);
    }
    // Note: Don't set loading to false here as we're redirecting
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Events
        </button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Image */}
          <div className="h-64 md:h-96 relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                <div className="flex flex-wrap gap-6 mb-6 text-gray-600">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {event.location}
                  </div>
                </div>

                <div className="prose max-w-none mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    About This Event
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Event Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-semibold text-blue-600 text-lg">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available Tickets:</span>
                      <span className="ml-2 font-semibold">
                        {event.availableTickets} / {event.totalTickets}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Book Your Ticket
                  </h3>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {formatPrice(event.price)}
                      {event.price > 0 && (
                        <span className="text-sm text-gray-600 font-normal">
                          {" "}
                          per ticket
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <select
                      value={ticketQuantity}
                      onChange={(e) =>
                        setTicketQuantity(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[...Array(Math.min(10, event.availableTickets))].map(
                        (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} ticket{i > 0 ? "s" : ""}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        {formatPrice(event.price * ticketQuantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookTicket}
                    disabled={event.availableTickets === 0}
                    className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
                      event.availableTickets === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {event.availableTickets === 0
                      ? "Sold Out"
                      : user
                      ? "Book Ticket"
                      : "Login to Book"}
                  </button>

                  {!user && (
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      <span>Don't have an account? </span>
                      <button
                        onClick={() => navigate("/register")}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Register here
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Booking
            </h3>
            <div className="mb-4">
              <p className="text-gray-700">
                You are about to book <strong>{ticketQuantity}</strong> ticket
                {ticketQuantity > 1 ? "s" : ""} for:
              </p>
              <p className="font-semibold text-gray-900 mt-2">{event.title}</p>
              <p className="text-gray-600">
                {formatDate(event.date)} at {event.time}
              </p>
              <p className="text-lg font-semibold text-blue-600 mt-2">
                Total: {formatPrice(event.price * ticketQuantity)}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowBookingModal(false)}
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Redirecting to Payment...
                  </div>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
