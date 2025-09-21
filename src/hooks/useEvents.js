import { useState, useEffect, useCallback } from "react";
import { eventService } from "../services/api";

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getAllEvents(filters);
      if (response.success) {
        setEvents(response.data);
      } else {
        setError("Failed to fetch events");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getUpcomingEvents();
      if (response.success) {
        setEvents(response.data);
      } else {
        setError("Failed to fetch upcoming events");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch upcoming events");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchEvents = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.searchEvents(searchParams);
      if (response.success) {
        setEvents(response.data);
      } else {
        setError("Failed to search events");
      }
    } catch (err) {
      setError(err.message || "Failed to search events");
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventsByCategory = useCallback(async (category) => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventsByCategory(category);
      if (response.success) {
        setEvents(response.data);
      } else {
        setError("Failed to fetch events by category");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch events by category");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchUpcomingEvents,
    searchEvents,
    getEventsByCategory,
    refetch: fetchEvents,
  };
};

export const useEvent = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getEventById(eventId);
        if (response.success) {
          setEvent(response.data);
        } else {
          setError("Event not found");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return {
    event,
    loading,
    error,
  };
};
