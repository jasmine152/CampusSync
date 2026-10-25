
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "Date not specified";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function Events() {
  const { events, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return (
    <div className="cs-page">
      <div className="cs-page-header">
        <div>
          <span className="cs-eyebrow">CAMPUSSYNC • UNIVERSITY UPDATES</span>
          <h1>Events & Announcements</h1>
          <p>
            Stay updated with important university news and campus activities.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin/events" className="cs-btn cs-btn-primary">
            + Manage Events
          </Link>
        )}
      </div>

      {sortedEvents.length === 0 ? (
        <div className="cs-empty">
          <div className="cs-empty-icon">📢</div>
          <h2>No events published yet</h2>
          <p>
            University events and announcements will appear here when published.
          </p>

          {isAdmin && (
            <Link to="/admin/events" className="cs-btn cs-btn-primary">
              Create First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="cs-event-grid">
          {sortedEvents.map((event) => (
            <article className="cs-event-card" key={event.id}>
              <div className="cs-event-card-top">
                <span
                  className={
                    event.type === "Announcement"
                      ? "cs-type cs-type-announcement"
                      : "cs-type cs-type-event"
                  }
                >
                  {event.type || "Event"}
                </span>

                <span className="cs-event-date">
                  📅 {formatDate(event.date)}
                </span>
              </div>

              <h2>{event.title}</h2>

              <p className="cs-event-description">
                {event.description}
              </p>

              {event.venue && (
                <p className="cs-event-venue">
                  <strong>📍 Venue:</strong> {event.venue}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
