import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Calculates detailed reports per vehicle.
 * @param {object} query - Contains vehicleId, startDate, endDate, sort
 */
export const getOperationalReports = async (query) => {
  const { vehicleId, startDate, endDate, sort } = query;

  // Build date filters if provided
  const dateFilter = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.lte = new Date(endDate);
  }
  const hasDateFilter = startDate || endDate;

  // Fetch all vehicles matching filter
  const vehicleWhere = {};
  if (vehicleId) {
    vehicleWhere.id = vehicleId;
  }

  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    include: {
      trips: {
        where: {
          status: 'COMPLETED',
          ...(hasDateFilter && {
            endTime: dateFilter
          })
        }
      },
      fuelLogs: {
        where: hasDateFilter ? { loggedAt: dateFilter } : {}
      },
      maintenanceLogs: {
        where: hasDateFilter ? { performedAt: dateFilter } : {}
      },
      expenses: {
        where: hasDateFilter ? { spentAt: dateFilter } : {}
      }
    }
  });

  const reports = vehicles.map((v) => {
    // 1. Distance Travelled (Sum of distance of completed trips)
    const totalKm = v.trips.reduce((sum, t) => sum + (t.distance || 0), 0);

    // 2. Fuel Consumed & Cost
    const totalFuelLiters = v.fuelLogs.reduce((sum, f) => sum + (f.fuelVolume || 0), 0);
    const fuelCost = v.fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);

    // 3. Fuel Efficiency: totalKm / totalFuelLiters
    const fuelEfficiencyKmPerL = totalFuelLiters > 0 
      ? parseFloat((totalKm / totalFuelLiters).toFixed(2)) 
      : 0;

    // 4. Maintenance Cost & Expense Cost
    const maintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
    const expenseCost = v.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // 5. Total Operational Cost: Fuel Cost + Maintenance Cost + Expense Cost
    const totalOperationalCost = parseFloat((fuelCost + maintenanceCost + expenseCost).toFixed(2));

    // 6. Revenue: dynamically computed based on commercial vehicle carriage rates
    // Indian rate baseline: ₹65 per km plus a fixed ₹2500 per completed trip
    const completedTripsCount = v.trips.length;
    const revenue = parseFloat(
      (totalKm > 0 ? (totalKm * 65.0) + (completedTripsCount * 2500.0) : 0).toFixed(2)
    );

    // 7. ROI: ((revenue - operationalCost) / acquisitionCost) * 100
    const acqCost = v.acquisitionCost || 1000000.0; // Default fallback to 10L INR
    const roi = parseFloat((((revenue - totalOperationalCost) / acqCost) * 100).toFixed(2));

    return {
      vehicleId: v.id,
      registrationNumber: v.registrationNumber,
      model: v.make ? `${v.make} ${v.model}` : v.model,
      totalKm: parseFloat(totalKm.toFixed(2)),
      totalFuelLiters: parseFloat(totalFuelLiters.toFixed(2)),
      fuelEfficiencyKmPerL,
      fuelEfficiency: fuelEfficiencyKmPerL, // Alias for compatibility
      maintenanceCost: parseFloat(maintenanceCost.toFixed(2)),
      fuelCost: parseFloat(fuelCost.toFixed(2)),
      expenseCost: parseFloat(expenseCost.toFixed(2)),
      totalOperationalCost,
      operationalCost: totalOperationalCost, // Alias
      tripRevenue: revenue,
      revenue, // Alias
      acquisitionCost: acqCost,
      roi
    };
  });

  // Apply sorting if requested
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    reports.sort((a, b) => {
      const valA = a[field] ?? 0;
      const valB = b[field] ?? 0;
      if (typeof valA === 'string') {
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return isDesc ? valB - valA : valA - valB;
    });
  }

  return reports;
};

/**
 * Calculates a high-level fleet operational summary.
 */
export const getFleetSummary = (reports) => {
  const totalVehicles = reports.length;
  const totalKm = reports.reduce((sum, r) => sum + r.totalKm, 0);
  const totalFuel = reports.reduce((sum, r) => sum + r.totalFuelLiters, 0);
  const totalFuelCost = reports.reduce((sum, r) => sum + r.fuelCost, 0);
  const totalMaintenance = reports.reduce((sum, r) => sum + r.maintenanceCost, 0);
  const totalExpenses = reports.reduce((sum, r) => sum + r.expenseCost, 0);
  const totalOperationalCost = reports.reduce((sum, r) => sum + r.totalOperationalCost, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);

  const averageFuelEfficiency = totalFuel > 0 
    ? parseFloat((totalKm / totalFuel).toFixed(2)) 
    : 0;

  const netSavings = parseFloat((totalRevenue - totalOperationalCost).toFixed(2));

  return {
    totalVehicles,
    totalDistanceTravelled: parseFloat(totalKm.toFixed(2)),
    totalFuelVolumeLiters: parseFloat(totalFuel.toFixed(2)),
    averageFuelEfficiency,
    totalFuelCost: parseFloat(totalFuelCost.toFixed(2)),
    totalMaintenanceCost: parseFloat(totalMaintenance.toFixed(2)),
    totalExpenseCost: parseFloat(totalExpenses.toFixed(2)),
    totalOperationalCost: parseFloat(totalOperationalCost.toFixed(2)),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    netSavings
  };
};

/**
 * Generates dynamic CSV buffer for vehicle reports.
 */
export const generateReportsCsv = async (query) => {
  const reports = await getOperationalReports(query);

  const headers = [
    'Vehicle ID',
    'Registration Number',
    'Model',
    'Distance Travelled (km)',
    'Fuel Consumed (L)',
    'Fuel Efficiency (km/L)',
    'Fuel Cost (INR)',
    'Maintenance Cost (INR)',
    'Expense Cost (INR)',
    'Total Operational Cost (INR)',
    'Revenue (INR)',
    'Acquisition Cost (INR)',
    'ROI (%)'
  ];

  const rows = [headers.join(',')];

  reports.forEach((r) => {
    const row = [
      `"${r.vehicleId}"`,
      `"${r.registrationNumber}"`,
      `"${r.model.replace(/"/g, '""')}"`,
      r.totalKm,
      r.totalFuelLiters,
      r.fuelEfficiencyKmPerL,
      r.fuelCost,
      r.maintenanceCost,
      r.expenseCost,
      r.totalOperationalCost,
      r.revenue,
      r.acquisitionCost,
      r.roi
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
};
