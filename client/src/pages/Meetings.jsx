import React, { useContext, useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/api';
import layout from '../styles/PageLayout.module.css';
import styles from './Meetings.module.css';
import { AuthContext } from '../context/AuthContext';

export default function Meetings() {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    title: '',
    startsAt: '',
    durationMinutes: 30,
    meetingLink: '',
    agenda: '',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [studentsRes, meetingsRes] = await Promise.all([
          api.get('/students'),
          api.get('/meetings'),
        ]);

        if (cancelled) return;

        const userEmail = (user?.email || '').toLowerCase();
        const filteredStudents = (studentsRes.data || []).filter((s) => {
          if (user?.role === 'teacher' || user?.role === 'admin') return true;
          return (s.parentEmail || '').toLowerCase() === userEmail;
        });

        setStudents(filteredStudents);
        setMeetings(meetingsRes.data || []);
        setForm((prev) => ({
          ...prev,
          studentId: prev.studentId || filteredStudents[0]?._id || '',
        }));
      } catch (err) {
        console.error('Failed to load meetings data', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.role]);

  const upcomingMeetings = useMemo(() => {
    return [...meetings].sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  }, [meetings]);

  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }, []);

  async function createMeeting(e) {
    e.preventDefault();
    if (!form.studentId || !form.title.trim() || !form.startsAt) return;

    try {
      setSaving(true);
      const res = await api.post('/meetings', {
        studentId: form.studentId,
        title: form.title,
        startsAt: form.startsAt,
        durationMinutes: Number(form.durationMinutes),
        meetingLink: form.meetingLink,
        agenda: form.agenda,
      });

      setMeetings((prev) => [res.data, ...prev]);
      setForm((prev) => ({
        ...prev,
        title: '',
        startsAt: '',
        durationMinutes: 30,
        meetingLink: '',
        agenda: '',
      }));
    } catch (err) {
      console.error('Create meeting failed', err);
      alert(err?.response?.data?.error || 'Could not schedule meeting.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(meetingId, status) {
    try {
      const res = await api.patch(`/meetings/${meetingId}/status`, { status });
      setMeetings((prev) => prev.map((m) => (m._id === meetingId ? res.data : m)));
    } catch (err) {
      console.error('Update meeting status failed', err);
    }
  }

  return (
    <>
      <NavBar />
      <div className={layout.root}>
        <div className={layout.pageShell}>
          <header className={layout.pageHeader}>
            <div>
              <div className={layout.pageTitle}>Meetings</div>
              <div className={layout.pageSubtitle}>
                Schedule parent-teacher meetings without leaving the portal.
              </div>
            </div>
            <span className={layout.badge}>{user?.role || 'user'} view</span>
          </header>

          <main className={layout.pageBody}>
            <section className={layout.sectionCard}>
              <div className={layout.sectionTitle}>Schedule a meeting</div>
              <div className={layout.sectionHint}>Pick a student and set a time slot.</div>

              <form className={styles.formGrid} onSubmit={createMeeting}>
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  required
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} ({s.className})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Meeting title"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />

                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
                  min={minDateTime}
                  required
                />

                <input
                  type="number"
                  min="10"
                  max="180"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                  placeholder="Duration"
                />

                <input
                  type="url"
                  placeholder="Meeting link (optional)"
                  value={form.meetingLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
                />

                <textarea
                  placeholder="Agenda / notes (optional)"
                  value={form.agenda}
                  onChange={(e) => setForm((prev) => ({ ...prev, agenda: e.target.value }))}
                  rows={3}
                />

                <button type="submit" className={styles.primaryBtn} disabled={saving}>
                  {saving ? 'Scheduling…' : 'Schedule meeting'}
                </button>
              </form>
            </section>

            <section className={layout.sectionCard}>
              <div className={layout.sectionTitle}>Upcoming & past meetings</div>
              {loading ? (
                <p className={styles.empty}>Loading meetings…</p>
              ) : upcomingMeetings.length === 0 ? (
                <p className={styles.empty}>No meetings scheduled yet.</p>
              ) : (
                <div className={styles.list}>
                  {upcomingMeetings.map((m) => (
                    <div key={m._id} className={styles.card}>
                      <div>
                        <div className={styles.title}>{m.title}</div>
                        <div className={styles.meta}>
                          {m.student?.firstName} {m.student?.lastName} • {new Date(m.startsAt).toLocaleString()} • {m.durationMinutes} mins
                        </div>
                        {m.agenda ? <div className={styles.agenda}>{m.agenda}</div> : null}
                        {m.meetingLink ? (
                          <a className={styles.link} href={m.meetingLink} target="_blank" rel="noreferrer">
                            Join link
                          </a>
                        ) : null}
                      </div>

                      <div className={styles.actions}>
                        <span className={styles.status}>{m.status}</span>
                        {m.status !== 'completed' && (
                          <button onClick={() => updateStatus(m._id, 'completed')}>Mark complete</button>
                        )}
                        {m.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(m._id, 'cancelled')}>Cancel</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
