import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {event.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-white text-gray-900 px-2 py-1 rounded-full text-xs font-medium shadow">
            {formatPrice(event.price)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2"
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

          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2"
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

          <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {event.availableTickets} tickets available
          </div>
        </div>

        <Link
          to={`/event/${event._id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
