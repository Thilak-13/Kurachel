import prisma from '../config/db.js';
import rules from '../../../shared/validators/dispatch.rules.js';

const { isValidStatusEnum } = rules;

// Status Mapping Layers
const apiToDbDriverStatus = {
  'Available': 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'Suspended': 'INACTIVE',
  'Off Duty': 'ON_LEAVE'
};

const dbToApiDriverStatus = {
  'AVAILABLE': 'Available',
  'ON_TRIP': 'On Trip',
  'INACTIVE': 'Suspended',
  'ON_LEAVE': 'Off Duty'
};

/**
 * GET /api/drivers
 */
export const getDrivers = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    const where = {};

    if (statusFilter) {
      const dbStatus = apiToDbDriverStatus[statusFilter];
      if (dbStatus) {
        where.status = dbStatus;
      }
    }

    const drivers = await prisma.driver.findMany({ where });

    const mappedDrivers = drivers.map(d => ({
      id: d.id,
      name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
      licenseNumber: d.licenseNumber,
      category: d.category || null,
      licenseExpiryDate: d.licenseExpiryDate || null,
      contact: d.contact || d.phone || null,
      safetyScore: d.safetyScore || null,
      status: dbToApiDriverStatus[d.status] || d.status
    }));

    res.status(200).json(mappedDrivers);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/drivers
 */
export const createDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, category, licenseExpiryDate, contact, safetyScore, status, userId } = req.body;

    // 1. Status validation check
    if (!isValidStatusEnum('driver', status)) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid driver status'
      });
    }

    // 2. Uniqueness check for license number
    const existingLicense = await prisma.driver.findUnique({ where: { licenseNumber } });
    if (existingLicense) {
      return res.status(409).json({
        errorCode: 'DUPLICATE_LICENSE_NUMBER',
        message: 'License number already exists'
      });
    }

    const dbStatus = apiToDbDriverStatus[status];

    // Derive firstName and lastName from name
    let firstName = '';
    let lastName = '';
    if (name) {
      const parts = name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    const driver = await prisma.driver.create({
      data: {
        licenseNumber,
        firstName,
        lastName,
        name,
        category: category || null,
        licenseExpiryDate: licenseExpiryDate || null,
        contact: contact || null,
        phone: contact || null,
        safetyScore: safetyScore ? parseInt(safetyScore, 10) : null,
        status: dbStatus,
        userId: userId || null
      }
    });

    res.status(201).json({
      id: driver.id,
      name: driver.name || `${driver.firstName} ${driver.lastName}`.trim(),
      licenseNumber: driver.licenseNumber,
      category: driver.category,
      licenseExpiryDate: driver.licenseExpiryDate,
      contact: driver.contact,
      safetyScore: driver.safetyScore,
      status: dbToApiDriverStatus[driver.status]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/drivers/:id
 */
export const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, licenseNumber, category, licenseExpiryDate, contact, safetyScore, status, userId } = req.body;

    // Find if driver exists
    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const updateData = {};

    if (name) {
      updateData.name = name;
      const parts = name.trim().split(/\s+/);
      updateData.firstName = parts[0];
      updateData.lastName = parts.slice(1).join(' ');
    }

    if (category !== undefined) updateData.category = category;
    if (licenseExpiryDate !== undefined) updateData.licenseExpiryDate = licenseExpiryDate;
    if (contact !== undefined) {
      updateData.contact = contact;
      updateData.phone = contact;
    }
    if (safetyScore !== undefined) updateData.safetyScore = safetyScore ? parseInt(safetyScore, 10) : null;
    if (userId !== undefined) updateData.userId = userId;

    // License uniqueness check
    if (licenseNumber && licenseNumber !== existing.licenseNumber) {
      const existingLicense = await prisma.driver.findUnique({ where: { licenseNumber } });
      if (existingLicense) {
        return res.status(409).json({
          errorCode: 'DUPLICATE_LICENSE_NUMBER',
          message: 'License number already exists'
        });
      }
      updateData.licenseNumber = licenseNumber;
    }

    // Status validation
    if (status) {
      if (!isValidStatusEnum('driver', status)) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid driver status'
        });
      }
      updateData.status = apiToDbDriverStatus[status];
    }

    const updated = await prisma.driver.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      id: updated.id,
      name: updated.name || `${updated.firstName} ${updated.lastName}`.trim(),
      licenseNumber: updated.licenseNumber,
      category: updated.category,
      licenseExpiryDate: updated.licenseExpiryDate,
      contact: updated.contact,
      safetyScore: updated.safetyScore,
      status: dbToApiDriverStatus[updated.status]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/drivers/:id
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find if driver exists
    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    await prisma.driver.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
