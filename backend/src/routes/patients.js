const express = require('express');
const { body, param } = require('express-validator');
const {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { authenticate } = require('../middleware/auth');
const { validate, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

const patientBody = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150.')
    .toInt(),
  body('gender').trim().notEmpty().withMessage('Gender is required.'),
  body('medical_history').optional().isString(),
];

router.post('/', patientBody, validate, asyncHandler(createPatient));
router.get('/', asyncHandler(listPatients));
router.get(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid patient id.')],
  validate,
  asyncHandler(getPatient)
);
router.put(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid patient id.'), ...patientBody],
  validate,
  asyncHandler(updatePatient)
);
router.delete(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid patient id.')],
  validate,
  asyncHandler(deletePatient)
);

module.exports = router;
