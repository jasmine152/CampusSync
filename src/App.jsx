
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";


import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Timetable from "./pages/Timetable";
import StudyPlanner from "./pages/StudyPlanner";
import Events from "./pages/Events";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import "./admin.css";
import EducationalPosts from "./pages/EducationalPosts";

function Layout() {
  return (
    <div className="app">
      <Navbar />
      <Sidebar />

      <main className="main-content">
        <Routes>
          {/* Student-only pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <Dashboard />
              </ProtectedRoute>
            }
          />

            <Route
  path="/educational-posts"
  element={
    <ProtectedRoute requiredRole="student">
      <EducationalPosts />
    </ProtectedRoute>
  }
/>

          <Route
            path="/attendance"
            element={
              <ProtectedRoute requiredRole="student">
                <Attendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/timetable"
            element={
              <ProtectedRoute requiredRole="student">
                <Timetable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/study-planner"
            element={
              <ProtectedRoute requiredRole="student">
                <StudyPlanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Shared Events page */}
          <Route path="/events" element={<Events />} />

          {/* Admin-only pages */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminEvents />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="page-container">
                <div className="page-card">
                  <h1>404</h1>
                  <p>Sorry, this page does not exist.</p>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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
