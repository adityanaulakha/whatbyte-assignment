import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const emptyForm = { name: '', age: '', gender: '', medical_history: '' };

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.listPatients();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (patient) => {
    setEditing(patient);
    setForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      medical_history: patient.medical_history || '',
    });
    setModalOpen(true);
  };

  const viewDetail = async (id) => {
    setError('');
    try {
      const data = await api.getPatient(id);
      setDetail(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const payload = {
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      medical_history: form.medical_history,
    };
    try {
      if (editing) {
        await api.updatePatient(editing.id, payload);
        setMessage('Patient updated.');
      } else {
        await api.createPatient(payload);
        setMessage('Patient added.');
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this patient?')) return;
    setError('');
    setMessage('');
    try {
      await api.deletePatient(id);
      setMessage('Patient deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Records you created — view, update, or remove them.</p>
        </div>
        <button type="button" className="btn" onClick={openCreate}>
          Add patient
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-ok">{message}</div> : null}

      <div className="panel">
        {loading ? (
          <div className="empty">Loading patients…</div>
        ) : patients.length === 0 ? (
          <div className="empty">No patients yet. Add your first record.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>History</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.age}</td>
                    <td>{p.gender}</td>
                    <td>{p.medical_history || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => viewDetail(p.id)}>
                          View
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(p.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen ? (
        <Modal title={editing ? 'Update patient' : 'Add patient'} onClose={() => setModalOpen(false)}>
          <form onSubmit={onSubmit} className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <div className="form-grid two">
              <label>
                Age
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  required
                />
              </label>
              <label>
                Gender
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <label>
              Medical history
              <textarea
                value={form.medical_history}
                onChange={(e) => setForm({ ...form, medical_history: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {detail ? (
        <Modal title="Patient details" onClose={() => setDetail(null)}>
          <div className="form-grid">
            <div>
              <strong>{detail.name}</strong> <span className="pill">#{detail.id}</span>
            </div>
            <div>Age: {detail.age}</div>
            <div>Gender: {detail.gender}</div>
            <div>Medical history: {detail.medical_history || '—'}</div>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
