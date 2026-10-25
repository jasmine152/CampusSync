
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (email.trim().toLowerCase() === ADMIN_EMAIL) {
      setError("This email is reserved for the university administrator.");
      return;
    }

    const result = signup(name, email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setSuccess("Account created successfully! Redirecting to login...");

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="logo">
          Campus<span>Sync</span>
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Start organizing your college life.
        </p>

        {error && <div className="auth-alert error-alert">{error}</div>}
        {success && <div className="auth-alert success-alert">{success}</div>}

        <form onSubmit={handleSignup}>
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" className="main-btn">
            Create Account
          </button>
        </form>

        <p className="bottom-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
