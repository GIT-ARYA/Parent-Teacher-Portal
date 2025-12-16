import React, { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import NavBar from '../components/NavBar';
import styles from './Assignments.module.css';
import { AuthContext } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useContext(AuthContext);

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    maxMarks: '',
  });

  const [assignAll, setAssignAll] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    fetchAssignments();
    fetchStudents();
  }, []);

  async function fetchAssignments() {
    const res = await api.get('/assignments');
    setAssignments(res.data);
  }

  async function fetchStudents() {
    const res = await api.get('/students');
    setStudents(res.data);
  }

  function toggleStudent(id) {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  }

  async function createAssignment() {
    const studentIds = assignAll
      ? students.map(s => s._id)
      : selectedStudents;

    await api.post('/assignments', {
      ...form,
      studentIds,
    });

    setShowModal(false);
    setStep(1);
    setAssignAll(false);
    setSelectedStudents([]);
    setForm({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      maxMarks: '',
    });

    fetchAssignments();
  }

  async function deleteAssignment(id) {
    await api.delete(`/assignments/${id}`);
    fetchAssignments();
  }

  return (
    <div className={styles.shell}>
      <NavBar />

      <main className={styles.main}>
        <section className={styles.card}>
          <h1 className={styles.title}>Assignments</h1>
          <p className={styles.subtitle}>
            Teachers and parents can see assignment details and marks.
          </p>

          {user?.role === 'teacher' && (
            <button
              className={styles.primaryBtn}
              onClick={() => setShowModal(true)}
            >
              Create assignment
            </button>
          )}

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment</th>
                <th>Uploaded</th>
                <th>Due</th>
                <th>Marks</th>
                {user?.role === 'teacher' && <th />}
              </tr>
            </thead>

            <tbody>
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="6" className={styles.empty}>
                    No assignments yet.
                  </td>
                </tr>
              )}

              {assignments.map(a => (
                <tr key={a._id}>
                  <td>
                    {a.assignedTo.length === students.length
                      ? 'All Students'
                      : a.assignedTo
                          .map(s => `${s.firstName} ${s.lastName}`)
                          .join(', ')}
                  </td>
                  <td>{a.title}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td>—</td>

                  {user?.role === 'teacher' && (
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteAssignment(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            {step === 1 && (
              <>
                <div className={styles.headerRow}>
                  <div>
                    <div className={styles.modalTitle}>Assignment details</div>
                    <div className={styles.modalSubtitle}>
                      Create a new assignment with subject, description and marks.
                    </div>
                  </div>
                  <div className={styles.pill}>New</div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.rowFull}>
                    <label className={styles.label}>Title</label>
                    <input
                      className={styles.input}
                      value={form.title}
                      onChange={e =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.rowFull}>
                    <label className={styles.label}>Subject</label>
                    <input
                      className={styles.input}
                      value={form.subject}
                      onChange={e =>
                        setForm({ ...form, subject: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.rowFull}>
                    <label className={styles.label}>Description</label>
                    <textarea
                      className={styles.textarea}
                      value={form.description}
                      onChange={e =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Due date</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={form.dueDate}
                      onChange={e =>
                        setForm({ ...form, dueDate: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Max marks</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={form.maxMarks}
                      onChange={e =>
                        setForm({ ...form, maxMarks: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.headerRow}>
                  <div>
                    <div className={styles.modalTitle}>Assign to students</div>
                    <div className={styles.modalSubtitle}>
                      Choose which students receive this assignment.
                    </div>
                  </div>
                </div>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={assignAll}
                    onChange={e => setAssignAll(e.target.checked)}
                  />
                  Assign to all students
                </label>

                {!assignAll &&
                  students.map(s => (
                    <label key={s._id} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s._id)}
                        onChange={() => toggleStudent(s._id)}
                      />
                      {s.firstName} {s.lastName}
                    </label>
                  ))}

                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className={styles.primaryBtn}
                    onClick={createAssignment}
                  >
                    Assign
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
