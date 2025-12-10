// client/src/components/StudentCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StudentCard.module.css';

export default function StudentCard({ student, onDelete }) {
  const navigate = useNavigate();

  if (!student) return null;

  const initials = `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
  const assignmentsCount = student.assignments?.length || 0;

  // If you later compute real performance, plug it in here.
  const performance = 0;

  const openDetail = () => {
    navigate(`/students/${student._id}`);
  };

  const hasParentInfo =
    student.parentName || student.parentEmail || student.parentPassword;

  return (
    <article className={styles.card}>
      <div className={styles.rowTop}>
        <div className={styles.left}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.nameBlock}>
            <div className={styles.name}>
              {student.firstName} {student.lastName}
            </div>
            <div className={styles.meta}>
              Class {student.className} • Roll {student.rollNumber}
            </div>

            {hasParentInfo && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginTop: '0.15rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '190px',
                }}
              >
                Parent: {student.parentName || '—'} · {student.parentEmail || '—'}
                {student.parentPassword && (
                  <>
                    {' '}· PW:{' '}
                    <span style={{ fontFamily: 'monospace' }}>
                      {student.parentPassword}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.assignLabel}>Assignments</div>
          <div className={styles.assignCount}>{assignmentsCount}</div>
        </div>
      </div>

      <div className={styles.rowBottom}>
        <div className={styles.perfBlock}>
          <div className={styles.perfLabel}>Performance</div>
          <div className={styles.progressRow}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${performance}%` }}
              />
            </div>
            <span className={styles.perfValue}>{performance}%</span>
          </div>
        </div>

        <div className={styles.actionGroup}>
          <button
            type="button"
            onClick={openDetail}
            className={styles.viewButton}
          >
            View
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete();
            }}
            className={styles.deleteButton}
            title="Remove student"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
