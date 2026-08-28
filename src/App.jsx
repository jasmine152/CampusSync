import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import StudyPlanner from "./pages/StudyPlanner";
import Events from "./pages/Events";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";


// ================= LAYOUT =================

function Layout() {

  return (

    <div className="app">

      <Navbar />

      <Sidebar />

      <main className="main-content">

        <Routes>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/timetable"
            element={<Timetable />}
          />

          <Route
            path="/study-planner"
            element={<StudyPlanner />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* Wrong page */}

          <Route
            path="*"
            element={
              <div className="page-container">
                <div className="page-card">
                  <h1>404</h1>
                  <p>
                    Sorry, this page does not exist.
                  </p>
                </div>
              </div>
            }
          />

        </Routes>

      </main>

    </div>

  );
}


// ================= APP =================

function App() {

  return (

    <Routes>

      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={
          <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />


      {/* ================= PROTECTED ================= */}

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />

    </Routes>

  );

}

export default App;