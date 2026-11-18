import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo users must not be seeded in production.");
  }

  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword || seedPassword.length < 12) {
    throw new Error("Set SEED_PASSWORD to a value of at least 12 characters.");
  }
  if (Buffer.byteLength(seedPassword, "utf8") > 72) {
    throw new Error("SEED_PASSWORD must not exceed bcrypt's 72-byte input limit.");
  }

  const pw = await bcrypt.hash(seedPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@spark.test" },
    update: { passwordHash: pw, emailVerified: new Date(), authVersion: { increment: 1 } },
    create: {
      email: "admin@spark.test",
      passwordHash: pw,
      fullName: "SPARK Admin",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@spark.test" },
    update: { passwordHash: pw, emailVerified: new Date(), authVersion: { increment: 1 } },
    create: {
      email: "teacher@spark.test",
      passwordHash: pw,
      fullName: "SPARK Teacher",
      role: "TEACHER",
      emailVerified: new Date(),
      teacherProfile: {
        create: { verificationStatus: "APPROVED", verifiedAt: new Date() },
      },
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: "parent@spark.test" },
    update: { passwordHash: pw, emailVerified: new Date(), authVersion: { increment: 1 } },
    create: {
      email: "parent@spark.test",
      passwordHash: pw,
      fullName: "SPARK Parent",
      role: "PARENT",
      emailVerified: new Date(),
      parentProfile: { create: {} },
    },
  });

  const pupil = await prisma.user.upsert({
    where: { email: "pupil@spark.test" },
    update: { passwordHash: pw, emailVerified: new Date(), authVersion: { increment: 1 } },
    create: {
      email: "pupil@spark.test",
      passwordHash: pw,
      fullName: "SPARK Pupil",
      role: "PUPIL",
      emailVerified: new Date(),
      pupilProfile: { create: { classBand: "JSS1" } },
    },
  });

  // Link parent <-> pupil
  const parentProfile = await prisma.parentProfile.findUniqueOrThrow({
    where: { userId: parent.id },
  });
  const pupilProfile = await prisma.pupilProfile.findUniqueOrThrow({
    where: { userId: pupil.id },
  });

  await prisma.guardianLink.upsert({
    where: {
      parentId_pupilId: { parentId: parentProfile.id, pupilId: pupilProfile.id },
    },
    update: {},
    create: {
      parentId: parentProfile.id,
      pupilId: pupilProfile.id,
      relationship: "Guardian",
    },
  });

  console.log("Seed complete. Test users use the configured SEED_PASSWORD.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());