import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function ProfileContent({ currentUser, userData, updateProfile }) {
  const profile = userData?.profile || {};
  const [name, setName] = useState(profile.name || currentUser?.name || "");
  const [course, setCourse] = useState(profile.course || "");
  const [semester, setSemester] = useState(profile.semester || "");
  const [rollNumber, setRollNumber] = useState(profile.rollNumber || "");
  const [savedMessage, setSavedMessage] = useState(false);

  const saveProfile = (e) => {
    e.preventDefault();

    updateProfile({
      name: name.trim(),
      course: course.trim(),
      semester: semester.trim(),
      rollNumber: rollNumber.trim()
    });

    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const initial = name.trim() ? name.trim().charAt(0).toUpperCase() : (currentUser?.name?.charAt(0).toUpperCase() || "S");

  return (
    <div className="profile-card">
      <div className="profile-avatar">{initial}</div>

      <h2>{name || "Student Name"}</h2>
      <p className="profile-email-badge">{currentUser?.email}</p>

      {savedMessage && (
        <div className="profile-success-banner">
          ✅ Profile updated successfully!
        </div>
      )}

      <form className="profile-form" onSubmit={saveProfile}>
        <label>Full Name *</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          value={currentUser?.email || ""}
          disabled
          className="input-disabled"
          title="Registered email cannot be changed"
        />

        <label>Course / Degree</label>
        <input
          type="text"
          placeholder="e.g. B.Tech CSE, BCA, MBA"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <label>Semester</label>
        <input
          type="text"
          placeholder="e.g. 5th Semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        />

        <label>Roll Number / Student ID</label>
        <input
          type="text"
          placeholder="e.g. 2024-CS-042"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
        />

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

function Profile() {
  const { currentUser, userData, updateProfile } = useAuth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your CampusSync student profile and academic details.</p>
      </div>

      <ProfileContent
        key={currentUser?.email || "anonymous"}
        currentUser={currentUser}
        userData={userData}
        updateProfile={updateProfile}
      />
    </div>
  );
}

export default Profile;