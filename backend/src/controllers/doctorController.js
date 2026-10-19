const db = require('../config/db');

async function createDoctor(req, res) {
  const { name, specialization, email, phone = '' } = req.body;

  const result = await db.query(
    `INSERT INTO doctors (name, specialization, email, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, specialization, email, phone, created_at`,
    [name.trim(), specialization.trim(), email.toLowerCase(), phone]
  );

  return res.status(201).json(result.rows[0]);
}

async function listDoctors(req, res) {
  const result = await db.query(
    `SELECT id, name, specialization, email, phone, created_at
     FROM doctors
     ORDER BY id ASC`
  );

  return res.json(result.rows);
}

async function getDoctor(req, res) {
  const result = await db.query(
    `SELECT id, name, specialization, email, phone, created_at
     FROM doctors
     WHERE id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ detail: 'Doctor not found.' });
  }

  return res.json(result.rows[0]);
}

async function updateDoctor(req, res) {
  const { name, specialization, email, phone } = req.body;

  const existing = await db.query('SELECT id FROM doctors WHERE id = $1', [req.params.id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ detail: 'Doctor not found.' });
  }

  const result = await db.query(
    `UPDATE doctors
     SET name = $1, specialization = $2, email = $3, phone = $4
     WHERE id = $5
     RETURNING id, name, specialization, email, phone, created_at`,
    [name.trim(), specialization.trim(), email.toLowerCase(), phone ?? '', req.params.id]
  );

  return res.json(result.rows[0]);
}

async function deleteDoctor(req, res) {
  const result = await db.query(
    'DELETE FROM doctors WHERE id = $1 RETURNING id',
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ detail: 'Doctor not found.' });
  }

  return res.status(204).send();
}

module.exports = {
  createDoctor,
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
};
