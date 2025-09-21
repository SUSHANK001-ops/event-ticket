import { API_ENDPOINTS, apiRequest } from "../config/api";

// Auth Services
export const authService = {
  // Login user
  login: async (email, password) => {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Register user
  register: async (name, email, password, phone) => {
    return await apiRequest(API_ENDPOINTS.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify({ name, email, password, phone }),
    });
  },

  // Logout user
  logout: async () => {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "GET",
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiRequest(API_ENDPOINTS.AUTH.ME, {
      method: "GET",
    });
  },

  // Update user details
  updateDetails: async (userData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.UPDATE_DETAILS, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  // Update password
  updatePassword: async (currentPassword, newPassword) => {
    return await apiRequest(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await apiRequest(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
};

// Event Services
export const eventService = {
  // Get all events with optional filters
  getAllEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams
      ? `${API_ENDPOINTS.EVENTS.GET_ALL}?${queryParams}`
      : API_ENDPOINTS.EVENTS.GET_ALL;
    return await apiRequest(url, {
      method: "GET",
    });
  },

  // Get single event by ID
  getEventById: async (id) => {
    return await apiRequest(API_ENDPOINTS.EVENTS.GET_BY_ID(id), {
      method: "GET",
    });
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    return await apiRequest(API_ENDPOINTS.EVENTS.UPCOMING, {
      method: "GET",
    });
  },

  // Search events
  searchEvents: async (searchParams) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    return await apiRequest(`${API_ENDPOINTS.EVENTS.SEARCH}?${queryParams}`, {
      method: "GET",
    });
  },

  // Get events by category
  getEventsByCategory: async (category) => {
    return await apiRequest(API_ENDPOINTS.EVENTS.BY_CATEGORY(category), {
      method: "GET",
    });
  },

  // Create event (Admin only)
  createEvent: async (eventData) => {
    return await apiRequest(API_ENDPOINTS.EVENTS.CREATE, {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  // Update event (Admin only)
  updateEvent: async (id, eventData) => {
    return await apiRequest(API_ENDPOINTS.EVENTS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  // Delete event (Admin only)
  deleteEvent: async (id) => {
    return await apiRequest(API_ENDPOINTS.EVENTS.DELETE(id), {
      method: "DELETE",
    });
  },
};

// Booking Services
export const bookingService = {
  // Create Stripe checkout session
  createCheckoutSession: async (eventId, ticketQuantity, attendeeInfo) => {
    return await apiRequest(API_ENDPOINTS.BOOKINGS.CREATE_CHECKOUT, {
      method: "POST",
      body: JSON.stringify({ eventId, ticketQuantity, attendeeInfo }),
    });
  },

  // Confirm payment after successful Stripe checkout
  confirmPayment: async (sessionId) => {
    return await apiRequest(API_ENDPOINTS.BOOKINGS.CONFIRM_PAYMENT, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  },

  // Get user's bookings
  getMyBookings: async () => {
    return await apiRequest(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
      method: "GET",
    });
  },

  // Get single booking
  getBookingById: async (id) => {
    return await apiRequest(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id), {
      method: "GET",
    });
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    return await apiRequest(API_ENDPOINTS.BOOKINGS.CANCEL(id), {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },
};

// Admin Services
export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return await apiRequest(API_ENDPOINTS.ADMIN.DASHBOARD, {
      method: "GET",
    });
  },

  // Get all users
  getAllUsers: async () => {
    return await apiRequest(API_ENDPOINTS.ADMIN.USERS, {
      method: "GET",
    });
  },

  // Get all bookings
  getAllBookings: async () => {
    return await apiRequest(API_ENDPOINTS.ADMIN.BOOKINGS, {
      method: "GET",
    });
  },

  // Get event attendees
  getEventAttendees: async (eventId) => {
    return await apiRequest(API_ENDPOINTS.ADMIN.EVENT_ATTENDEES(eventId), {
      method: "GET",
    });
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    return await apiRequest(API_ENDPOINTS.ADMIN.USER_STATUS(userId), {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  },

  // Check-in attendee
  checkInAttendee: async (bookingId) => {
    return await apiRequest(API_ENDPOINTS.ADMIN.CHECKIN(bookingId), {
      method: "PUT",
    });
  },
};
