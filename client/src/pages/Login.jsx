// client/src/pages/Login.jsx
import React, { useContext, useState } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";          // ✅ NEW
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("teacher@example.com");
  const [password, setPassword] = useState("teacher123");
  const [fullName, setFullName] = useState("");  // ✅ we use this now
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;

      // store token in context/localStorage as before
      login(token);

      // ✅ store the full name the user typed (for greetings)
      if (fullName.trim()) {
        localStorage.setItem("displayName", fullName.trim());
      } else {
        localStorage.removeItem("displayName");
      }

      // ✅ decode role from token & choose dashboard
      let redirectPath = "/dashboard"; // default: teacher

      try {
        const decoded = jwtDecode(token);
        if (decoded?.role === "parent") {
          redirectPath = "/parent-dashboard";
        }
      } catch (decodeErr) {
        console.warn("Failed to decode token for role:", decodeErr);
      }

      navigate(redirectPath);
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const heroImage =
    "https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=4d4cd6e5b9a0b7a3a2f3c3f5d3a95787";

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* LEFT: Form card */}
          <div className={styles.formCard}>
            <form
              onSubmit={submit}
              className={styles.formInner}
              aria-labelledby="login-title"
            >
              <h2 id="login-title" className={styles.title}>
                Create an account
              </h2>
              <p className={styles.subtitle}>
                Sign up and get 30 day free trial — then start managing
                students, assignments and meetings.
              </p>
              {err && <div className={styles.error}>{err}</div>}

              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input
                  type="text"
                  placeholder="Amélie Laurent"
                  className={styles.input}
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className={styles.input}
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className={styles.input}
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.row}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    alert("Forgot password flow not implemented yet")
                  }
                  className={styles.linkButton}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.primaryButton}
              >
                {loading ? "Submitting…" : "Submit"}
              </button>

              <div className={styles.orText}>Or continue with</div>

              <div className={styles.socialRow}>
                <button type="button" className={styles.socialButton}>
                  <svg
                    className={styles.socialIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    />
                  </svg>
                  Apple
                </button>

                <button type="button" className={styles.socialButton}>
                  <svg
                    className={styles.socialIcon}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
              </div>
              <p className={styles.smallText}>
                By signing in you agree to the portal terms.
              </p>
            </form>
          </div>

          {/* RIGHT: Image panel */}
          <div className={styles.hero}>
            <img
              src={heroImage}
              alt="Team collaboration"
              className={styles.heroImage}
            />

            <div className={styles.heroCard}>
              <div className={styles.heroCardTitle}>Daily Meeting</div>
              <div className={styles.heroCardTime}>12:00pm—1:00pm</div>
              <div className={styles.avatarRow}>
                <div className={styles.avatarBubble}>AB</div>
                <div className={styles.avatarBubble}>CD</div>
                <div className={styles.avatarBubble}>EF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
