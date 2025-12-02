// client/src/pages/Assignments.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import NavBar from '../components/NavBar';
import styles from './Assignments.module.css';

export default function Assignments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get('/students');
        if (!mounted) return;

        const out = [];
        (res.data || []).forEach((s) => {
          const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
          (s.assignments || []).forEach((a) => {
            out.push({
              id: a._id || `${s._id}-${a.title}`,
              title: a.title,
              subject: a.subject,
              uploadedAt: a.uploadedAt || a.createdAt || null,
              dueDate: a.dueDate || null,
              marksObtained:
                a.marksObtained !== undefined ? a.marksObtained : null,
              totalMarks: a.totalMarks !== undefined ? a.totalMarks : null,
              grade: a.grade || null,
              studentName: fullName,
              className: s.className,
              rollNumber: s.rollNumber,
            });
          });
        });

        // sort: latest uploaded first
        out.sort((a, b) => {
          const ta = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const tb = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return tb - ta;
        });

        setRows(out);
      } catch (e) {
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const fmtDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString();
  };

  const fmtMarks = (row) => {
    if (row.marksObtained == null && row.totalMarks == null && !row.grade) {
      return '—';
    }
    if (row.marksObtained != null && row.totalMarks != null) {
      return `${row.marksObtained}/${row.totalMarks}`;
    }
    if (row.grade) return row.grade;
    return '—';
  };

  return (
    <div className={styles.page}>
      <NavBar />
      <div className={styles.shell}>
        <div className={styles.headerRow}>
          <div className={styles.headerTitle}>Assignments</div>
          <p className={styles.headerSub}>
            Teachers and parents can see when an assignment was uploaded, its
            subject and the marks obtained by the student.
          </p>
        </div>

        <div className={styles.tableShell}>
          <div className={styles.tableHead}>
            <div className={styles.headCell}>Student</div>
            <div className={styles.headCell}>Assignment</div>
            <div className={`${styles.headCell} ${styles.hideSm}`}>Uploaded</div>
            <div className={`${styles.headCell} ${styles.hideXs}`}>Due</div>
            <div className={styles.headCell}>Marks</div>
          </div>

          {loading ? (
            <div className={styles.empty}>Loading assignments…</div>
          ) : rows.length === 0 ? (
            <div className={styles.empty}>
              No assignments yet. Create some from the student detail page.
            </div>
          ) : (
            <div className={styles.tableBody}>
              {rows.map((row) => (
                <div className={styles.tableRow} key={row.id}>
                  <div>
                    <div className={styles.cellPrimary}>{row.studentName}</div>
                    <div className={styles.cellSub}>
                      Class {row.className || '—'} · Roll{' '}
                      {row.rollNumber || '—'}
                    </div>
                  </div>

                  <div>
                    <div className={styles.cellPrimary}>{row.title}</div>
                    <div className={styles.cellSub}>{row.subject || '—'}</div>
                  </div>

                  <div className={`${styles.cell} ${styles.hideSm}`}>
                    {fmtDate(row.uploadedAt)}
                  </div>

                  <div className={`${styles.cell} ${styles.hideXs}`}>
                    {fmtDate(row.dueDate)}
                  </div>

                  <div className={styles.cell}>
                    <span
                      className={
                        row.marksObtained == null &&
                        row.totalMarks == null &&
                        !row.grade
                          ? styles.badgePending
                          : styles.badgeGraded
                      }
                    >
                      {fmtMarks(row)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
