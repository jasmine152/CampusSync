/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

const USERS_KEY = "campus_users";
const CURRENT_USER_KEY = "campus_current_user";
const DATA_KEY = "campus_student_data";

// Helper to get initial users list
const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Helper to get all students' data dictionary
const getStoredAllData = () => {
  try {
    const data = localStorage.getItem(DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

// Helper to get active session user
const getStoredCurrentUser = () => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
};

// Default empty template for a newly registered student
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
  if (!user || !user.email) return null;
  const allData = getStoredAllData();
  const userEmail = user.email.toLowerCase().trim();
  let student = allData[userEmail];
  if (!student) {
    student = createDefaultUserData(user.name, user.email);
    allData[userEmail] = student;
    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
  }
  return student;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(getStoredCurrentUser);
  const [userData, setUserData] = useState(() => getInitialUserData(getStoredCurrentUser()));

  // Signup function: registers account and initializes user data
  const signup = (name, email, password) => {
    const trimmedEmail = email.toLowerCase().trim();
    const users = getStoredUsers();

    const exists = users.find(
      (u) => u.email.toLowerCase().trim() === trimmedEmail
    );

    if (exists) {
      return { success: false, message: "An account with this email already exists. Please log in." };
    }

    const newUser = {
      name: name.trim(),
      email: trimmedEmail,
      password: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Initialize user's personal data
    const allData = getStoredAllData();
    if (!allData[trimmedEmail]) {
      allData[trimmedEmail] = createDefaultUserData(newUser.name, newUser.email);
      localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    }

    return { success: true, message: "Account created successfully! Please log in." };
  };

  // Login function: validates credentials and starts user session
  const login = (email, password) => {
    const trimmedEmail = email.toLowerCase().trim();
    const users = getStoredUsers();

    const user = users.find(
      (u) => u.email.toLowerCase().trim() === trimmedEmail
    );

    if (!user) {
      return {
        success: false,
        message: "No account found with this email. Please sign up first."
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        message: "Invalid password. Please try again."
      };
    }

    const sessionUser = { name: user.name, email: user.email };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
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
    return { success: true };
  };

  // Logout function: ends session while keeping data safely in localStorage
  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("campusUser");
    setCurrentUser(null);
    setUserData(null);
  };

  // Generic helper to update a slice of the logged in user's data
  const updateUserDataSlice = (sliceKey, newSliceData) => {
    if (!currentUser || !currentUser.email) return;
    const userEmail = currentUser.email.toLowerCase().trim();
    const allData = getStoredAllData();
    const currentStudent = allData[userEmail] || createDefaultUserData(currentUser.name, currentUser.email);

    const updatedStudent = {
      ...currentStudent,
      [sliceKey]: newSliceData
    };

    allData[userEmail] = updatedStudent;
    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    setUserData(updatedStudent);
  };

  // Specific updaters
  const updateProfile = (profileData) => {
    if (!currentUser || !currentUser.email) return;
    const userEmail = currentUser.email.toLowerCase().trim();

    // Update in users array too if name changed
    if (profileData.name && profileData.name !== currentUser.name) {
      const users = getStoredUsers();
      const updatedUsers = users.map((u) =>
        u.email.toLowerCase().trim() === userEmail ? { ...u, name: profileData.name } : u
      );
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

      const newSessionUser = { ...currentUser, name: profileData.name };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newSessionUser));
      localStorage.setItem("campusUser", JSON.stringify(newSessionUser));
      setCurrentUser(newSessionUser);
    }

    const currentProfile = userData?.profile || createDefaultUserData(currentUser.name, currentUser.email).profile;
    updateUserDataSlice("profile", {
      ...currentProfile,
      ...profileData,
      email: currentUser.email // email cannot be altered
    });
  };

  const updateAttendance = (attendanceData) => {
    updateUserDataSlice("attendance", attendanceData);
  };

  const updateTimetable = (timetableData) => {
    updateUserDataSlice("timetable", timetableData);
  };

  const updateTasks = (tasksData) => {
    updateUserDataSlice("tasks", tasksData);
  };

  const updateAssignments = (assignmentsData) => {
    updateUserDataSlice("assignments", assignmentsData);
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
        updateAssignments
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
