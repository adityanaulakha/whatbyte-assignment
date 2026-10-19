const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const doctorRoutes = require('./routes/doctors');
const mappingRoutes = require('./routes/mappings');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Healthcare Backend API',
    status: 'ok',
    endpoints: {
      auth: '/api/auth/',
      patients: '/api/patients/',
      doctors: '/api/doctors/',
      mappings: '/api/mappings/',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/mappings', mappingRoutes);

app.use((req, res) => {
  res.status(404).json({ detail: 'Not found.' });
});

app.use(errorHandler);

module.exports = app;
