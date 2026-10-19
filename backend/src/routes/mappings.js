const express = require('express');
const { body, param } = require('express-validator');
const {
  createMapping,
  listMappings,
  getDoctorsForPatient,
  deleteMapping,
} = require('../controllers/mappingController');
const { authenticate } = require('../middleware/auth');
const { validate, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('patient_id').isInt({ min: 1 }).withMessage('patient_id is required.'),
    body('doctor_id').isInt({ min: 1 }).withMessage('doctor_id is required.'),
  ],
  validate,
  asyncHandler(createMapping)
);

router.get('/', asyncHandler(listMappings));

// GET uses patient_id; DELETE uses mapping id — same path shape, different methods (per assignment)
router.get(
  '/:patient_id/',
  [param('patient_id').isInt({ min: 1 }).withMessage('Invalid patient id.')],
  validate,
  asyncHandler(getDoctorsForPatient)
);

router.delete(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid mapping id.')],
  validate,
  asyncHandler(deleteMapping)
);

module.exports = router;
