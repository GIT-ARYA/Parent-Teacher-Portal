// client/src/pages/Students.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import StudentCard from "../components/StudentCard";
import AddStudentModal from "../components/AddStudentModal";
import NavBar from "../components/NavBar";
import layout from "../styles/PageLayout.module.css";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // track which student is deleting

  useEffect(() => {
    let mounted = true;
    api
      .get("/students")
      .then((res) => {
        if (!mounted) return;
        setStudents(res.data);
      })
      .catch(() => {
        // ignore
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = students.filter((s) => {
    if (!q) return true;
    const search = q.toLowerCase();
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(search) ||
      (s.className || "").toLowerCase().includes(search)
    );
  });

  const onCreated = (s) => {
    setStudents((prev) => [s, ...prev]);
  };

  const handleDelete = async (studentId) => {
  const ok = window.confirm('Delete this student? This action cannot be undone.');
  if (!ok) return;

  // copy in case we need to restore
  const prevList = students.slice();
  setDeletingId(studentId);
  // optimistic UI remove while we check server — we'll restore if everything fails
  setStudents(prev => prev.filter(s => s._id !== studentId));

  // helper to attempt one endpoint and return { ok, res, error }
  const tryEndpoint = async (method, url, config = {}) => {
    try {
      // show what we will call
      // eslint-disable-next-line no-console
      console.log(`[DELETE TRY] ${method.toUpperCase()} ${url}`, config);
      // use api.request so we can test POST or DELETE easily
      const r = await api.request({ method, url, ...config });
      return { ok: true, res: r };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`[DELETE FAIL] ${method.toUpperCase()} ${url}`, err?.response || err);
      return { ok: false, error: err };
    }
  };

  // list of candidate endpoints to try (in order). Adjust or remove ones that are irrelevant.
  // Common patterns:
  //  - DELETE /students/:id
  //  - DELETE /api/students/:id
  //  - POST   /students/:id/delete  (some backends use POST for destructive operations)
  //  - POST   /students/delete (body: { id }) 
  const candidates = [
    { method: 'delete', url: `/students/${studentId}` },
    { method: 'delete', url: `/api/students/${studentId}` },
    { method: 'post',   url: `/students/${studentId}/delete` },
    { method: 'post',   url: `/students/delete`, config: { data: { id: studentId } } },
  ];

  let succeeded = false;
  let lastError = null;

  for (const c of candidates) {
    const { method, url, config } = c;
    const result = await tryEndpoint(method, url, config || {});
    if (result.ok) {
      // check HTTP status too
      const status = result.res?.status;
      if (status >= 200 && status < 300) {
        // success: leave UI updated and break
        succeeded = true;
        // eslint-disable-next-line no-console
        console.log(`[DELETE OK] ${method.toUpperCase()} ${url} ->`, result.res.data);
        break;
      } else {
        lastError = result.error || new Error(`Unexpected status ${status}`);
      }
    } else {
      lastError = result.error;
    }
  }

  if (!succeeded) {
    // nothing worked — restore the list and show helpful info
    setStudents(prevList);
    // show message with server details if available
    const serverMsg =
      lastError?.response?.data?.error ||
      lastError?.response?.data?.message ||
      lastError?.message ||
      'Delete failed (no further details). Check backend routes and auth.';
    alert(`Failed to delete student: ${serverMsg}`);

    // open devtools network/console to inspect the failed requests
    // eslint-disable-next-line no-console
    console.error('Delete: lastError (full):', lastError);
  } else {
    // you may want to refresh counts, dashboard etc. Do it here if needed.
    // Example: re-fetch counts or emit an event
  }

  setDeletingId(null);
};
  return (
    <>
      <NavBar />
      <div className={layout.root}>
        <div className={layout.pageShell}>
          <header className={layout.pageHeader}>
            <div>
              <div className={layout.pageTitle}>Students</div>
              <p className={layout.pageSubtitle}>
                Manage student records, classes and performance.
              </p>
            </div>
            {/* Right side header actions if you want anything later */}
          </header>

          <main className={layout.pageBody}>
            {/* Search + Add */}
            <section className={layout.sectionCard}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div className={layout.sectionTitle}>Student list</div>
                  <div className={layout.sectionHint}>
                    Search by name or class.
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search students or class"
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      minWidth: "220px",
                    }}
                  />
                  <button
                    onClick={() => setModalOpen(true)}
                    className={layout.primaryHeaderButton}
                    type="button"
                  >
                    + Add student
                  </button>
                </div>
              </div>
            </section>

            {/* Students grid */}
            <section className={layout.sectionCard}>
              {loading ? (
                <div style={{ padding: "0.75rem" }}>Loading students…</div>
              ) : filtered.length === 0 ? (
                <div
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.9rem",
                    color: "#94a3b8",
                  }}
                >
                  No students found.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {filtered.map((s) => (
                    <StudentCard
                      key={s._id}
                      student={s}
                      onDelete={() => handleDelete(s._id)}
                      deleting={deletingId === s._id}
                    />
                  ))}
                </div>
              )}
            </section>

            <AddStudentModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              onCreated={onCreated}
            />
          </main>
        </div>
      </div>
    </>
  );
}
