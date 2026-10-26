
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === "admin";

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;

    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);

    if (newMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        {isAdmin ? (
          <>
            <NavLink to="/admin/dashboard">
              🏠 Admin Dashboard
            </NavLink>

            <NavLink to="/admin/events">
              🛠️ Manage Events
            </NavLink>

            <NavLink to="/events">
              📢 View Events
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard">
              🏠 Dashboard
            </NavLink>
            <NavLink to="/educational-posts">
  📚 Educational Posts
</NavLink>

            <NavLink to="/attendance">
              📊 Attendance
            </NavLink>

            <NavLink to="/timetable">
              📅 Timetable
            </NavLink>

            <NavLink to="/study-planner">
              🎯 Study Planner
            </NavLink>

            <NavLink to="/events">
              📢 Events
            </NavLink>

            <NavLink to="/profile">
              👤 Profile
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
