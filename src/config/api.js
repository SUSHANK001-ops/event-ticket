// API configuration
const API_BASE_URL = "http://localhost:5000/api";

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_DETAILS: `${API_BASE_URL}/auth/updatedetails`,
    UPDATE_PASSWORD: `${API_BASE_URL}/auth/updatepassword`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgotpassword`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/resetpassword`,
  },

  // Event endpoints
  EVENTS: {
    GET_ALL: `${API_BASE_URL}/events`,
    GET_BY_ID: (id) => `${API_BASE_URL}/events/${id}`,
    CREATE: `${API_BASE_URL}/events`,
    UPDATE: (id) => `${API_BASE_URL}/events/${id}`,
    DELETE: (id) => `${API_BASE_URL}/events/${id}`,
    UPCOMING: `${API_BASE_URL}/events/upcoming`,
    SEARCH: `${API_BASE_URL}/events/search`,
    BY_CATEGORY: (category) => `${API_BASE_URL}/events/category/${category}`,
  },

  // Booking endpoints
  BOOKINGS: {
    CREATE_CHECKOUT: `${API_BASE_URL}/bookings/create-checkout-session`,
    CONFIRM_PAYMENT: `${API_BASE_URL}/bookings/confirm-payment`,
    MY_BOOKINGS: `${API_BASE_URL}/bookings/my-bookings`,
    GET_BY_ID: (id) => `${API_BASE_URL}/bookings/${id}`,
    CANCEL: (id) => `${API_BASE_URL}/bookings/${id}/cancel`,
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    USERS: `${API_BASE_URL}/admin/users`,
    BOOKINGS: `${API_BASE_URL}/admin/bookings`,
    EVENT_ATTENDEES: (eventId) =>
      `${API_BASE_URL}/admin/events/${eventId}/attendees`,
    USER_STATUS: (userId) => `${API_BASE_URL}/admin/users/${userId}/status`,
    CHECKIN: (bookingId) =>
      `${API_BASE_URL}/admin/bookings/${bookingId}/checkin`,
  },
};

// Default headers for API requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
export const apiRequest = async (url, options = {}) => {
  try {
    console.log("📡 Making API request to:", url);
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Include cookies and authorization headers
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("❌ API request failed:", error);
    console.error("🔗 URL was:", url);
    throw error;
  }
};

export default API_BASE_URL;
