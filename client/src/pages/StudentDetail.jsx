// client/src/pages/StudentDetail.jsx
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
        if (mounted) {
          setStudent(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();
    return () => {
      mounted = false;
    };
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
            <button
              type="button"
              className={styles.chip}
              onClick={() => alert('Meeting scheduler coming soon')}
            >
              Schedule meeting
            </button>

            {user?.role === 'teacher' && (
              <button
                type="button"
                className={styles.chip}
                onClick={startMessage}
              >
                Send message
              </button>
            )}
          </div>

          {/* Parent section unchanged */}
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
                <span>Parent password</span>
                <span style={{ fontFamily: 'monospace' }}>
                  {student.parentPassword}
                </span>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
