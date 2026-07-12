-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_drivers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licenseNumber" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "category" TEXT,
    "licenseExpiryDate" TEXT,
    "contact" TEXT,
    "safetyScore" INTEGER,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "drivers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_drivers" ("createdAt", "firstName", "id", "lastName", "licenseNumber", "phone", "status", "updatedAt", "userId") SELECT "createdAt", "firstName", "id", "lastName", "licenseNumber", "phone", "status", "updatedAt", "userId" FROM "drivers";
DROP TABLE "drivers";
ALTER TABLE "new_drivers" RENAME TO "drivers";
CREATE UNIQUE INDEX "drivers_licenseNumber_key" ON "drivers"("licenseNumber");
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE TABLE "new_vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT,
    "model" TEXT NOT NULL,
    "year" INTEGER,
    "registrationNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "type" TEXT,
    "maxLoadCapacity" INTEGER,
    "odometer" REAL,
    "acquisitionCost" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_vehicles" ("createdAt", "id", "make", "model", "registrationNumber", "status", "updatedAt", "year") SELECT "createdAt", "id", "make", "model", "registrationNumber", "status", "updatedAt", "year" FROM "vehicles";
DROP TABLE "vehicles";
ALTER TABLE "new_vehicles" RENAME TO "vehicles";
CREATE UNIQUE INDEX "vehicles_registrationNumber_key" ON "vehicles"("registrationNumber");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
