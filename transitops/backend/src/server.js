const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const reportRoutes = require('./routes/report.routes');

// Use Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'transitops-backend' });
});

app.listen(PORT, () => {
  console.log(`TransitOps Backend running on port ${PORT}`);
});

module.exports = app;
