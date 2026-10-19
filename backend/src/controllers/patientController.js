const db = require('../config/db');

async function createPatient(req, res) {
  const { name, age, gender, medical_history = '' } = req.body;

  const result = await db.query(
    `INSERT INTO patients (created_by, name, age, gender, medical_history)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_by, name, age, gender, medical_history, created_at`,
    [req.user.id, name.trim(), age, gender.trim(), medical_history]
  );

  return res.status(201).json(result.rows[0]);
}

async function listPatients(req, res) {
  const result = await db.query(
    `SELECT id, created_by, name, age, gender, medical_history, created_at
     FROM patients
     WHERE created_by = $1
     ORDER BY id ASC`,
    [req.user.id]
  );

  return res.json(result.rows);
}

async function getPatient(req, res) {
  const result = await db.query(
    `SELECT id, created_by, name, age, gender, medical_history, created_at
     FROM patients
     WHERE id = $1 AND created_by = $2`,
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ detail: 'Patient not found.' });
  }

  return res.json(result.rows[0]);
}

async function updatePatient(req, res) {
  const { name, age, gender, medical_history } = req.body;

  const existing = await db.query(
    'SELECT id FROM patients WHERE id = $1 AND created_by = $2',
    [req.params.id, req.user.id]
  );

  if (existing.rows.length === 0) {
    return res.status(404).json({ detail: 'Patient not found.' });
  }

  const result = await db.query(
    `UPDATE patients
     SET name = $1, age = $2, gender = $3, medical_history = $4
     WHERE id = $5 AND created_by = $6
     RETURNING id, created_by, name, age, gender, medical_history, created_at`,
    [name.trim(), age, gender.trim(), medical_history ?? '', req.params.id, req.user.id]
  );

  return res.json(result.rows[0]);
}

async function deletePatient(req, res) {
  const result = await db.query(
    'DELETE FROM patients WHERE id = $1 AND created_by = $2 RETURNING id',
    [req.params.id, req.user.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ detail: 'Patient not found.' });
  }

  return res.status(204).send();
}

module.exports = {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
};
