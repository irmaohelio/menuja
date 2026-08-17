-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PizzaSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "slices" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PizzaSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PizzaSize" ("id", "name", "price", "productId", "slices", "sortOrder") SELECT "id", "name", "price", "productId", "slices", "sortOrder" FROM "PizzaSize";
DROP TABLE "PizzaSize";
ALTER TABLE "new_PizzaSize" RENAME TO "PizzaSize";
CREATE INDEX "PizzaSize_productId_idx" ON "PizzaSize"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
