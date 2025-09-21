// Mock data for events, users, and bookings

export const events = [
  {
    id: 1,
    title: "Summer Music Festival",
    description:
      "A three-day outdoor music festival featuring top artists from around the world. Enjoy live performances, food trucks, and camping under the stars.",
    date: "2025-07-15",
    time: "18:00",
    location: "Central Park, New York",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop",
    category: "Music",
    availableTickets: 1000,
    totalTickets: 1500,
  },
  {
    id: 2,
    title: "Tech Conference 2025",
    description:
      "Join industry leaders and innovators for a day of inspiring talks, networking, and hands-on workshops covering the latest trends in technology.",
    date: "2025-08-22",
    time: "09:00",
    location: "Convention Center, San Francisco",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
    category: "Technology",
    availableTickets: 500,
    totalTickets: 800,
  },
  {
    id: 3,
    title: "Art Exhibition Opening",
    description:
      "Discover contemporary artworks from emerging and established artists. Wine and cheese reception included.",
    date: "2025-06-10",
    time: "19:00",
    location: "Modern Art Gallery, Chicago",
    price: 75,
    image:
      "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop",
    category: "Art",
    availableTickets: 200,
    totalTickets: 250,
  },
  {
    id: 4,
    title: "Food & Wine Festival",
    description:
      "Taste exquisite dishes from renowned chefs paired with premium wines from local vineyards.",
    date: "2025-09-05",
    time: "17:00",
    location: "Waterfront Park, Seattle",
    price: 125,
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    category: "Food",
    availableTickets: 300,
    totalTickets: 400,
  },
  {
    id: 5,
    title: "Marathon Championship",
    description:
      "Annual city marathon featuring professional and amateur runners. Cheer on participants and enjoy the festive atmosphere.",
    date: "2025-10-12",
    time: "07:00",
    location: "Downtown District, Boston",
    price: 0,
    image:
      "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=600&fit=crop",
    category: "Sports",
    availableTickets: 5000,
    totalTickets: 5000,
  },
  {
    id: 6,
    title: "Comedy Night Special",
    description:
      "An evening of laughter with stand-up comedians performing their best material. Adults only event.",
    date: "2025-07-28",
    time: "20:00",
    location: "Comedy Club, Los Angeles",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1516280030429-27679b3dc9cf?w=800&h=600&fit=crop",
    category: "Entertainment",
    availableTickets: 150,
    totalTickets: 200,
  },
];

export const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
];

export const bookings = [
  {
    id: 1,
    userId: 1,
    eventId: 1,
    ticketQuantity: 2,
    totalPrice: 300,
    bookingDate: "2025-06-01",
    status: "confirmed",
  },
  {
    id: 2,
    userId: 1,
    eventId: 3,
    ticketQuantity: 1,
    totalPrice: 75,
    bookingDate: "2025-05-15",
    status: "confirmed",
  },
  {
    id: 3,
    userId: 2,
    eventId: 2,
    ticketQuantity: 1,
    totalPrice: 299,
    bookingDate: "2025-05-20",
    status: "confirmed",
  },
];

// Helper functions
export const getEventById = (id) => {
  if (!id) return null;
  return events.find((event) => event.id === parseInt(id)) || null;
};

export const getUserById = (id) => {
  if (!id) return null;
  return users.find((user) => user.id === parseInt(id)) || null;
};

export const getBookingsByUserId = (userId) => {
  if (!userId) return [];
  return bookings.filter((booking) => booking.userId === parseInt(userId));
};

export const getBookingsWithEventDetails = (userId) => {
  if (!userId) return [];
  const userBookings = getBookingsByUserId(userId);
  return userBookings
    .map((booking) => ({
      ...booking,
      event: getEventById(booking.eventId),
    }))
    .filter((booking) => booking.event); // Only include bookings with valid events
};

export const getAllBookingsWithDetails = () => {
  return bookings
    .map((booking) => ({
      ...booking,
      event: getEventById(booking.eventId),
      user: getUserById(booking.userId),
    }))
    .filter((booking) => booking.event && booking.user); // Only include valid bookings
};
