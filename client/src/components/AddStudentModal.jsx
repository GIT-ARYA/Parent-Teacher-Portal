// client/src/components/AddStudentModal.jsx
import React, { useState } from 'react';
import api from '../api/api';
import styles from './AddStudentModal.module.css';

export default function AddStudentModal({ open, onClose, onCreated }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [className, setClassName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!open) return null;

  const reset = () => {
    setFirstName('');
    setLastName('');
    setClassName('');
    setRollNumber('');
    setParentName('');
    setParentEmail('');
    setErr('');
  };

  const close = () => {
    if (saving) return;
    reset();
    onClose?.();
  };

  // simple seeded parent password generator (e.g. P-7G3K9Q2)
  const generateParentPassword = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = 'P-';
    for (let i = 0; i < 7; i += 1) {
      const idx = Math.floor(Math.random() * alphabet.length);
      out += alphabet[idx];
    }
    return out;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSaving(true);

    try {
      const parentPassword = generateParentPassword();

      const payload = {
        firstName,
        lastName,
        className,
        rollNumber,
        parentName,
        parentEmail,
        parentPassword,          // ✅ will be visible on student card / detail
      };

      const res = await api.post('/students', payload);
      onCreated?.(res.data);
      close();
    } catch (error) {
      setErr(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Could not create student'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={close}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerRow}>
          <div>
            <div className={styles.title}>Add student</div>
            <div className={styles.subtitle}>
              Create a new student record with class, roll and parent contact details.
            </div>
          </div>
          <div className={styles.pill}>New</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>First name</label>
              <input
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aarav"
                required
              />
            </div>

            <div>
              <label className={styles.label}>Last name</label>
              <input
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Kumar"
                required
              />
            </div>

            <div>
              <label className={styles.label}>Class</label>
              <input
                className={styles.input}
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="7A"
                required
              />
            </div>

            <div>
              <label className={styles.label}>Roll number</label>
              <input
                className={styles.input}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="12"
              />
            </div>

            <div className={styles.rowFull}>
              <label className={styles.label}>Parent / guardian name</label>
              <input
                className={styles.input}
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Mr. & Mrs. Kumar"
              />
            </div>

            <div className={styles.rowFull}>
              <label className={styles.label}>Parent email</label>
              <input
                type="email"
                className={styles.input}
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
              />
            </div>
          </div>

          {err && <div className={styles.error}>{err}</div>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={close}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Add student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
