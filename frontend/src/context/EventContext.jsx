import { createContext, useContext, useState, useCallback } from "react";
import { eventsAPI } from "../api/api";

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Backend returns a plain array for GET /events
  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsAPI.getAll(params);
      // FastAPI returns EventResponse[] directly (no wrapper object)
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData) => {
    setLoading(true);
    try {
      const data = await eventsAPI.create(eventData);
      setEvents(prev => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const data = await eventsAPI.update(id, eventData);
      // Backend uses numeric id (not _id)
      setEvents(prev => prev.map(e => e.id === id ? data : e));
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteEvent = async (id) => {
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <EventContext.Provider value={{
      events, loading, error,
      fetchEvents, createEvent, updateEvent, deleteEvent,
    }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within EventProvider");
  return ctx;
};
