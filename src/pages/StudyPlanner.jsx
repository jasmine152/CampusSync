import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function StudyPlanner() {
  const { userData, updateTasks } = useAuth();
  const tasks = userData?.tasks || [];

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");

  // Add new study task
  const addTask = (e) => {
    e.preventDefault();

    if (!subject.trim() || !title.trim() || !duration.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const newTask = {
      id: Date.now(),
      subject: subject.trim(),
      title: title.trim(),
      duration: duration.trim(),
      completed: false
    };

    const updatedTasks = [...tasks, newTask];
    updateTasks(updatedTasks);

    setSubject("");
    setTitle("");
    setDuration("");
  };

  // Complete / Undo task
  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed
        };
      }
      return task;
    });

    updateTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    updateTasks(updatedTasks);
  };

  // Progress calculation
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="page-container">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Study Planner</h1>
        <p>Plan your study goals and track your daily progress.</p>
      </div>

      {/* PROGRESS */}
      <div className="planner-top">
        <div className="progress-card">
          <h2>Today's Progress</h2>
          <div className="progress-number">{progress}%</div>
          <p>
            {completedTasks} of {totalTasks} tasks completed
          </p>

          <div className="progress-bar">
            <div style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* GOAL CARD */}
        <div className="goal-card">
          <h2>Today's Goals 🎯</h2>
          <p>Complete your planned tasks to improve your study progress.</p>
          <h3 style={{ marginTop: "20px" }}>
            {completedTasks}/{totalTasks} Completed
          </h3>
        </div>
      </div>

      {/* ADD TASK */}
      <div className="page-card">
        <h2>Add Study Goal</h2>
        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Subject (e.g. Java, DBMS)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Study task (e.g. Practice Loops)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Duration (e.g. 1 hour, 45 min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <button type="submit">Add Goal</button>
        </form>
      </div>

      {/* TASK LIST */}
      <div className="page-card planner-tasks">
        <div className="card-heading">
          <h2>Today's Tasks</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-message" style={{ textAlign: "center", padding: "30px 10px", color: "#64748b" }}>
            🎯 No study goals added yet. Fill out the form above to plan your study goals!
          </div>
        ) : (
          tasks.map((task) => {
            const taskTitle = task.title || task.name || "Study Task";
            const taskSubject = task.subject || "";
            const taskDuration = task.duration || task.time || "";

            return (
              <div
                className={task.completed ? "planner-task completed-task" : "planner-task"}
                key={task.id}
              >
                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                {/* TASK INFORMATION */}
                <div style={{ flex: 1 }}>
                  <h3>{taskTitle}</h3>
                  <p>
                    {taskSubject} {taskSubject && taskDuration && "•"} {taskDuration}
                  </p>
                </div>

                {/* BUTTONS */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="assignment-actions button"
                >
                  {task.completed ? "Undo" : "Complete"}
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudyPlanner;