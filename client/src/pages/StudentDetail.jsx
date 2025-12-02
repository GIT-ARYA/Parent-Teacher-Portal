// client/src/pages/StudentDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import NavBar from '../components/NavBar';
import styles from './StudentDetail.module.css';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    api
      .get(`/students/${id}`)
      .then((r) => mounted && setStudent(r.data))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!student) {
    return (
      <div className={styles.shell}>
        <NavBar />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.empty}>Loading…</div>
          </div>
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

          {/* quick actions */}
          <div className={styles.quickRow}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => alert('Meeting scheduler coming soon')}
            >
              Schedule meeting
            </button>
            <button
              type="button"
              className={styles.chip}
              onClick={() => navigate('/messages')}
            >
              Send message
            </button>
          </div>

          {/* Assignments */}
          <section className={styles.subPanel}>
            <h2 className={styles.subTitle}>Assignments</h2>
            <p className={styles.subHint}>Work assigned and progress.</p>

            {student.assignments?.length ? (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Title</span>
                  <span>Subject</span>
                  <span>Due</span>
                  <span>Grade</span>
                </div>
                {student.assignments.map((a) => (
                  <div key={a._id} className={styles.tableRow}>
                    <span>
                      {a.title}{' '}
                      <span className={styles.muted}>({a.subject})</span>
                    </span>
                    <span>{a.subject}</span>
                    <span>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : '—'}
                    </span>
                    <span className={styles.muted}>Pending</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>No assignments.</div>
            )}
          </section>

          {/* Behaviour notes */}
          <section className={styles.subPanel}>
            <h2 className={styles.subTitle}>Behaviour notes</h2>
            <p className={styles.subHint}>Observations shared by teachers.</p>

            {student.behaviourNotes?.length ? (
              <div className={styles.notesList}>
                {student.behaviourNotes.map((b, i) => (
                  <div key={i} className={styles.noteCard}>
                    <div className={styles.noteBody}>{b.note}</div>
                    <div className={styles.noteMeta}>
                      {b.tag}{' '}
                      {b.date && (
                        <> — {new Date(b.date).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>No behaviour notes.</div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
