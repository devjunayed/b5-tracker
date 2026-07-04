CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

INSERT INTO "courses" ("title", "position")
VALUES ('Batch 5 Course', 0);

ALTER TABLE "missions" ADD COLUMN "courseId" INTEGER;

UPDATE "missions"
SET "courseId" = (SELECT "id" FROM "courses" ORDER BY "id" ASC LIMIT 1)
WHERE "courseId" IS NULL;

ALTER TABLE "missions" ALTER COLUMN "courseId" SET NOT NULL;

ALTER TABLE "modules" ADD COLUMN "link" TEXT;

ALTER TABLE "missions" ADD CONSTRAINT "missions_courseId_fkey"
FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
