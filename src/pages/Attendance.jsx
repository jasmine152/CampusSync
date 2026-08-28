import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Attendance() {
  const { userData, updateAttendance } = useAuth();
  const subjects = userData?.attendance?.subjects || [];

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newAttended, setNewAttended] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAttended, setEditAttended] = useState("");
  const [editTotal, setEditTotal] = useState("");
  const [barsAnimated, setBarsAnimated] = useState(false);

  // Trigger bar-graph grow-in animation shortly after mount (runs on every
  // page load / refresh since this is a fresh component mount each time)
  useEffect(() => {
    const timer = setTimeout(() => setBarsAnimated(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const required = 75;

  // Aggregate stats across all subjects
  const total = subjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const attended = subjects.reduce((sum, s) => sum + (Number(s.attended) || 0), 0);
  const percentage = total === 0 ? "0.0" : ((attended / total) * 100).toFixed(1);
  const numericPct = Number(percentage);
  const isOverallSafe = numericPct >= required;

  // SVG Donut metrics
  const radius = 74;
  const circumference = 2 * Math.PI * radius; // ~364.42
  const strokeDashoffset =
    total === 0
      ? circumference
      : circumference - (circumference * Math.min(numericPct, 100)) / 100;
  const donutColor = isOverallSafe ? "#16a34a" : "#dc2626";

  // Per-subject bunk/attend calculator — tells the student exactly which
  // subject(s) they can safely miss a class in, and which ones need
  // makeup attendance, instead of only a single overall number.
  const getSubjectBunkStatus = (subAttended, subTotal) => {
    if (subTotal === 0) {
      return { type: "none" };
    }
    const subPct = (subAttended / subTotal) * 100;

    if (subPct >= required) {
      let lectures = subTotal;
      let can = 0;
      while (((subAttended / (lectures + 1)) * 100) >= required) {
        lectures++;
        can++;
      }
      return { type: "safe", count: can };
    }

    let curAtt = subAttended;
    let curTot = subTotal;
    let need = 0;
    while (((curAtt / curTot) * 100) < required) {
      curAtt++;
      curTot++;
      need++;
    }
    return { type: "warning", count: need };
  };

  // Add a new subject
  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      alert("Please enter a subject name.");
      return;
    }

    const att = Math.max(0, parseInt(newAttended) || 0);
    const tot = Math.max(att, parseInt(newTotal) || att);

    const newSubject = {
      id: Date.now(),
      name: newSubjectName.trim(),
      attended: att,
      total: tot
    };

    const updated = [...subjects, newSubject];
    updateAttendance({ subjects: updated });

    setNewSubjectName("");
    setNewAttended("");
    setNewTotal("");
    setShowAddForm(false);
  };

  // Delete subject
  const handleDeleteSubject = (id) => {
    if (window.confirm("Are you sure you want to remove this subject?")) {
      const updated = subjects.filter((s) => s.id !== id);
      updateAttendance({ subjects: updated });
    }
  };

  // Quick attended increment
  const handleAttendedIncrement = (id) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          attended: Number(s.attended) + 1,
          total: Number(s.total) + 1
        };
      }
      return s;
    });
    updateAttendance({ subjects: updated });
  };

  // Quick missed increment (total increases, attended stays same)
  const handleMissedIncrement = (id) => {
    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          total: Number(s.total) + 1
        };
      }
      return s;
    });
    updateAttendance({ subjects: updated });
  };

  // Start editing
  const startEditing = (subj) => {
    setEditingSubjectId(subj.id);
    setEditName(subj.name);
    setEditAttended(subj.attended);
    setEditTotal(subj.total);
  };

  // Save edit
  const handleSaveEdit = (id) => {
    if (!editName.trim()) {
      alert("Subject name cannot be empty.");
      return;
    }
    const att = Math.max(0, parseInt(editAttended) || 0);
    const tot = Math.max(att, parseInt(editTotal) || att);

    const updated = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          name: editName.trim(),
          attended: att,
          total: tot
        };
      }
      return s;
    });

    updateAttendance({ subjects: updated });
    setEditingSubjectId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>Attendance Tracker</h1>
          <p>Visual analytics for your attendance with side-by-side graphs.</p>
        </div>
        <button
          className="main-btn"
          style={{ width: "auto", padding: "10px 20px" }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Subject"}
        </button>
      </div>

      {/* Add Subject Form */}
      {showAddForm && (
        <div className="page-card" style={{ marginBottom: "25px", border: "2px solid #6366f1" }}>
          <h2>Add New Subject</h2>
          <form className="assignment-form" onSubmit={handleAddSubject}>
            <input
              type="text"
              placeholder="Subject Name (e.g. Data Structures)"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              required
              style={{ flex: 2 }}
            />
            <input
              type="number"
              min="0"
              placeholder="Classes Attended (e.g. 15)"
              value={newAttended}
              onChange={(e) => setNewAttended(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              min="0"
              placeholder="Total Classes (e.g. 18)"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit">Save Subject</button>
          </form>
        </div>
      )}

      {/* ================= SIDE-BY-SIDE GRAPHS GRID ================= */}
      <div className="attendance-side-grid">
        {/* 1. VERTICAL BAR GRAPH */}
        <div className="page-card chart-card">
          <div className="chart-card-header">
            <div>
              <h2>Subject Bar Graph</h2>
              <p>Percentage per subject</p>
            </div>

            <div className="chart-legend">
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: "#2563eb" }}></span>
                ≥75%
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot" style={{ background: "#dc2626" }}></span>
                &lt;75%
              </span>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="empty-message" style={{ textAlign: "center", padding: "60px 10px", color: "#64748b" }}>
              📊 No subjects added yet. Add subjects to see the bar graph!
            </div>
          ) : (
            <div className="bar-graph-wrapper">
              <div
                className="bar-graph-container"
                style={subjects.length > 6 ? { minWidth: `${subjects.length * 70}px` } : undefined}
              >
                {/* Y-AXIS LABELS */}
                <div className="bar-graph-yaxis">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                <div className="bar-graph-plot">
                  {/* GRIDLINES */}
                  <div className="bar-graph-gridline" style={{ top: "50%" }} />
                  <div className="bar-graph-gridline" style={{ top: "75%" }} />

                  {/* 75% TARGET LINE */}
                  <div className="bar-graph-target-line" style={{ top: "25%" }}>
                    <span className="bar-graph-target-label">75% Target</span>
                  </div>

                  {/* VERTICAL BARS */}
                  <div className="bar-graph-bars">
                    {subjects.map((sub) => {
                      const subAtt = Number(sub.attended) || 0;
                      const subTot = Number(sub.total) || 0;
                      const subPct = subTot === 0 ? 0 : Math.round((subAtt / subTot) * 100);
                      const isSafe = subPct >= 75;
                      const barColor = isSafe ? "#2563eb" : "#dc2626";

                      return (
                        <div className="bar-col" key={sub.id}>
                          <div
                            className="bar-value"
                            style={{ color: barColor, opacity: barsAnimated ? 1 : 0 }}
                          >
                            {subPct}%
                          </div>

                          <div
                            className="bar-shape"
                            style={{
                              height: barsAnimated ? `${Math.max(subPct, 2)}%` : "0%",
                              background: barColor
                            }}
                            title={`${sub.name}: ${subPct}% (${subAtt}/${subTot} classes)`}
                          />

                          <div className="bar-label" title={sub.name}>
                            {sub.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. OVERALL DONUT GRAPH */}
        <div className="page-card chart-card donut-card">
          <h2>Overall Attendance</h2>
          <p className="donut-intro">Total attendance across all subjects</p>

          <div className="donut-visual">
            <svg width="210" height="210" viewBox="0 0 210 210">
              {/* Background Ring */}
              <circle
                cx="105"
                cy="105"
                r={radius}
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="16"
              />
              {/* Progress Donut Arc */}
              <circle
                cx="105"
                cy="105"
                r={radius}
                fill="transparent"
                stroke={donutColor}
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 105 105)"
                style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
              />
            </svg>

            {/* Inner Content */}
            <div className="donut-center">
              <span className="donut-percentage" style={{ color: donutColor }}>
                {percentage}%
              </span>
              <span className="donut-sublabel">Overall</span>
            </div>
          </div>

          <span className={`donut-status-badge ${isOverallSafe ? "donut-status-safe" : "donut-status-warning"}`}>
            {subjects.length === 0
              ? "No Subjects Added"
              : isOverallSafe
              ? "✅ Requirement Met (≥ 75%)"
              : "⚠️ Shortage Alert (< 75%)"}
          </span>

          <div className="donut-stats">
            <div>
              <span>Attended</span>
              <strong style={{ color: "#16a34a" }}>{attended}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{total}</strong>
            </div>
            <div>
              <span>Missed</span>
              <strong style={{ color: "#dc2626" }}>{Math.max(0, total - attended)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bunk Calculator — per-subject breakdown */}
      <div className="bunk-card bunk-card-list">
        <div className="bunk-card-header">
          <div className="bunk-icon">🎯</div>
          <div>
            <h2>Can I bunk a class?</h2>
            <p className="bunk-card-subtitle">
              Subject-wise status at the {required}% requirement
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Add subjects above to check which classes you can safely bunk.
          </p>
        ) : (
          <div className="bunk-subject-list">
            {subjects.map((sub) => {
              const subAtt = Number(sub.attended) || 0;
              const subTot = Number(sub.total) || 0;
              const subPct = subTot === 0 ? 0 : Math.round((subAtt / subTot) * 100);
              const status = getSubjectBunkStatus(subAtt, subTot);

              return (
                <div className="bunk-subject-row" key={sub.id}>
                  <div className="bunk-subject-name">
                    <strong>{sub.name}</strong>
                    <span>{subPct}% attendance</span>
                  </div>

                  {status.type === "none" ? (
                    <span className="bunk-pill bunk-pill-neutral">No classes logged yet</span>
                  ) : status.type === "safe" ? (
                    <span className="bunk-pill bunk-pill-safe">
                      ✅ Can bunk {status.count} class{status.count !== 1 ? "es" : ""}
                    </span>
                  ) : (
                    <span className="bunk-pill bunk-pill-warning">
                      ⚠️ Attend {status.count} more class{status.count !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Attendance List */}
      <div className="page-card">
        <div className="card-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2>Subject-wise Management</h2>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {subjects.length === 0 ? (
          <div className="empty-message" style={{ textAlign: "center", padding: "30px 10px", color: "#64748b" }}>
            📚 No subjects added yet. Click <strong>"+ Add Subject"</strong> to start managing your attendance.
          </div>
        ) : (
          subjects.map((sub) => {
            const subAtt = Number(sub.attended) || 0;
            const subTot = Number(sub.total) || 0;
            const subPct = subTot === 0 ? 0 : Math.round((subAtt / subTot) * 100);
            const isEditing = editingSubjectId === sub.id;

            return (
              <div
                className="subject-row"
                key={sub.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid #e5e7eb",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                {isEditing ? (
                  <div style={{ display: "flex", gap: "10px", flex: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Subject Name"
                      style={{ padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px", flex: 2 }}
                    />
                    <input
                      type="number"
                      min="0"
                      value={editAttended}
                      onChange={(e) => setEditAttended(e.target.value)}
                      placeholder="Attended"
                      style={{ width: "90px", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                    <input
                      type="number"
                      min="0"
                      value={editTotal}
                      onChange={(e) => setEditTotal(e.target.value)}
                      placeholder="Total"
                      style={{ width: "90px", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}
                    />
                    <button
                      onClick={() => handleSaveEdit(sub.id)}
                      style={{ background: "#22c55e", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSubjectId(null)}
                      style={{ background: "#94a3b8", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <strong style={{ fontSize: "16px" }}>{sub.name}</strong>
                      <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                        {subAtt} / {subTot} classes ({subTot - subAtt} missed)
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <strong
                        style={{
                          fontSize: "18px",
                          minWidth: "55px",
                          textAlign: "right",
                          color: subPct >= 75 ? "#16a34a" : "#dc2626"
                        }}
                      >
                        {subPct}%
                      </strong>

                      <button
                        onClick={() => handleAttendedIncrement(sub.id)}
                        style={{ background: "#eef2ff", color: "#6366f1", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                        title="Attended a class (+1 Attended, +1 Total)"
                      >
                        + Attended
                      </button>

                      <button
                        onClick={() => handleMissedIncrement(sub.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                        title="Missed a class (+1 Total)"
                      >
                        + Missed
                      </button>

                      <button
                        onClick={() => startEditing(sub)}
                        style={{ background: "#f1f5f9", color: "#475569", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        title="Edit subject details"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        title="Delete subject"
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
    </div>
  );
}

export default Attendance;