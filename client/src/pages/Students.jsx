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
  const ok = window.confirm(
    "Delete this student? This action cannot be undone."
  );
  if (!ok) return;

  // keep old list so we can restore if it fails
  const previous = students;

  // optimistic remove
  setStudents((prev) => prev.filter((s) => s._id !== studentId));

  try {
    // this becomes DELETE /api/students/:id because baseURL = "/api"
    await api.delete(`/students/${studentId}`);
    // success → nothing else to do
  } catch (err) {
    // restore list
    setStudents(previous);

    const serverMsg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "Delete failed.";

    alert(`Failed to delete student: ${serverMsg}`);
    console.error("Delete error:", err);
  }
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
