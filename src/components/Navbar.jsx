import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = userData?.profile?.name || currentUser?.name || "Student";
  const initial = displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : "S";

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="nav-logo">
        Campus<span>Sync</span>
      </Link>

      <div className="nav-right">
        <Link to="/events" className="notification" title="Announcements & Events">
          🔔
        </Link>

        <Link to="/profile" className="profile-small" title="View Profile">
          {initial}
        </Link>

        <button className="logout-btn" onClick={handleLogout} title="Log out">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;