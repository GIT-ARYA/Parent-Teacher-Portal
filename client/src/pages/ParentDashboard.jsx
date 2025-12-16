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

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className={layout.primaryBtn}
                onClick={() => navigate('/messages')}
              >
                Messages
              </button>

              <span className={layout.rolePill}>
                Parent view
              </span>
            </div>
          </header>

          <main className={layout.pageBody}>
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
                <div style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                  Loading…
                </div>
              ) : children.length === 0 ? (
                <div style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                  No linked student records found.
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
                      <div style={{ fontWeight: 600 }}>
                        {c.firstName} {c.lastName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Assignments: {c.assignments?.length || 0}
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
