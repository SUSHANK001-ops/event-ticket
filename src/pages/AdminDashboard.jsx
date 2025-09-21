import { useEffect, useState } from "react";
import { eventService, adminService } from "../services/api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("events");
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    venueState: "",
    venueZipCode: "",
    venueCapacity: "",
    price: "",
    availableTickets: "",
    totalTickets: "",
    category: "",
    image: "",
  });

  // Data state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  // Attendees state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [allBookings, setAllBookings] = useState([]); // for analytics

  useEffect(() => {
    const load = async () => {
      try {
        setEventsLoading(true);
        setError("");
        const [evRes, bookingsRes] = await Promise.all([
          eventService.getAllEvents(),
          adminService
            .getAllBookings()
            .catch(() => ({ success: true, data: [] })),
        ]);
        if (evRes.success) setEvents(evRes.data || []);
        if (bookingsRes?.success) setAllBookings(bookingsRes.data || []);
      } catch (e) {
        setError(e.message || "Failed to load admin data");
      } finally {
        setEventsLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return Number(price) === 0 ? "Free" : `$${price}`;
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date, // ISO date string
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        venue: {
          name: eventForm.venueName,
          address: eventForm.venueAddress,
          city: eventForm.venueCity,
          state: eventForm.venueState,
          zipCode: eventForm.venueZipCode,
          capacity: Number(eventForm.venueCapacity || 0),
        },
        price: Number(eventForm.price || 0),
        availableTickets: Number(eventForm.availableTickets || 0),
        totalTickets: Number(
          eventForm.totalTickets || eventForm.availableTickets || 0
        ),
        category: eventForm.category,
        image: eventForm.image,
      };

      const res = await eventService.createEvent(payload);
      if (res.success) {
        setEvents((prev) => [res.data, ...prev]);
        setShowEventForm(false);
        setEventForm({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          venueName: "",
          venueAddress: "",
          venueCity: "",
          venueState: "",
          venueZipCode: "",
          venueCapacity: "",
          price: "",
          availableTickets: "",
          totalTickets: "",
          category: "",
          image: "",
        });
      } else {
        throw new Error(res.error || "Failed to create event");
      }
    } catch (err) {
      setError(err.message || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      setDeletingId(eventId);
      const res = await eventService.deleteEvent(eventId);
      if (res.success) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      } else {
        throw new Error(res.error || "Failed to delete event");
      }
    } catch (err) {
      setError(err.message || "Failed to delete event");
    } finally {
      setDeletingId("");
    }
  };

  const handleViewAttendees = async (ev) => {
    try {
      setSelectedEvent(ev);
      setActiveTab("attendees");
      setAttendeesLoading(true);
      const res = await adminService.getEventAttendees(ev._id);
      if (res.success) setAttendees(res.data || []);
      else throw new Error(res.error || "Failed to load attendees");
    } catch (err) {
      setError(err.message || "Failed to load attendees");
    } finally {
      setAttendeesLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage events and view attendee information
          </p>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeTab === "events"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-3"
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
                    Manage Events
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("attendees")}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeTab === "attendees"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    View Attendees
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      activeTab === "analytics"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 inline-block mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Analytics
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              {/* Events Management */}
              {activeTab === "events" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Manage Events
                    </h2>
                    <button
                      onClick={() => setShowEventForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create New Event
                    </button>
                  </div>

                  {showEventForm && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Create New Event
                      </h3>
                      <form
                        onSubmit={handleCreateEvent}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={eventForm.title}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={eventForm.description}
                            onChange={handleEventFormChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={eventForm.date}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="startTime"
                            value={eventForm.startTime}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="endTime"
                            value={eventForm.endTime}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        {/* Venue fields */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Venue Name
                          </label>
                          <input
                            type="text"
                            name="venueName"
                            value={eventForm.venueName}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Venue Address
                          </label>
                          <input
                            type="text"
                            name="venueAddress"
                            value={eventForm.venueAddress}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            name="venueCity"
                            value={eventForm.venueCity}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            name="venueState"
                            value={eventForm.venueState}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zip Code
                          </label>
                          <input
                            type="text"
                            name="venueZipCode"
                            value={eventForm.venueZipCode}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Venue Capacity
                          </label>
                          <input
                            type="number"
                            min="1"
                            name="venueCapacity"
                            value={eventForm.venueCapacity}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={eventForm.price}
                            onChange={handleEventFormChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            name="category"
                            value={eventForm.category}
                            onChange={handleEventFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="Conference">Conference</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Concert">Concert</option>
                            <option value="Sports">Sports</option>
                            <option value="Festival">Festival</option>
                            <option value="Exhibition">Exhibition</option>
                            <option value="Networking">Networking</option>
                            <option value="Training">Training</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Available Tickets
                          </label>
                          <input
                            type="number"
                            name="availableTickets"
                            value={eventForm.availableTickets}
                            onChange={handleEventFormChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Tickets
                          </label>
                          <input
                            type="number"
                            name="totalTickets"
                            value={eventForm.totalTickets}
                            onChange={handleEventFormChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                          </label>
                          <input
                            type="url"
                            name="image"
                            value={eventForm.image}
                            onChange={handleEventFormChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="md:col-span-2 flex space-x-4">
                          <button
                            type="submit"
                            disabled={creating}
                            className={`px-4 py-2 rounded-md text-white ${
                              creating
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            } transition-colors`}
                          >
                            {creating ? "Creating..." : "Create Event"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowEventForm(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tickets
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {eventsLoading && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              Loading events...
                            </td>
                          </tr>
                        )}
                        {!eventsLoading && events.length === 0 && (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              No events found. Create your first event!
                            </td>
                          </tr>
                        )}
                        {!eventsLoading &&
                          events.length > 0 &&
                          events.map((event) => (
                            <tr key={event._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={event.image}
                                    alt=""
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {event.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {event?.venue?.name}, {event?.venue?.city}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(event.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(event.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {event.availableTickets} / {event.totalTickets}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleViewAttendees(event)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Attendees
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteEvent(event._id)}
                                  disabled={deletingId === event._id}
                                  className={`mr-2 ${
                                    deletingId === event._id
                                      ? "text-red-300 cursor-not-allowed"
                                      : "text-red-600 hover:text-red-900"
                                  }`}
                                >
                                  {deletingId === event._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Attendees Management */}
              {activeTab === "attendees" && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Event Attendees{" "}
                    {selectedEvent ? `- ${selectedEvent.title}` : ""}
                  </h2>

                  <div className="overflow-x-auto">
                    {attendeesLoading ? (
                      <div className="text-center py-6 text-gray-500">
                        Loading attendees...
                      </div>
                    ) : attendees.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No attendees to show.
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tickets
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Booking Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendees.map((booking) => (
                            <tr key={booking._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.user.email}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.event.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(booking.event.date)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {booking.ticketQuantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPrice(booking.totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {booking.bookingStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(booking.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics */}
              {activeTab === "analytics" && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    Analytics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">
                        Total Events
                      </h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {events.length}
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">
                        Total Bookings
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {allBookings.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">
                        Total Revenue
                      </h3>
                      <p className="text-3xl font-bold text-purple-600">
                        $
                        {allBookings.reduce(
                          (sum, b) => sum + (b.totalAmount || 0),
                          0
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      More detailed analytics coming soon...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
