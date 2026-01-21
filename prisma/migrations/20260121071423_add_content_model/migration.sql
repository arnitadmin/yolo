/*
  Warnings:

  - You are about to drop the column `screenshot_url` on the `applications` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "contents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primary_url" TEXT NOT NULL,
    "secondary_url" TEXT,
    "tags" TEXT,
    "screenshot_light_url" TEXT,
    "screenshot_dark_url" TEXT,
    "category" TEXT,
    "access" TEXT NOT NULL DEFAULT 'user',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL
);
INSERT INTO "new_applications" ("category", "created_at", "created_by", "description", "id", "name", "primary_url", "secondary_url", "tags", "updated_at") SELECT "category", "created_at", "created_by", "description", "id", "name", "primary_url", "secondary_url", "tags", "updated_at" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE INDEX "applications_name_idx" ON "applications"("name");
CREATE INDEX "applications_category_idx" ON "applications"("category");
CREATE INDEX "applications_access_idx" ON "applications"("access");
CREATE INDEX "applications_order_idx" ON "applications"("order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "contents_slug_key" ON "contents"("slug");
