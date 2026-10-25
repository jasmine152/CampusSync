
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userData, logout, events = [] } = useAuth();

  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    if (!currentUser) {
      setHasNewNotifications(false);
      return;
    }

    const storageKey =
      `campus_events_last_viewed_${currentUser.email.toLowerCase()}`;

    // When the user opens Events, mark current events as viewed.
    if (location.pathname === "/events") {
      localStorage.setItem(storageKey, Date.now().toString());
      setHasNewNotifications(false);
      return;
    }

    const lastViewed = Number(localStorage.getItem(storageKey) || 0);

    const hasNew = events.some((event) => {
      return event.createdAt && Number(event.createdAt) > lastViewed;
    });

    setHasNewNotifications(hasNew);
  }, [events, currentUser, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const displayName = isAdmin
    ? "University Admin"
    : userData?.profile?.name || currentUser?.name || "Student";

  const initial = displayName.trim()
    ? displayName.trim().charAt(0).toUpperCase()
    : "S";

  const homePath = isAdmin ? "/admin/dashboard" : "/dashboard";
  const profilePath = isAdmin ? "/admin/dashboard" : "/profile";

  return (
    <nav className="navbar">
      <Link to={homePath} className="nav-logo">
        Campus<span>Sync</span>
      </Link>

      <div className="nav-right">
        <Link
          to="/events"
          className="notification"
          title="Announcements & Events"
          aria-label={
            hasNewNotifications
              ? "Announcements and events - new notifications"
              : "Announcements and events"
          }
        >
          🔔
          {hasNewNotifications && (
            <span className="notification-dot"></span>
          )}
        </Link>

        <Link
          to={profilePath}
          className="profile-small"
          title={isAdmin ? "Admin Dashboard" : "View Profile"}
        >
          {initial}
        </Link>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Log out"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
