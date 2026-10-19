const db = require('../config/db');

async function assertOwnedPatient(patientId, userId) {
  const result = await db.query(
    'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
    [patientId, userId]
  );
  return result.rows[0] || null;
}

async function createMapping(req, res) {
  const { patient_id, doctor_id } = req.body;

  const patient = await assertOwnedPatient(patient_id, req.user.id);
  if (!patient) {
    return res.status(404).json({ detail: 'Patient not found.' });
  }

  const doctor = await db.query('SELECT id FROM doctors WHERE id = $1', [doctor_id]);
  if (doctor.rows.length === 0) {
    return res.status(404).json({ detail: 'Doctor not found.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO patient_doctor_mappings (patient_id, doctor_id)
       VALUES ($1, $2)
       RETURNING id, patient_id, doctor_id, created_at`,
      [patient_id, doctor_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ detail: 'This doctor is already assigned to the patient.' });
    }
    throw err;
  }
}

async function listMappings(req, res) {
  const result = await db.query(
    `SELECT m.id, m.patient_id, m.doctor_id, m.created_at
     FROM patient_doctor_mappings m
     INNER JOIN patients p ON p.id = m.patient_id
     WHERE p.created_by = $1
     ORDER BY m.id ASC`,
    [req.user.id]
  );

  return res.json(result.rows);
}

async function getDoctorsForPatient(req, res) {
  const patientId = req.params.patient_id;

  const patient = await assertOwnedPatient(patientId, req.user.id);
  if (!patient) {
    return res.status(404).json({ detail: 'Patient not found.' });
  }

  const result = await db.query(
    `SELECT d.id, d.name, d.specialization, d.email, d.phone, d.created_at, m.id AS mapping_id
     FROM patient_doctor_mappings m
     INNER JOIN doctors d ON d.id = m.doctor_id
     WHERE m.patient_id = $1
     ORDER BY d.id ASC`,
    [patientId]
  );

  return res.json(result.rows);
}

async function deleteMapping(req, res) {
  const result = await db.query(
    `DELETE FROM patient_doctor_mappings m
     USING patients p
     WHERE m.id = $1
       AND m.patient_id = p.id
       AND p.created_by = $2
     RETURNING m.id`,
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ detail: 'Mapping not found.' });
  }

  return res.status(204).send();
}

module.exports = {
  createMapping,
  listMappings,
  getDoctorsForPatient,
  deleteMapping,
};
