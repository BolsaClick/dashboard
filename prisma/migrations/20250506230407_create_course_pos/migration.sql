-- CreateTable
CREATE TABLE "CoursePos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseIds" TEXT[],

    CONSTRAINT "CoursePos_pkey" PRIMARY KEY ("id")
);
