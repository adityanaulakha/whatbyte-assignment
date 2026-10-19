import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';

const emptyForm = { name: '', specialization: '', email: '', phone: '' };

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
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
      const data = await api.listDoctors();
      setDoctors(data);
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

  const openEdit = (doctor) => {
    setEditing(doctor);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone || '',
    });
    setModalOpen(true);
  };

  const viewDetail = async (id) => {
    setError('');
    try {
      const data = await api.getDoctor(id);
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
    try {
      if (editing) {
        await api.updateDoctor(editing.id, form);
        setMessage('Doctor updated.');
      } else {
        await api.createDoctor(form);
        setMessage('Doctor added.');
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
    if (!window.confirm('Delete this doctor?')) return;
    setError('');
    setMessage('');
    try {
      await api.deleteDoctor(id);
      setMessage('Doctor deleted.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p>Directory of all doctors — add, edit, or remove entries.</p>
        </div>
        <button type="button" className="btn" onClick={openCreate}>
          Add doctor
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-ok">{message}</div> : null}

      <div className="panel">
        {loading ? (
          <div className="empty">Loading doctors…</div>
        ) : doctors.length === 0 ? (
          <div className="empty">No doctors yet. Add your first doctor.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.name}</td>
                    <td>{d.specialization}</td>
                    <td>{d.email}</td>
                    <td>{d.phone || '—'}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => viewDetail(d.id)}>
                          View
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(d.id)}>
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
        <Modal title={editing ? 'Update doctor' : 'Add doctor'} onClose={() => setModalOpen(false)}>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form onSubmit={onSubmit} className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label>
              Specialization
              <input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
        <Modal title="Doctor details" onClose={() => setDetail(null)}>
          <div className="form-grid">
            <div>
              <strong>{detail.name}</strong> <span className="pill">#{detail.id}</span>
            </div>
            <div>Specialization: {detail.specialization}</div>
            <div>Email: {detail.email}</div>
            <div>Phone: {detail.phone || '—'}</div>
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
