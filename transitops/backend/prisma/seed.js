import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';

console.log('SEED DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
  console.log('Clearing database tables...');
  // Delete in reverse order of dependencies to avoid foreign key constraints errors
  await prisma.expense.deleteMany({});
  await prisma.fuelLog.deleteMany({});
  await prisma.maintenanceLog.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('Creating roles...');
  const adminRole = await prisma.role.create({
    data: { name: 'ADMIN', description: 'System Administrator with full access' },
  });
  const fleetManagerRole = await prisma.role.create({
    data: { name: 'FLEET_MANAGER', description: 'Fleet Manager managing vehicles and drivers' },
  });
  const dispatcherRole = await prisma.role.create({
    data: { name: 'DISPATCHER', description: 'Operations dispatcher managing trips and dispatching' },
  });
  const driverRole = await prisma.role.create({
    data: { name: 'DRIVER', description: 'Vehicle driver executing trips' },
  });
  const maintenanceManagerRole = await prisma.role.create({
    data: { name: 'MAINTENANCE_MANAGER', description: 'Maintenance Manager overseeing vehicle health and logs' },
  });

  console.log('Creating users...');
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('adminpassword123', saltRounds);
  const fleetPassword = await bcrypt.hash('fleetpassword123', saltRounds);
  const dispatcherPassword = await bcrypt.hash('dispatchpassword123', saltRounds);
  const driverPassword = await bcrypt.hash('driverpassword123', saltRounds);
  const maintPassword = await bcrypt.hash('maintpassword123', saltRounds);

  // Seeding 4 Management Users requested + 1 Driver User for smoke-test-runner compatibility
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@transitops.com',
      username: 'admin_user',
      password: adminPassword,
      name: 'Rajesh Sharma',
      roleId: adminRole.id,
    },
  });

  const fleetManagerUser = await prisma.user.create({
    data: {
      email: 'fleet@transitops.com',
      username: 'fleet_user',
      password: fleetPassword,
      name: 'Amit Verma',
      roleId: fleetManagerRole.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@transitops.com',
      username: 'dispatcher_user',
      password: dispatcherPassword,
      name: 'Priyanka Patel',
      roleId: dispatcherRole.id,
    },
  });

  const maintenanceManagerUser = await prisma.user.create({
    data: {
      email: 'maintenance@transitops.com',
      username: 'maint_user',
      password: maintPassword,
      name: 'Vikram Singh',
      roleId: maintenanceManagerRole.id,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: 'john.doe@transitops.com',
      username: 'driver_john',
      password: driverPassword,
      name: 'John Doe',
      roleId: driverRole.id,
    },
  });

  console.log('Creating 5 Vehicles (Indian configurations)...');
  const vehicle1 = await prisma.vehicle.create({
    data: {
      make: 'Tata',
      model: 'Ultra T.7',
      year: 2022,
      registrationNumber: 'MH-12-PQ-4567',
      status: 'ACTIVE',
      type: 'Light Commercial Vehicle',
      maxLoadCapacity: 4000,
      odometer: 28500.5,
      acquisitionCost: 1550000.0,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      make: 'Mahindra',
      model: 'Bolero Pik-Up',
      year: 2023,
      registrationNumber: 'DL-3C-AB-1234',
      status: 'ACTIVE',
      type: 'Pickup Truck',
      maxLoadCapacity: 1700,
      odometer: 14200.0,
      acquisitionCost: 950000.0,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      make: 'Ashok Leyland',
      model: 'Dost Strong',
      year: 2021,
      registrationNumber: 'KA-51-MB-9988',
      status: 'IN_SERVICE',
      type: 'Mini Truck',
      maxLoadCapacity: 1500,
      odometer: 42150.2,
      acquisitionCost: 820000.0,
    },
  });

  const vehicle4 = await prisma.vehicle.create({
    data: {
      make: 'Tata',
      model: '407 Gold SFC',
      year: 2020,
      registrationNumber: 'HR-26-DJ-5678',
      status: 'OUT_OF_SERVICE',
      type: 'Light Truck',
      maxLoadCapacity: 2200,
      odometer: 65800.8,
      acquisitionCost: 1250000.0,
    },
  });

  const vehicle5 = await prisma.vehicle.create({
    data: {
      make: 'Eicher',
      model: 'Pro 2049',
      year: 2022,
      registrationNumber: 'TS-09-UB-3456',
      status: 'ACTIVE',
      type: 'Light Duty Truck',
      maxLoadCapacity: 3500,
      odometer: 21100.4,
      acquisitionCost: 1400000.0,
    },
  });

  console.log('Creating 5 Drivers (Indian configurations)...');
  // First driver is mapped to the smoke test driver user account
  const driver1 = await prisma.driver.create({
    data: {
      licenseNumber: 'DL14 20180098765',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      category: 'HGV',
      licenseExpiryDate: '2032-08-15',
      phone: '+91-9876543210',
      contact: '+91-9876543210',
      safetyScore: 92,
      status: 'AVAILABLE',
      userId: driverUser.id,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      licenseNumber: 'PB02 20150123456',
      firstName: 'Harpreet',
      lastName: 'Singh',
      name: 'Harpreet Singh',
      category: 'HGV',
      licenseExpiryDate: '2030-05-20',
      phone: '+91-9812345678',
      contact: '+91-9812345678',
      safetyScore: 88,
      status: 'ON_TRIP',
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      licenseNumber: 'UP16 20190045678',
      firstName: 'Ramesh',
      lastName: 'Yadav',
      name: 'Ramesh Yadav',
      category: 'LCV',
      licenseExpiryDate: '2029-11-10',
      phone: '+91-9988776655',
      contact: '+91-9988776655',
      safetyScore: 95,
      status: 'AVAILABLE',
    },
  });

  const driver4 = await prisma.driver.create({
    data: {
      licenseNumber: 'HR26 20120034567',
      firstName: 'Baldev',
      lastName: 'Raj',
      name: 'Baldev Raj',
      category: 'HGV',
      licenseExpiryDate: '2028-02-28',
      phone: '+91-9765432109',
      contact: '+91-9765432109',
      safetyScore: 85,
      status: 'ON_LEAVE',
    },
  });

  const driver5 = await prisma.driver.create({
    data: {
      licenseNumber: 'TN01 20170076543',
      firstName: 'Muthu',
      lastName: 'Krishnan',
      name: 'Muthu Krishnan',
      category: 'LCV',
      licenseExpiryDate: '2031-07-04',
      phone: '+91-9444012345',
      contact: '+91-9444012345',
      safetyScore: 90,
      status: 'AVAILABLE',
    },
  });

  console.log('Creating 3 Trips (Realistic Indian Routes)...');
  const trip1 = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-IN-2026-001',
      driverId: driver2.id,
      vehicleId: vehicle1.id,
      status: 'COMPLETED',
      startLocation: 'Mumbai, MH',
      endLocation: 'Pune, MH',
      startTime: new Date('2026-07-10T06:00:00Z'),
      endTime: new Date('2026-07-10T10:30:00Z'),
      distance: 148.5,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-IN-2026-002',
      driverId: driver3.id,
      vehicleId: vehicle2.id,
      status: 'EN_ROUTE',
      startLocation: 'Delhi, DL',
      endLocation: 'Jaipur, RJ',
      startTime: new Date('2026-07-12T05:00:00Z'),
      distance: 268.0,
    },
  });

  const trip3 = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-IN-2026-003',
      driverId: driver1.id,
      vehicleId: vehicle3.id,
      status: 'SCHEDULED',
      startLocation: 'Bengaluru, KA',
      endLocation: 'Chennai, TN',
      distance: 345.5,
    },
  });

  console.log('Creating 2 Maintenance Logs (Realistic Indian maintenance records)...');
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle4.id, // Tata 407 Gold SFC which is OUT_OF_SERVICE
      description: 'Full engine overhaul, cylinder head machining, and new clutch plate kit installation at authorized service center.',
      cost: 24500.00,
      performedAt: new Date('2026-07-08T10:00:00Z'),
      status: 'CLOSED',
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle5.id, // Eicher Pro 2049
      description: 'First 20,000 km general service: Engine oil change, air and oil filter replacement, brake cleaning, and wheel alignment.',
      cost: 8500.00,
      performedAt: new Date('2026-07-11T09:30:00Z'),
      status: 'CLOSED',
    },
  });

  console.log('Creating Fuel Logs...');
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      fuelVolume: 60.5, // Liters
      cost: 5445.00, // ₹90 per liter
      odometerReading: 28450.0,
      loggedAt: new Date('2026-07-10T05:45:00Z'),
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle2.id,
      fuelVolume: 45.0,
      cost: 4050.00,
      odometerReading: 14150.0,
      loggedAt: new Date('2026-07-12T04:45:00Z'),
    },
  });

  console.log('Creating Expenses...');
  await prisma.expense.create({
    data: {
      vehicleId: vehicle1.id,
      category: 'Tolls',
      amount: 360.00, // Mumbai-Pune Expressway toll
      description: 'Mumbai-Pune Expressway toll fee auto-debited via FASTag.',
      spentAt: new Date('2026-07-10T07:15:00Z'),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: vehicle3.id,
      category: 'Parking',
      amount: 200.00,
      description: 'Overnight commercial parking charges at Nelamangala warehouse hub.',
      spentAt: new Date('2026-07-11T18:00:00Z'),
    },
  });

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
