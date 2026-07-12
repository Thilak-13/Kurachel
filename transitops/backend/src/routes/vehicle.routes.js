const express = require('express');
const router = express.Router();

// Placeholder for Vehicle CRUD operations
router.get('/', (req, res) => {
  res.json({ message: 'GET /api/vehicles - Retrieve all vehicles (placeholder)' });
});

router.post('/', (req, res) => {
  res.json({ message: 'POST /api/vehicles - Create new vehicle (placeholder)' });
});

router.put('/:id', (req, res) => {
  res.json({ message: `PUT /api/vehicles/${req.params.id} - Update vehicle (placeholder)` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `DELETE /api/vehicles/${req.params.id} - Delete vehicle (placeholder)` });
});

module.exports = router;
