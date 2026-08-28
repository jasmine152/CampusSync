import { NavLink } from "react-router-dom";
import { useState } from "react";

function Sidebar() {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );


  const toggleDarkMode = () => {

    const newMode = !darkMode;

    setDarkMode(newMode);

    localStorage.setItem(
      "darkMode",
      newMode
    );


    if (newMode) {

      document.body.classList.add("dark");

    } else {

      document.body.classList.remove("dark");

    }

  };


  return (

    <aside className="sidebar">

      <div className="sidebar-menu">

        <NavLink to="/dashboard">
          🏠 Dashboard
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

      </div>


      <div className="sidebar-bottom">

        <button
          onClick={toggleDarkMode}
        >

          {darkMode
            ? "☀️ Light Mode"
            : "🌙 Dark Mode"}

        </button>

      </div>

    </aside>

  );
}

export default Sidebar;