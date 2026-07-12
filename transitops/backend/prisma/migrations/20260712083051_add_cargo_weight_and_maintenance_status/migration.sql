-- AlterTable
ALTER TABLE "trips" ADD COLUMN "cargoWeight" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_maintenance_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "performedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "maintenance_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_maintenance_logs" ("cost", "createdAt", "description", "id", "performedAt", "updatedAt", "vehicleId") SELECT "cost", "createdAt", "description", "id", "performedAt", "updatedAt", "vehicleId" FROM "maintenance_logs";
DROP TABLE "maintenance_logs";
ALTER TABLE "new_maintenance_logs" RENAME TO "maintenance_logs";
CREATE INDEX "maintenance_logs_vehicleId_idx" ON "maintenance_logs"("vehicleId");
CREATE INDEX "maintenance_logs_performedAt_idx" ON "maintenance_logs"("performedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
