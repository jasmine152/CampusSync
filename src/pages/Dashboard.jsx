import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { currentUser, userData, updateTasks } = useAuth();

  const studentName = userData?.profile?.name || currentUser?.name || "Student";

  /* ================= GREETING ================= */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const greeting = getGreeting();

  /* ================= ATTENDANCE ================= */
  const subjects = userData?.attendance?.subjects || [];
  const totalClasses = subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const attendedClasses = subjects.reduce((sum, s) => sum + (Number(s.attended) || 0), 0);
  const attendance = totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

  /* ================= STUDY TASKS ================= */
  const tasks = userData?.tasks || [];
  const completedTasks = tasks.filter((task) => task.completed).length;
  const taskProgress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const toggleTask = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    updateTasks(updated);
  };

  /* ================= PRODUCTIVITY ================= */
  const attendanceScore = Math.min(attendance, 100) * 0.50;
  const studyScore = taskProgress * 0.50;
  const productivityScore = Math.round(attendanceScore + studyScore);

  /* ================= DATE & TODAY'S CLASSES ================= */
  const today = new Date();
  const dateText = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = dayNames[today.getDay()];
  const todayClasses = userData?.timetable?.[currentDayName] || [];

  return (
    <div className="page-container">
      {/* ================= HEADER ================= */}
      <div className="dashboard-heading">
        <div>
          <h1>
            {greeting}, {studentName} 👋
          </h1>
          <p>Here's what's happening with your studies today.</p>
        </div>

        <div className="today-date">📅 {dateText}</div>
      </div>

      {/* ================= STATS (3 CARDS) ================= */}
      <div className="dashboard-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {/* Attendance */}
        <Link to="/attendance" className="dashboard-stat-link">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div>
              <p>Attendance</p>
              <h2>{attendance}%</h2>
              <span className={attendance >= 75 ? "positive" : "negative"}>
                {subjects.length === 0
                  ? "No subjects added"
                  : attendance >= 75
                  ? "Above requirement"
                  : "Below requirement"}
              </span>
            </div>
          </div>
        </Link>

        {/* Study Progress */}
        <Link to="/study-planner" className="dashboard-stat-link">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div>
              <p>Study Progress</p>
              <h2>{taskProgress}%</h2>
              <span>
                {completedTasks}/{tasks.length} tasks completed
              </span>
            </div>
          </div>
        </Link>

        {/* Productivity */}
        <div className="stat-card productivity-card">
          <div className="stat-icon">⚡</div>
          <div>
            <p>Productivity Score</p>
            <h2>{productivityScore}/100</h2>
            <span>
              {productivityScore >= 80
                ? "Excellent work!"
                : productivityScore >= 60
                ? "Keep improving!"
                : "Let's get started!"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="dashboard-grid">
        {/* TODAY'S CLASSES */}
        <div className="dashboard-card">
          <div className="card-title">
            <div>
              <h2>Today's Classes</h2>
              <p>{currentDayName}'s schedule</p>
            </div>
            <Link to="/timetable">View timetable →</Link>
          </div>

          <div className="class-list">
            {todayClasses.length === 0 ? (
              <div className="empty-message">
                📅 No classes scheduled for {currentDayName}.
              </div>
            ) : (
              todayClasses.map((item, index) => {
                const time = Array.isArray(item) ? item[0] : item.time;
                const subject = Array.isArray(item) ? item[1] : item.subject;
                const room = Array.isArray(item) ? item[2] : item.room || item.location;

                return (
                  <div className="class-item" key={item.id || index}>
                    <div className="class-time">{time}</div>
                    <div>
                      <h3>{subject}</h3>
                      <p>{room ? `📍 ${room}` : "Classroom"}</p>
                    </div>
                    <span className="class-status">Upcoming</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TODAY'S TASKS */}
        <div className="dashboard-card">
          <div className="card-title">
            <div>
              <h2>Today's Tasks</h2>
              <p>Your daily study goals</p>
            </div>
            <Link to="/study-planner">Manage →</Link>
          </div>

          <div className="dashboard-tasks">
            {tasks.length === 0 ? (
              <div className="empty-message">
                🎯 No tasks added yet. Click "Manage" to set study goals!
              </div>
            ) : (
              tasks.slice(0, 4).map((task) => {
                const title = task.title || task.name || "Study Task";
                const details = task.subject
                  ? `${task.subject}${task.duration ? ` • ${task.duration}` : ""}`
                  : task.duration || task.time || "";

                return (
                  <Link
                    to="/study-planner"
                    className="dashboard-task-link"
                    key={task.id}
                    title="Click to view in Study Planner"
                  >
                    <div className="dashboard-task">
                      <span
                        className={task.completed ? "task-check done" : "task-check"}
                        onClick={(e) => toggleTask(e, task.id)}
                        title={task.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {task.completed ? "✓" : ""}
                      </span>

                      <div style={{ flex: 1 }}>
                        <h3 className={task.completed ? "task-done" : ""}>{title}</h3>
                        {details && <p>{details}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ANNOUNCEMENTS */}
        <div className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-title">
            <div>
              <h2>University Announcements</h2>
              <p>Latest updates & campus notices</p>
            </div>
            <Link to="/events">View all →</Link>
          </div>

          <div className="announcement-list">
            <div className="announcement">
              <div className="announcement-icon">📢</div>
              <div>
                <h3>Mid-Semester Examination</h3>
                <p>Examination schedule has been released.</p>
              </div>
            </div>

            <div className="announcement">
              <div className="announcement-icon">🎓</div>
              <div>
                <h3>Tech Fest Registration</h3>
                <p>Registration is now open for students.</p>
              </div>
            </div>

            <div className="announcement">
              <div className="announcement-icon">💻</div>
              <div>
                <h3>Hackathon 2026</h3>
                <p>Team registrations are open.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;