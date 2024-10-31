/*
  Warnings:

  - You are about to drop the column `courseId` on the `UserStudent` table. All the data in the column will be lost.
  - You are about to drop the column `courseName` on the `UserStudent` table. All the data in the column will be lost.
  - Made the column `document` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address_number` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `neighborhood` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postal_code` on table `UserStudent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserStudent" DROP COLUMN "courseId",
DROP COLUMN "courseName",
ALTER COLUMN "document" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "address_number" SET NOT NULL,
ALTER COLUMN "neighborhood" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "postal_code" SET NOT NULL;
