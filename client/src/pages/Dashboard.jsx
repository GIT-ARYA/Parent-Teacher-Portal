// client/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import api from '../api/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    assignments: 0,
    meetings: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const [studentsRes, assignmentsRes] = await Promise.all([
          api.get('/students'),
          // if /assignments route doesn’t exist, this will just fall back to 0
          api.get('/assignments').catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        const studentsCount = Array.isArray(studentsRes.data)
          ? studentsRes.data.length
          : 0;

        const assignmentsCount = Array.isArray(assignmentsRes.data)
          ? assignmentsRes.data.length
          : 0;

        setStats({
          students: studentsCount,
          assignments: assignmentsCount,
          // meetings are a future feature – keep it simple for now
          meetings: 0,
          loading: false,
        });
      } catch (e) {
        if (!cancelled) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.dashboardShell}>
      <NavBar />

      <main className={styles.main}>
        {/* Top header / stats section – FULL WIDTH, not one big centered card */}
        <section className={styles.headerSection}>
          <div>
            <div className={styles.headerTitleRow}>
              <h1 className={styles.pageTitle}>Welcome back</h1>
              <span className={styles.rolePill}>Teacher view</span>
            </div>
            <p className={styles.headerSubtitle}>
              Overview of students & recent activity.
            </p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Students</div>
              <div className={styles.statValue}>
                {stats.loading ? '—' : stats.students}
              </div>
              <div className={styles.statHint}>Currently tracked</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Assignments</div>
              <div className={styles.statValue}>
                {stats.loading ? '—' : stats.assignments}
              </div>
              <div className={styles.statHint}>Created this term</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statLabel}>Meetings</div>
              <div className={styles.statValue}>
                {stats.loading ? '—' : stats.meetings}
              </div>
              <div className={styles.statHint}>Scheduled this week</div>
            </div>

            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => navigate('/messages')}
            >
              Open inbox
            </button>
          </div>
        </section>

        {/* Quick access section */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Quick access</h2>
              <p className={styles.panelSubtitle}>
                Jump straight into the most used areas.
              </p>
            </div>
          </div>

          <div className={styles.quickActions}>
            <button
              type="button"
              className={styles.chipButton}
              onClick={() => navigate('/students')}
            >
              View students
            </button>
            <button
              type="button"
              className={styles.chipButton}
              onClick={() => navigate('/messages')}
            >
              Open messages
            </button>
            <button
              type="button"
              className={styles.chipButtonGhost}
              onClick={() => alert('Meeting scheduler coming soon')}
            >
              Schedule meeting
            </button>
          </div>
        </section>

        {/* Optional “Activity” stub – safe to extend later */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Recent activity</h2>
              <p className={styles.panelSubtitle}>
                Latest changes in students and assignments.
              </p>
            </div>
          </div>
          <div className={styles.emptyState}>
            <p>No activity feed yet. You can add this later from the API.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
