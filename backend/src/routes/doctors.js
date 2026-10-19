const express = require('express');
const { body, param } = require('express-validator');
const {
  createDoctor,
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { authenticate } = require('../middleware/auth');
const { validate, asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use(authenticate);

const doctorBody = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required.'),
  body('email').isEmail().withMessage('A valid email is required.'),
  body('phone').optional().isString(),
];

router.post('/', doctorBody, validate, asyncHandler(createDoctor));
router.get('/', asyncHandler(listDoctors));
router.get(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid doctor id.')],
  validate,
  asyncHandler(getDoctor)
);
router.put(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid doctor id.'), ...doctorBody],
  validate,
  asyncHandler(updateDoctor)
);
router.delete(
  '/:id/',
  [param('id').isInt({ min: 1 }).withMessage('Invalid doctor id.')],
  validate,
  asyncHandler(deleteDoctor)
);

module.exports = router;
