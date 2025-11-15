-- CreateTable
CREATE TABLE "applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primary_url" TEXT NOT NULL,
    "secondary_url" TEXT,
    "tags" TEXT,
    "screenshot_url" TEXT,
    "category" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "applications_name_idx" ON "applications"("name");

-- CreateIndex
CREATE INDEX "applications_category_idx" ON "applications"("category");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
