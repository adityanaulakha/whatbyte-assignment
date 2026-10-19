import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export default function Mappings() {
  const [mappings, setMappings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [viewPatientId, setViewPatientId] = useState('');
  const [assignedDoctors, setAssignedDoctors] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [maps, pats, docs] = await Promise.all([
        api.listMappings(),
        api.listPatients(),
        api.listDoctors(),
      ]);
      setMappings(maps);
      setPatients(pats);
      setDoctors(docs);
      setPatientId((current) => current || (pats[0] ? String(pats[0].id) : ''));
      setDoctorId((current) => current || (docs[0] ? String(docs[0].id) : ''));
      setViewPatientId((current) => current || (pats[0] ? String(pats[0].id) : ''));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patientName = (id) => patients.find((p) => p.id === id)?.name || `#${id}`;
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || `#${id}`;

  const onAssign = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.createMapping({
        patient_id: Number(patientId),
        doctor_id: Number(doctorId),
      });
      setMessage('Doctor assigned to patient.');
      await load();
      if (viewPatientId === patientId) {
        const docs = await api.getDoctorsForPatient(patientId);
        setAssignedDoctors(docs);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadAssigned = async () => {
    if (!viewPatientId) return;
    setError('');
    try {
      const docs = await api.getDoctorsForPatient(viewPatientId);
      setAssignedDoctors(docs);
    } catch (err) {
      setError(err.message);
      setAssignedDoctors([]);
    }
  };

  useEffect(() => {
    if (viewPatientId) loadAssigned();
  }, [viewPatientId]);

  const onDelete = async (id) => {
    if (!window.confirm('Remove this assignment?')) return;
    setError('');
    setMessage('');
    try {
      await api.deleteMapping(id);
      setMessage('Mapping removed.');
      await load();
      if (viewPatientId) await loadAssigned();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Mappings</h1>
          <p>Assign doctors to your patients and review assignments.</p>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-ok">{message}</div> : null}

      <div className="panel">
        <div className="toolbar">
          <strong>Assign a doctor</strong>
        </div>
        <form onSubmit={onAssign} className="form-grid two">
          <label>
            Patient
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (#{p.id})
                </option>
              ))}
            </select>
          </label>
          <label>
            Doctor
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </label>
          <div>
            <button type="submit" className="btn" disabled={saving || !patients.length || !doctors.length}>
              {saving ? 'Assigning…' : 'Assign doctor'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="toolbar">
          <strong>All mappings</strong>
        </div>
        {loading ? (
          <div className="empty">Loading mappings…</div>
        ) : mappings.length === 0 ? (
          <div className="empty">No mappings yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>
                      {patientName(m.patient_id)} <span className="pill">#{m.patient_id}</span>
                    </td>
                    <td>
                      {doctorName(m.doctor_id)} <span className="pill">#{m.doctor_id}</span>
                    </td>
                    <td>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(m.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="toolbar">
          <strong>Doctors for a patient</strong>
        </div>
        <div className="form-grid two">
          <label>
            Patient
            <select value={viewPatientId} onChange={(e) => setViewPatientId(e.target.value)}>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (#{p.id})
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button type="button" className="btn btn-ghost" onClick={loadAssigned} disabled={!viewPatientId}>
              Refresh
            </button>
          </div>
        </div>
        {!viewPatientId ? (
          <div className="empty">Choose a patient to see assigned doctors.</div>
        ) : assignedDoctors.length === 0 ? (
          <div className="empty">No doctors assigned to this patient.</div>
        ) : (
          <div className="table-wrap" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Mapping ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedDoctors.map((d) => (
                  <tr key={d.mapping_id || d.id}>
                    <td>{d.name}</td>
                    <td>{d.specialization}</td>
                    <td>{d.email}</td>
                    <td>{d.mapping_id}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(d.mapping_id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
