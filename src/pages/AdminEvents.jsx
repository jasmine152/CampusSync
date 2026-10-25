
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  type: "Event",
  title: "",
  date: "",
  venue: "",
  description: ""
};

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

function AdminEvents() {
  const { events, addEvent, updateEvent, deleteEvent } = useAuth();

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const eventData = {
      type: form.type,
      title: form.title.trim(),
      date: form.date,
      venue: form.venue.trim(),
      description: form.description.trim()
    };

    if (
      !eventData.title ||
      !eventData.date ||
      !eventData.description
    ) {
      setMessage("Please fill in the title, date and description.");
      return;
    }

    if (editingId !== null) {
      updateEvent(editingId, eventData);
      setMessage("Event updated successfully.");
    } else {
      addEvent(eventData);
      setMessage("Event added successfully.");
    }

    setForm({ ...emptyForm });
    setEditingId(null);
  };

  const handleEdit = (event) => {
    setEditingId(event.id);

    setForm({
      type: event.type || "Event",
      title: event.title || "",
      date: event.date || "",
      venue: event.venue || "",
      description: event.description || ""
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`
    );

    if (!confirmed) return;

    deleteEvent(event.id);

    if (editingId === event.id) {
      setForm({ ...emptyForm });
      setEditingId(null);
    }

    setMessage("Event deleted successfully.");
  };

  return (
    <div className="cs-page">
      <div className="cs-page-header">
        <div>
          <span className="cs-eyebrow">ADMINISTRATION</span>
          <h1>Manage Events</h1>
          <p>
            Create and manage university events and announcements.
          </p>
        </div>

        <Link to="/events" className="cs-btn cs-btn-secondary">
          View Student Page
        </Link>
      </div>

      <div className="cs-management-layout">
        <section className="cs-form-card">
          <div className="cs-section-header">
            <div>
              <h2>{editingId !== null ? "Edit Event" : "Create New Event"}</h2>
              <p>
                {editingId !== null
                  ? "Update the selected event details."
                  : "Complete the form to publish a university update."}
              </p>
            </div>
          </div>

          {message && (
            <div className="cs-message" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="cs-event-form">
            <div className="cs-field">
              <label htmlFor="type">Update Type *</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="Event">University Event</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>

            <div className="cs-field">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Annual Tech Fest"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </div>

            <div className="cs-field">
              <label htmlFor="date">Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="cs-field">
              <label htmlFor="venue">Venue (optional)</label>
              <input
                id="venue"
                name="venue"
                type="text"
                placeholder="e.g. Main Auditorium"
                value={form.venue}
                onChange={handleChange}
                maxLength={150}
              />
            </div>

            <div className="cs-field">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter event details or announcement..."
                value={form.description}
                onChange={handleChange}
                rows={5}
                maxLength={1500}
                required
              />
            </div>

            <div className="cs-form-actions">
              <button type="submit" className="cs-btn cs-btn-primary">
                {editingId !== null ? "Save Changes" : "Publish Update"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="cs-btn cs-btn-secondary"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="cs-section cs-managed-events">
          <div className="cs-section-header">
            <div>
              <h2>All Published Updates</h2>
              <p>{events.length} total items</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="cs-empty">
              <h3>No events yet</h3>
              <p>Your published updates will appear here.</p>
            </div>
          ) : (
            <div className="cs-admin-list">
              {events.map((event) => (
                <article className="cs-managed-item" key={event.id}>
                  <div className="cs-managed-item-content">
                    <span
                      className={
                        event.type === "Announcement"
                          ? "cs-type cs-type-announcement"
                          : "cs-type cs-type-event"
                      }
                    >
                      {event.type || "Event"}
                    </span>

                    <h3>{event.title}</h3>
                    <p>📅 {formatDate(event.date)}</p>

                    {event.venue && <p>📍 {event.venue}</p>}

                    <p className="cs-managed-description">
                      {event.description}
                    </p>
                  </div>

                  <div className="cs-event-actions">
                    <button
                      type="button"
                      className="cs-btn cs-btn-secondary"
                      onClick={() => handleEdit(event)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="cs-btn cs-btn-danger"
                      onClick={() => handleDelete(event)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminEvents;
