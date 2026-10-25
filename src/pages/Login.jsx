
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const result = login(email, password);

    if (result.success) {
      navigate(
        result.role === "admin" ? "/admin/dashboard" : "/dashboard",
        { replace: true }
      );
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="logo">
          Campus<span>Sync</span>
        </div>

        <h1>Welcome Back 👋</h1>

        <p className="auth-subtitle">
          Manage your college life in one place.
        </p>

        {error && <div className="auth-alert error-alert">{error}</div>}

        <form onSubmit={handleLogin} autoComplete="off">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button type="submit" className="main-btn">
            Login
          </button>
        </form>

        <p className="bottom-text">
          Don't have an account?{" "}
          <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
