
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

// Demo credentials only. Do not use client-side credentials in production.
export const ADMIN_EMAIL = "admin@campussync.com";
const ADMIN_PASSWORD = "CampusAdmin@2026";

const USERS_KEY = "campus_users";
const CURRENT_USER_KEY = "campus_current_user";
const DATA_KEY = "campus_student_data";
const EVENTS_KEY = "campus_university_events";

// Existing student data helpers
const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const getStoredAllData = () => {
  try {
    const data = localStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const getStoredCurrentUser = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);

    if (!data) return null;

    const user = JSON.parse(data);

    // Existing sessions without a role are treated as student sessions.
    return {
      ...user,
      role: user.role || "student"
    };
  } catch {
    return null;
  }
};

const createDefaultUserData = (name, email) => ({
  profile: {
    name: name || "",
    email: email || "",
    course: "",
    semester: "",
    rollNumber: "",
    phone: ""
  },
  attendance: {
    subjects: []
  },
  timetable: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  },
  tasks: [],
  assignments: []
});

const getInitialUserData = (user) => {
  if (!user || !user.email || user.role === "admin") {
    return null;
  }

  const allData = getStoredAllData();
  const email = user.email.toLowerCase().trim();

  if (!allData[email]) {
    allData[email] = createDefaultUserData(user.name, email);
    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
  }

  return allData[email];
};

// Keep your existing three sample events for the first demo.
// Once saved, even an empty array remains empty after refresh.
const getStoredEvents = () => {
  try {
    const saved = localStorage.getItem(EVENTS_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }

    const initialEvents = [
      {
        id: "seed-1",
        type: "Announcement",
        title: "Mid-Semester Examination",
        date: "2026-08-25",
        venue: "",
        description:
          "The university has released the examination schedule."
      },
      {
        id: "seed-2",
        type: "Event",
        title: "Annual Tech Fest",
        date: "2026-08-30",
        venue: "",
        description:
          "Registration for the annual technical festival is now open."
      },
      {
        id: "seed-3",
        type: "Event",
        title: "Hackathon 2026",
        date: "2026-09-05",
        venue: "",
        description:
          "Students can register their teams for the upcoming hackathon."
      }
    ];

    localStorage.setItem(EVENTS_KEY, JSON.stringify(initialEvents));
    return initialEvents;
  } catch {
    return [];
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    getStoredCurrentUser
  );

  const [userData, setUserData] = useState(() =>
    getInitialUserData(getStoredCurrentUser())
  );

  const [events, setEvents] = useState(getStoredEvents);

  // Student signup only
  const signup = (name, email, password) => {
    const trimmedEmail = email.toLowerCase().trim();

    if (trimmedEmail === ADMIN_EMAIL) {
      return {
        success: false,
        message: "This email is reserved for the university administrator."
      };
    }

    const users = getStoredUsers();

    const exists = users.find(
      (user) =>
        user.email.toLowerCase().trim() === trimmedEmail
    );

    if (exists) {
      return {
        success: false,
        message:
          "An account with this email already exists. Please log in."
      };
    }

    const newUser = {
      name: name.trim(),
      email: trimmedEmail,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const allData = getStoredAllData();

    if (!allData[trimmedEmail]) {
      allData[trimmedEmail] = createDefaultUserData(
        newUser.name,
        newUser.email
      );

      localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    }

    return {
      success: true,
      message: "Account created successfully! Please log in."
    };
  };

  // Login for the designated admin or an existing student
  const login = (email, password) => {
    const trimmedEmail = email.toLowerCase().trim();

    // Admin login
    if (trimmedEmail === ADMIN_EMAIL) {
      if (password !== ADMIN_PASSWORD) {
        return {
          success: false,
          message: "Invalid administrator password."
        };
      }

      const adminUser = {
        name: "University Admin",
        email: ADMIN_EMAIL,
        role: "admin"
      };

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(adminUser)
      );
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("campusUser", JSON.stringify(adminUser));

      setCurrentUser(adminUser);
      setUserData(null);

      return { success: true, role: "admin" };
    }

    // Existing student login
    const users = getStoredUsers();

    const user = users.find(
      (item) =>
        item.email.toLowerCase().trim() === trimmedEmail
    );

    if (!user) {
      return {
        success: false,
        message:
          "No account found with this email. Please sign up first."
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: "Invalid password. Please try again."
      };
    }

    const sessionUser = {
      name: user.name,
      email: user.email,
      role: "student"
    };

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(sessionUser)
    );
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("campusUser", JSON.stringify(sessionUser));

    const allData = getStoredAllData();
    let student = allData[trimmedEmail];

    if (!student) {
      student = createDefaultUserData(user.name, user.email);
      allData[trimmedEmail] = student;
      localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    }

    setCurrentUser(sessionUser);
    setUserData(student);

    return { success: true, role: "student" };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("campusUser");

    setCurrentUser(null);
    setUserData(null);
  };

  // Existing student data update logic
  const updateUserDataSlice = (sliceKey, newSliceData) => {
    if (
      !currentUser ||
      currentUser.role !== "student" ||
      !currentUser.email
    ) {
      return;
    }

    const email = currentUser.email.toLowerCase().trim();
    const allData = getStoredAllData();

    const currentStudent =
      allData[email] ||
      createDefaultUserData(currentUser.name, currentUser.email);

    const updatedStudent = {
      ...currentStudent,
      [sliceKey]: newSliceData
    };

    allData[email] = updatedStudent;
    localStorage.setItem(DATA_KEY, JSON.stringify(allData));

    setUserData(updatedStudent);
  };

  const updateProfile = (profileData) => {
    if (!currentUser || currentUser.role !== "student") return;

    const email = currentUser.email.toLowerCase().trim();

    if (
      profileData.name &&
      profileData.name !== currentUser.name
    ) {
      const users = getStoredUsers();

      const updatedUsers = users.map((user) =>
        user.email.toLowerCase().trim() === email
          ? { ...user, name: profileData.name }
          : user
      );

      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      const updatedSession = {
        ...currentUser,
        name: profileData.name
      };

      localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(updatedSession)
      );
      localStorage.setItem("campusUser", JSON.stringify(updatedSession));

      setCurrentUser(updatedSession);
    }

    const currentProfile =
      userData?.profile ||
      createDefaultUserData(currentUser.name, currentUser.email).profile;

    updateUserDataSlice("profile", {
      ...currentProfile,
      ...profileData,
      email: currentUser.email
    });
  };

  const updateAttendance = (data) =>
    updateUserDataSlice("attendance", data);

  const updateTimetable = (data) =>
    updateUserDataSlice("timetable", data);

  const updateTasks = (data) =>
    updateUserDataSlice("tasks", data);

  const updateAssignments = (data) =>
    updateUserDataSlice("assignments", data);

  // Shared event storage: changes are allowed only for admin sessions.
  const saveEvents = (updatedEvents) => {
    if (currentUser?.role !== "admin") return false;

    localStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
    setEvents(updatedEvents);

    return true;
  };

 
const addEvent = (eventData) => {
  if (currentUser?.role !== "admin") return;

  const newEvent = {
    ...eventData,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };

  setEvents((previousEvents) => {
    const updatedEvents = [...previousEvents, newEvent];

    localStorage.setItem(
      "campus_events",
      JSON.stringify(updatedEvents)
    );

    return updatedEvents;
  });
};


  const updateEvent = (id, eventData) => {
    if (currentUser?.role !== "admin") return;

    const updatedEvents = events.map((event) =>
      event.id === id ? { ...event, ...eventData, id } : event
    );

    saveEvents(updatedEvents);
  };

  const deleteEvent = (id) => {
    if (currentUser?.role !== "admin") return;

    saveEvents(events.filter((event) => event.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userData,
        signup,
        login,
        logout,
        updateProfile,
        updateAttendance,
        updateTimetable,
        updateTasks,
        updateAssignments,
        events,
        addEvent,
        updateEvent,
        deleteEvent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
