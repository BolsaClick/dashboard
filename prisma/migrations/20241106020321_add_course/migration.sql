-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseIds" TEXT[],

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
