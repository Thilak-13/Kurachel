import prisma from '../src/config/db.js';
import bcrypt from 'bcrypt';

console.log('SEED DATABASE_URL:', process.env.DATABASE_URL);

async function main() {
  console.log('Clearing database tables...');
  // Delete in reverse order of dependencies to avoid foreign key errors
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
  const dispatcherRole = await prisma.role.create({
    data: { name: 'DISPATCHER', description: 'Operations dispatcher managing trips and drivers' },
  });
  const driverRole = await prisma.role.create({
    data: { name: 'DRIVER', description: 'Vehicle driver with access to assign trips' },
  });
  const maintenanceRole = await prisma.role.create({
    data: { name: 'MAINTENANCE_STAFF', description: 'Staff for vehicle servicing and logs' },
  });

  console.log('Creating users...');
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('adminpassword123', saltRounds);
  const dispatcherPassword = await bcrypt.hash('dispatchpassword123', saltRounds);
  const driverPassword = await bcrypt.hash('driverpassword123', saltRounds);
  const maintenancePassword = await bcrypt.hash('maintpassword123', saltRounds);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@transitops.com',
      username: 'admin_arthur',
      password: adminPassword,
      name: 'Arthur Miller',
      roleId: adminRole.id,
    },
  });

  const dispatcherUser = await prisma.user.create({
    data: {
      email: 'dispatcher@transitops.com',
      username: 'dispatcher_debbie',
      password: dispatcherPassword,
      name: 'Debbie Dispatcher',
      roleId: dispatcherRole.id,
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

  const maintenanceUser = await prisma.user.create({
    data: {
      email: 'mechanic.bill@transitops.com',
      username: 'mechanic_bill',
      password: maintenancePassword,
      name: 'Bill Mechanic',
      roleId: maintenanceRole.id,
    },
  });

  console.log('Creating vehicles...');
  const vehicle1 = await prisma.vehicle.create({
    data: {
      make: 'Ford',
      model: 'Transit Cargo Van',
      year: 2022,
      registrationNumber: 'TX-FLT-1049',
      status: 'ACTIVE',
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      make: 'Freightliner',
      model: 'M2 106 Box Truck',
      year: 2021,
      registrationNumber: 'CA-FLT-8842',
      status: 'IN_SERVICE',
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      make: 'Ram',
      model: 'ProMaster 2500',
      year: 2020,
      registrationNumber: 'NY-FLT-3022',
      status: 'OUT_OF_SERVICE',
    },
  });

  console.log('Creating drivers...');
  const driver1 = await prisma.driver.create({
    data: {
      licenseNumber: 'DL-TX983742',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0199',
      status: 'AVAILABLE',
      userId: driverUser.id, // Linked to the driver User account
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      licenseNumber: 'DL-CA549201',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-0245',
      status: 'ON_TRIP',
    },
  });

  console.log('Creating trips...');
  const trip1 = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-2026-001',
      driverId: driver1.id,
      vehicleId: vehicle1.id,
      status: 'COMPLETED',
      startLocation: 'Dallas, TX',
      endLocation: 'Houston, TX',
      startTime: new Date('2026-07-10T08:00:00Z'),
      endTime: new Date('2026-07-10T12:30:00Z'),
      distance: 240.5,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      tripNumber: 'TRIP-2026-002',
      driverId: driver2.id,
      vehicleId: vehicle2.id,
      status: 'EN_ROUTE',
      startLocation: 'Los Angeles, CA',
      endLocation: 'San Francisco, CA',
      startTime: new Date('2026-07-12T06:00:00Z'),
      distance: 382.2,
    },
  });

  console.log('Creating maintenance logs...');
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle3.id,
      description: 'Scheduled 50,000-mile engine check, oil filter replacement, and brake pad servicing.',
      cost: 485.50,
      performedAt: new Date('2026-07-11T09:00:00Z'),
    },
  });

  console.log('Creating fuel logs...');
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicle1.id,
      fuelVolume: 75.4, // Liters
      cost: 112.20,
      odometerReading: 24310.8,
      loggedAt: new Date('2026-07-10T12:45:00Z'),
    },
  });

  console.log('Creating expenses...');
  await prisma.expense.create({
    data: {
      vehicleId: vehicle2.id,
      category: 'Tolls',
      amount: 45.00,
      description: 'Bay Bridge crossing and express lane toll fees.',
      spentAt: new Date('2026-07-12T07:30:00Z'),
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: vehicle1.id,
      category: 'Parking',
      amount: 25.00,
      description: 'Downtown distribution warehouse overnight parking fee.',
      spentAt: new Date('2026-07-10T16:00:00Z'),
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
