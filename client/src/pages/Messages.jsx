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
  async function clearChat() {
  if (!selectedThread) return;

  const ok = window.confirm('Clear all messages in this chat?');
  if (!ok) return;

  try {
    await api.delete(`/messages/${selectedThread._id}/clear`);

    // update UI
    setSelectedThread({
      ...selectedThread,
      messages: [],
    });

    setThreads(prev =>
      prev.map(t =>
        t._id === selectedThread._id
          ? { ...t, messages: [] }
          : t
      )
    );
  } catch (e) {
    console.error(e);
    alert('Failed to clear chat');
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
                  {threads.map((t) => {
                    const displayName =
                      user.role === 'parent'
                        ? t.teacherName || 'Teacher'
                        : `${t.student.firstName} ${t.student.lastName}`;

                    return (
                      <button
                        key={t._id}
                        className={`${styles.threadItem} ${
                          selectedThread?._id === t._id ? styles.active : ''
                        }`}
                        onClick={() => setSelectedThread(t)}
                      >
                        <div className={styles.avatar}>
                          {displayName?.[0]}
                        </div>
                        <div className={styles.threadMeta}>
                          <div className={styles.threadName}>
                            {displayName}
                          </div>
                          {user.role === 'teacher' && (
                            <div className={styles.threadSub}>
                              Class {t.student.className}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            {/* CHAT */}
            <section className={styles.conversation}>
              {!selectedThread ? (
                <div className={styles.emptyState}>
                  <h3>Select a conversation</h3>
                  <p>Choose a chat to start messaging.</p>
                </div>
              ) : (
                <>
                  <div className={styles.conversationHeader}>
  <div>
    <h3>
      {user.role === 'parent'
        ? selectedThread.teacherName || 'Teacher'
        : `${selectedThread.student.firstName} ${selectedThread.student.lastName}`}
    </h3>
    {user.role === 'teacher' && (
      <p>Class {selectedThread.student.className}</p>
    )}
  </div>

  {/* ✅ NEW: Clear chat */}
  <button
    onClick={clearChat}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#b45309', // amber-ish, fits theme
      fontWeight: 600,
      cursor: 'pointer',
    }}
  >
    Clear chat
  </button>
</div>


                  <div className={styles.messageArea}>
                    {/* ✅ ONLY CHANGE: hide auto "Hello" message */}
                    {selectedThread.messages
                      .filter((m, i) => !(i === 0 && m.text === 'Hello'))
                      .map((m, i) => (
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
