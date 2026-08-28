import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Timetable() {
  const { userData, updateTimetable } = useAuth();
  const timetable = userData?.timetable || {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  };

  // Default to today's day if valid weekday, else Monday
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const initialDay = DAYS.includes(todayDayName) ? todayDayName : "Monday";

  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [showAddForm, setShowAddForm] = useState(false);
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [editTime, setEditTime] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editRoom, setEditRoom] = useState("");

  const classes = timetable[selectedDay] || [];

  // Add new class
  const handleAddClass = (e) => {
    e.preventDefault();
    if (!subject.trim() || !time.trim()) {
      alert("Please fill in subject name and timing.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      time: time.trim(),
      subject: subject.trim(),
      room: room.trim() || "Classroom"
    };

    const updatedDayClasses = [...classes, newEntry];
    const updatedTimetable = {
      ...timetable,
      [selectedDay]: updatedDayClasses
    };

    updateTimetable(updatedTimetable);

    setTime("");
    setSubject("");
    setRoom("");
    setShowAddForm(false);
  };

  // Delete class
  const handleDeleteClass = (idx) => {
    const updatedDayClasses = classes.filter((_, i) => i !== idx);
    const updatedTimetable = {
      ...timetable,
      [selectedDay]: updatedDayClasses
    };
    updateTimetable(updatedTimetable);
  };

  // Start editing
  const startEditing = (idx, item) => {
    setEditingIndex(idx);
    setEditTime(Array.isArray(item) ? item[0] : item.time);
    setEditSubject(Array.isArray(item) ? item[1] : item.subject);
    setEditRoom(Array.isArray(item) ? item[2] : item.room || item.location || "");
  };

  // Save edit
  const handleSaveEdit = (idx) => {
    if (!editSubject.trim() || !editTime.trim()) {
      alert("Subject name and timing are required.");
      return;
    }

    const updatedDayClasses = classes.map((item, i) => {
      if (i === idx) {
        return {
          id: item.id || Date.now(),
          time: editTime.trim(),
          subject: editSubject.trim(),
          room: editRoom.trim() || "Classroom"
        };
      }
      return item;
    });

    const updatedTimetable = {
      ...timetable,
      [selectedDay]: updatedDayClasses
    };

    updateTimetable(updatedTimetable);
    setEditingIndex(null);
  };

  return (
    <div className="page-container">
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>Smart Timetable</h1>
          <p>Organize your weekly lecture schedule and check upcoming classes.</p>
        </div>
        <button
          className="main-btn"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Cancel" : `+ Add Class for ${selectedDay}`}
        </button>
      </div>

      {/* ADD CLASS FORM */}
      {showAddForm && (
        <div className="page-card" style={{ marginBottom: "25px", border: "2px solid #6366f1" }}>
          <h2>Add Class for {selectedDay}</h2>
          <form className="assignment-form" onSubmit={handleAddClass}>
            <input
              type="text"
              placeholder="Time (e.g. 09:00 AM - 10:00 AM)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="Subject Name (e.g. Operating Systems)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{ flex: 2 }}
            />
            <input
              type="text"
              placeholder="Room / Lab (e.g. Room 204 / Lab 3)"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit">Add Class</button>
          </form>
        </div>
      )}

      {/* DAY BUTTONS */}
      <div className="day-buttons">
        {DAYS.map((day) => (
          <button
            key={day}
            className={selectedDay === day ? "selected-day" : ""}
            onClick={() => {
              setSelectedDay(day);
              setEditingIndex(null);
            }}
          >
            {day}
            {timetable[day]?.length > 0 && ` (${timetable[day].length})`}
          </button>
        ))}
      </div>

      {/* TIMETABLE LIST */}
      <div className="timetable-list">
        {classes.length === 0 ? (
          <div className="page-card empty-message" style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
            📅 No classes added for <strong>{selectedDay}</strong> yet. Click <strong>"+ Add Class for {selectedDay}"</strong> above to add your schedule!
          </div>
        ) : (
          classes.map((item, index) => {
            const classTime = Array.isArray(item) ? item[0] : item.time;
            const classSubject = Array.isArray(item) ? item[1] : item.subject;
            const classRoom = Array.isArray(item) ? item[2] : item.room || item.location;
            const isEditing = editingIndex === index;

            return (
              <div className="time-card" key={item.id || index} style={{ flexWrap: "wrap" }}>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "10px", flex: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="Time (e.g. 09:00 AM)"
                      style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", width: "140px" }}
                    />
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      placeholder="Subject Name"
                      style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: 2 }}
                    />
                    <input
                      type="text"
                      value={editRoom}
                      onChange={(e) => setEditRoom(e.target.value)}
                      placeholder="Room / Lab"
                      style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: 1 }}
                    />
                    <button
                      onClick={() => handleSaveEdit(index)}
                      style={{ background: "#22c55e", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      style={{ background: "#94a3b8", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {/* TIME */}
                    <div className="time">{classTime}</div>

                    {/* SUBJECT */}
                    <div className="time-info">
                      <h3>{classSubject}</h3>
                      <p>📍 {classRoom || "Classroom"}</p>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span className="class-tag">Class</span>
                      <button
                        onClick={() => startEditing(index, item)}
                        style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        title="Edit class"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(index)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        title="Delete class"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* NEXT CLASS BANNER */}
      {classes.length > 0 && (
        <div className="next-class">
          <div>
            <span>Next Class ({selectedDay})</span>
            <h2>{Array.isArray(classes[0]) ? classes[0][1] : classes[0].subject}</h2>
            <p>
              {Array.isArray(classes[0]) ? classes[0][0] : classes[0].time}
              {" • "}
              {Array.isArray(classes[0]) ? classes[0][2] : classes[0].room || "Classroom"}
            </p>
          </div>
          <div className="next-icon">📚</div>
        </div>
      )}
    </div>
  );
}

export default Timetable;