import { useState } from "react";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import CreateEventPage from "./pages/CreateEventPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const navigate = (page, id = null) => {
    setCurrentPage(page);
    if (id) setSelectedEventId(id);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage navigate={navigate} />;
      case "events": return <EventsPage navigate={navigate} />;
      case "event-detail": return <EventDetailPage navigate={navigate} eventId={selectedEventId} />;
      case "dashboard": return <DashboardPage navigate={navigate} />;
      case "login": return <LoginPage navigate={navigate} />;
      case "create-event": return <CreateEventPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <EventProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0f", fontFamily: "'Outfit', sans-serif" }}>
          <Navbar currentPage={currentPage} navigate={navigate} />
          <main style={{ flex: 1 }}>
            {renderPage()}
          </main>
          <Footer navigate={navigate} />
        </div>
      </EventProvider>
    </AuthProvider>
  );
}
