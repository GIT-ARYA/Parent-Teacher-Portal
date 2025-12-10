// client/src/pages/ParentDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../api/api';
import layout from '../styles/PageLayout.module.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ParentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadChildren() {
      try {
        const res = await api.get('/students');
        if (cancelled) return;

        const email = (user?.email || '').toLowerCase();

        // 🔗 Match by parentEmail on the student record
        const filtered = res.data.filter(
          (s) => (s.parentEmail || '').toLowerCase() === email
        );

        setChildren(filtered);
      } catch (e) {
        console.error('Failed to load children', e);
        setChildren([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (user && user.email) {
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
          {/* Header */}
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

            <span className={layout.rolePill}>
              Parent view
            </span>
          </header>

          {/* Body */}
          <main className={layout.pageBody}>
            {/* Child section */}
            <section className={layout.sectionCard}>
              <div className={layout.sectionHeaderRow}>
                <div>
                  <div className={layout.sectionTitle}>
                    {children.length === 1 ? 'Your child' : 'Your children'}
                  </div>
                  <div className={layout.sectionHint}>
                    Overview of their current class and assignments.
                  </div>
                </div>
              </div>

              {loading ? (
                <div
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    color: '#475569', // slate-600, visible on white
                  }}
                >
                  Loading…
                </div>
              ) : children.length === 0 ? (
                <div
                  style={{
                    padding: '0.75rem',
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                  }}
                >
                  No linked student records found for this parent account.
                  Ask the class teacher to check your email in the system.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  {children.map((c) => (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => navigate(`/students/${c._id}`)}
                      style={{
                        textAlign: 'left',
                        borderRadius: '16px',
                        padding: '0.9rem 1rem',
                        border: '1px solid rgba(148,163,184,0.3)',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
                        boxShadow: '0 10px 25px rgba(15,23,42,0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '999px',
                            background:
                              'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                          }}
                        >
                          {c.firstName?.[0]}
                          {c.lastName?.[0]}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: '#0f172a',
                            }}
                          >
                            {c.firstName} {c.lastName}
                          </div>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              marginTop: '0.1rem',
                            }}
                          >
                            Class {c.className} · Roll {c.rollNumber}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748b',
                          marginTop: '0.6rem',
                        }}
                      >
                        Assignments: {c.assignments?.length || 0} · Behaviour
                        notes: {c.behaviourNotes?.length || 0}
                      </div>
                    </button>
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
