import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

export const apiToDbDriverStatus = {
  'Available': 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'Suspended': 'INACTIVE',
  'Off Duty': 'ON_LEAVE'
};

export const dbToApiDriverStatus = {
  'AVAILABLE': 'Available',
  'ON_TRIP': 'On Trip',
  'INACTIVE': 'Suspended',
  'ON_LEAVE': 'Off Duty'
};

/**
 * Maps a database driver record to the API structure.
 */
export const mapDriverToApi = (d) => ({
  id: d.id,
  name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim(),
  licenseNumber: d.licenseNumber,
  category: d.category || null,
  licenseExpiryDate: d.licenseExpiryDate || null,
  contact: d.contact || d.phone || null,
  safetyScore: d.safetyScore || null,
  status: dbToApiDriverStatus[d.status] || d.status,
  userId: d.userId || null
});

/**
 * Retrieve all drivers with filtering, search, pagination, and sorting.
 */
export const getDrivers = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const { search, status, sort } = query;

  const where = {};

  if (status) {
    const dbStatus = apiToDbDriverStatus[status];
    if (dbStatus) {
      where.status = dbStatus;
    } else {
      throw new ApiError(400, `Invalid driver status filter. Must be one of: ${Object.keys(apiToDbDriverStatus).join(', ')}`);
    }
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { name: { contains: search } },
      { licenseNumber: { contains: search } },
      { contact: { contains: search } },
      { phone: { contains: search } }
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    
    const allowedSortFields = ['name', 'firstName', 'lastName', 'licenseNumber', 'licenseExpiryDate', 'safetyScore', 'status', 'createdAt'];
    if (allowedSortFields.includes(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  const [drivers, totalItems] = await Promise.all([
    prisma.driver.findMany({ where, skip, take, orderBy }),
    prisma.driver.count({ where })
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);
  return {
    drivers: drivers.map(mapDriverToApi),
    meta
  };
};

/**
 * Get a specific driver by ID.
 */
export const getDriverById = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id }
  });
  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }
  return mapDriverToApi(driver);
};

/**
 * Create a new driver.
 */
export const createDriver = async (data) => {
  const { name, licenseNumber, category, licenseExpiryDate, contact, safetyScore, status = 'Available', userId } = data;

  // Uniqueness check for license number
  const existingLicense = await prisma.driver.findUnique({ where: { licenseNumber } });
  if (existingLicense) {
    throw new ApiError(409, 'License number already exists', [{
      field: 'licenseNumber',
      message: 'License number already exists'
    }], 'DUPLICATE_LICENSE_NUMBER');
  }

  const dbStatus = apiToDbDriverStatus[status] || 'AVAILABLE';

  // Split name to populate firstName / lastName
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

  return mapDriverToApi(driver);
};

/**
 * Update an existing driver.
 */
export const updateDriver = async (id, data) => {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Driver not found');
  }

  const updateData = {};

  if (data.name) {
    updateData.name = data.name;
    const parts = data.name.trim().split(/\s+/);
    updateData.firstName = parts[0];
    updateData.lastName = parts.slice(1).join(' ');
  }

  if (data.category !== undefined) updateData.category = data.category;
  if (data.licenseExpiryDate !== undefined) updateData.licenseExpiryDate = data.licenseExpiryDate;
  if (data.contact !== undefined) {
    updateData.contact = data.contact;
    updateData.phone = data.contact;
  }
  if (data.safetyScore !== undefined) {
    updateData.safetyScore = data.safetyScore ? parseInt(data.safetyScore, 10) : null;
  }
  if (data.userId !== undefined) updateData.userId = data.userId;

  if (data.licenseNumber && data.licenseNumber !== existing.licenseNumber) {
    const existingLicense = await prisma.driver.findUnique({ where: { licenseNumber: data.licenseNumber } });
    if (existingLicense) {
      throw new ApiError(409, 'License number already exists', [{
        field: 'licenseNumber',
        message: 'License number already exists'
      }], 'DUPLICATE_LICENSE_NUMBER');
    }
    updateData.licenseNumber = data.licenseNumber;
  }

  if (data.status) {
    const dbStatus = apiToDbDriverStatus[data.status];
    if (dbStatus) {
      updateData.status = dbStatus;
    }
  }

  const updated = await prisma.driver.update({
    where: { id },
    data: updateData
  });

  return mapDriverToApi(updated);
};

/**
 * Delete a driver record.
 */
export const deleteDriver = async (id) => {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Driver not found');
  }

  await prisma.driver.delete({ where: { id } });
  return true;
};
