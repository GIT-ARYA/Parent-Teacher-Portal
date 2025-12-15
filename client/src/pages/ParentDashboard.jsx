// client/src/pages/ParentDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/api';
import layout from '../styles/PageLayout.module.css';
import { AuthContext } from '../context/AuthContext';

export default function ParentDashboard() {
  const { user } = useContext(AuthContext);

  const [children, setChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadChildren() {
      try {
        const res = await api.get('/students');
        if (cancelled) return;

        setChildren(res.data || []);
        setActiveChild(res.data?.[0] || null);
      } catch (e) {
        console.error('Failed to load children', e);
        setChildren([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (user) {
      loadChildren();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user]);

  const titleName = user?.name || 'there';

  return (
    <>
      <NavBar />
      <div className={layout.root}>
        <div className={layout.pageShell}>
          <header className={layout.pageHeader}>
            <div>
              <div className={layout.pageTitle}>
                Welcome, {titleName}
              </div>
              <p className={layout.pageSubtitle}>
                View your {children.length === 1 ? 'child' : 'children'}’s
                progress, assignments and behaviour.
              </p>
            </div>
            <span className={layout.rolePill}>Parent view</span>
          </header>

          <main className={layout.pageBody}>
            <section className={layout.sectionCard}>
              {loading ? (
                <div style={{ padding: '0.75rem', color: '#475569' }}>
                  Loading…
                </div>
              ) : children.length === 0 ? (
                <div style={{ padding: '0.75rem', color: '#94a3b8' }}>
                  No linked student records found.
                </div>
              ) : (
                <>
                  {children.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      {children.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => setActiveChild(c)}
                          style={{
                            padding: '0.4rem 0.9rem',
                            borderRadius: '999px',
                            border:
                              activeChild?._id === c._id
                                ? '1px solid #0f172a'
                                : '1px solid rgba(148,163,184,0.4)',
                            background:
                              activeChild?._id === c._id
                                ? '#0f172a'
                                : 'white',
                            color:
                              activeChild?._id === c._id
                                ? 'white'
                                : '#0f172a',
                          }}
                        >
                          {c.firstName}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeChild && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>
                        <div
  style={{
    fontWeight: 600,
    color: '#0f172a', // slate-900 (used elsewhere)
    fontSize: '1rem',
  }}
>
  {activeChild.firstName} {activeChild.lastName}
</div>

                      </strong>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Class {activeChild.className} · Roll {activeChild.rollNumber}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
