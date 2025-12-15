import React, { useEffect, useState, useContext, useRef } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/api';
import styles from './Messages.module.css';
import { AuthContext } from '../context/AuthContext';

export default function Messages() {
  const { user } = useContext(AuthContext);

  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/messages');
        setThreads(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedThread]);

  async function sendMessage() {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      const res = await api.post('/messages/send', {
        studentId: selectedThread.student._id,
        text: newMessage,
      });

      setSelectedThread(res.data);
      setThreads((prev) =>
        prev.map((t) =>
          t._id === res.data._id ? res.data : t
        )
      );
      setNewMessage('');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <NavBar />

      <div className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.shell}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <h2>Messages</h2>
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
                        {t.student.firstName[0]}
                        {t.student.lastName[0]}
                      </div>
                      <div className={styles.threadMeta}>
                        <div className={styles.threadName}>
                          {t.student.firstName} {t.student.lastName}
                        </div>
                        <div className={styles.threadSub}>
                          Class {t.student.className}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            {/* CHAT */}
            <section className={styles.conversation}>
              {!selectedThread ? (
                <div className={styles.emptyState}>
                  <h3>Select a student</h3>
                  <p>Choose a conversation to start messaging.</p>
                </div>
              ) : (
                <>
                  <div className={styles.conversationHeader}>
                    <h3>
                      {selectedThread.student.firstName}{' '}
                      {selectedThread.student.lastName}
                    </h3>
                    <p>Class {selectedThread.student.className}</p>
                  </div>

                  <div className={styles.messageArea}>
                    {selectedThread.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`${styles.messageBubble} ${
                          m.senderRole === user.role
                            ? styles.own
                            : styles.other
                        }`}
                      >
                        {m.text}
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  <div className={styles.inputBar}>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && sendMessage()
                      }
                      placeholder="Type a message…"
                    />
                    <button onClick={sendMessage}>Send</button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
