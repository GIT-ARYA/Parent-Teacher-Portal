// client/src/pages/Messages.jsx
import React from 'react';
import NavBar from '../components/NavBar';
import styles from './Messages.module.css';

export default function Messages() {
  return (
    <div className={styles.shell}>
      <NavBar />
      <main className={styles.main}>
        <section className={styles.card}>
          <header className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Messages</h1>
              <p className={styles.subtitle}>
                Communication between teachers and parents (UI ready, backend can
                be wired next).
              </p>
            </div>
          </header>

          <div className={styles.grid}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Threads</h2>
              <p className={styles.infoText}>
                No threads yet — once you connect this to the <code>/messages</code>{' '}
                API, recent conversations can appear here.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>New message</h2>
              <p className={styles.infoText}>
                You can add a modal that lets you pick a student / guardian and
                send them a message.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h2 className={styles.infoTitle}>Realtime chat</h2>
              <p className={styles.infoText}>
                If you want live messaging, you can later integrate Socket.IO or
                a service like Pusher on top of this layout.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
