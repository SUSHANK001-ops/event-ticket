import { useState, useEffect } from "react";
import { eventService } from "../services/api";
import EventCard from "../components/EventCard";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventService.getAllEvents();
        if (response.success && response.data) {
          setEvents(response.data);
        } else {
          setError("Failed to fetch events");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = ["All", ...new Set(events.map((event) => event.category))];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" ||
      selectedCategory === "All" ||
      event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Find and book tickets for concerts, conferences, exhibitions, and
              more
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search events, locations, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category === "All" ? "" : category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>
          <p className="text-gray-600">
            {filteredEvents.length} event
            {filteredEvents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length === 0 ? (
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
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.044-5.709-2.573M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No events found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {events.length}+
              </div>
              <div className="text-gray-600">Events Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Cities Worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
