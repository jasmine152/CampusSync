
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "Date not specified";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function AdminDashboard() {
  const { currentUser, events } = useAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => {
    const date = new Date(`${event.date}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date >= today;
  });

  const announcements = events.filter(
    (event) => event.type === "Announcement"
  );

  return (
    <div className="cs-page">
      <div className="cs-page-header">
        <div>
          <span className="cs-eyebrow">UNIVERSITY ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>
            Welcome, {currentUser?.name || "University Admin"}.
            Manage campus events and announcements from here.
          </p>
        </div>

        <Link to="/admin/events" className="cs-btn cs-btn-primary">
          + Create Event
        </Link>
      </div>

      <div className="cs-stat-grid">
        <div className="cs-stat-card">
          <div className="cs-stat-icon">📅</div>
          <p>Total Events & Announcements</p>
          <h2>{events.length}</h2>
        </div>

        <div className="cs-stat-card">
          <div className="cs-stat-icon">🗓️</div>
          <p>Upcoming Events</p>
          <h2>{upcomingEvents.length}</h2>
        </div>

        <div className="cs-stat-card">
          <div className="cs-stat-icon">📢</div>
          <p>Announcements</p>
          <h2>{announcements.length}</h2>
        </div>
      </div>

      <section className="cs-section">
        <div className="cs-section-header">
          <div>
            <h2>Recently Added</h2>
            <p>Review your latest university updates.</p>
          </div>

          <Link to="/admin/events" className="cs-text-link">
            Manage all →
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="cs-empty">
            <h3>No events available</h3>
            <p>Create your first university event to get started.</p>
            <Link to="/admin/events" className="cs-btn cs-btn-primary">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="cs-admin-list">
            {events.slice(0, 4).map((event) => (
              <div className="cs-admin-list-item" key={event.id}>
                <div className="cs-list-icon">
                  {event.type === "Announcement" ? "📢" : "📅"}
                </div>

                <div className="cs-list-content">
                  <h3>{event.title}</h3>
                  <p>
                    {event.type || "Event"} · {formatDate(event.date)}
                  </p>
                </div>

                <Link
                  to="/admin/events"
                  className="cs-text-link"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
