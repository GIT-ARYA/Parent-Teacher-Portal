import React, { useEffect, useState, useContext } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/api';
import styles from './Messages.module.css';
import { AuthContext } from '../context/AuthContext';

export default function Messages() {
  const { user } = useContext(AuthContext);

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadThreads() {
      try {
        const res = await api.get('/messages');
        if (!cancelled) setThreads(res.data || []);
      } catch (e) {
        console.error('Failed to load threads', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadThreads();
    return () => (cancelled = true);
  }, []);

  return (
  <>
    <NavBar />

    <div className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.shell}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Messages</h2>
              <p>Parents & teachers</p>
            </div>

            {loading ? (
              <div className={styles.sidebarHint}>Loading…</div>
            ) : threads.length === 0 ? (
              <div className={styles.sidebarHint}>
                No conversations yet.
              </div>
            ) : (
              <div className={styles.threadList}>
                {threads.map((t) => (
                  <button
                    key={t._id}
                    className={`${styles.threadItem} ${
                      selectedThread?._id === t._id ? styles.active : ''
                    }`}
                    onClick={() => setSelectedThread(t)}
                  >
                    <div className={styles.avatar}>
                      {t.student?.firstName?.[0]}
                      {t.student?.lastName?.[0]}
                    </div>

                    <div className={styles.threadMeta}>
                      <div className={styles.threadName}>
                        {t.student?.firstName} {t.student?.lastName}
                      </div>
                      <div className={styles.threadSub}>
                        Class {t.student?.className}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Conversation */}
          <section className={styles.conversation}>
            {!selectedThread ? (
              <div className={styles.emptyState}>
                <h3>Select a conversation</h3>
                <p>Choose a student thread to view messages.</p>
              </div>
            ) : (
              <div className={styles.conversationHeader}>
                <h3>
                  {selectedThread.student?.firstName}{' '}
                  {selectedThread.student?.lastName}
                </h3>
                <p>
                  Class {selectedThread.student?.className} · Roll{' '}
                  {selectedThread.student?.rollNumber}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  </>
);
}