/*
  Warnings:

  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add name column with default value first
ALTER TABLE "User" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'User';

-- Update existing users to have a name derived from their email
UPDATE "User" SET "name" = SPLIT_PART("email", '@', 1) WHERE "name" = 'User';

-- Remove the default value constraint (optional, keeps schema clean)
ALTER TABLE "User" ALTER COLUMN "name" DROP DEFAULT;
