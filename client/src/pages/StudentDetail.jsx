import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import NavBar from '../components/NavBar';
import styles from './StudentDetail.module.css';
import { AuthContext } from '../context/AuthContext';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [student, setStudent] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await api.get(`/students/${id}`);
        if (mounted) setStudent(res.data);
      } catch (e) {
        console.error(e);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  async function startMessage() {
    try {
      await api.post('/messages/send', {
        studentId: student._id,
        text: 'Hello',
      });
      navigate('/messages');
    } catch (e) {
      console.error(e);
      alert('Failed to start conversation');
    }
  }

  if (!student) {
    return (
      <div className={styles.shell}>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.card}>Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.card}>
          <header className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>
                {student.firstName} {student.lastName}
              </h1>
              <p className={styles.subtitle}>
                Class: {student.className} — Roll: {student.rollNumber}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/students')}
              className={styles.primaryBtn}
            >
              Back to students
            </button>
          </header>

          <div className={styles.quickRow}>
            <button className={styles.chip}>
              Schedule meeting
            </button>

            {user?.role === 'teacher' && (
              <button
                className={styles.chip}
                onClick={() => navigate('/assignments')}
              >
                Add assignment
              </button>
            )}

            {user?.role === 'teacher' && (
              <button className={styles.chip} onClick={startMessage}>
                Send message
              </button>
            )}
          </div>

          {/* Parent section (unchanged) */}
          <section className={styles.subPanel}>
            <h2 className={styles.subTitle}>Parent / Guardian</h2>

            <div className={styles.table}>
              <div className={styles.tableRow}>
                <span>Name</span>
                <span>{student.parentName}</span>
              </div>
              <div className={styles.tableRow}>
                <span>Email</span>
                <span>{student.parentEmail}</span>
              </div>
              <div className={styles.tableRow}>
                <span>Password</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {student.parentPassword}
                </span>
              </div>
            </div>
          </section>

          {/* ✅ ASSIGNMENTS (NEW, THEME-SAFE) */}
          <section className={styles.subPanel}>
            <h2 className={styles.subTitle}>Assignments</h2>

            {!student.assignmentProgress ||
            student.assignmentProgress.length === 0 ? (
              <div className={styles.empty}>
                No assignments assigned yet.
              </div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Assignment</span>
                  <span>Status</span>
                  <span>Marks</span>
                  <span>Max</span>
                </div>

                {student.assignmentProgress.map(ap => (
                  <div
                    key={ap.assignment._id}
                    className={styles.tableRow}
                  >
                    <span>{ap.assignment.title}</span>
                    <span>
                      {ap.status === 'completed'
                        ? 'Completed'
                        : 'Assigned'}
                    </span>
                    <span>
                      {ap.status === 'completed' ? ap.marks : '—'}
                    </span>
                    <span>{ap.assignment.maxMarks}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
