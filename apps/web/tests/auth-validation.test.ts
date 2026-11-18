import assert from "node:assert/strict";
import test from "node:test";
import {
  passwordResetConfirmationSchema,
  passwordResetRequestSchema,
  registrationSchema,
} from "../lib/auth-validation";
import { canJoinClassroom, canManageClassroom } from "../lib/classroom-access";

test("registration normalizes email and accepts only adult account roles", () => {
  const parsed = registrationSchema.parse({
    fullName: "  Ada Okafor ",
    email: " ADA@EXAMPLE.COM ",
    password: "a secure password",
    role: "TEACHER",
  });

  assert.equal(parsed.fullName, "Ada Okafor");
  assert.equal(parsed.email, "ada@example.com");
  assert.equal(
    registrationSchema.safeParse({
      fullName: "Child",
      email: "child@example.com",
      password: "a secure password",
      role: "PUPIL",
    }).success,
    false,
  );
});

test("registration rejects short and bcrypt-truncated passwords", () => {
  const input = {
    fullName: "Ada Okafor",
    email: "ada@example.com",
    role: "PARENT",
  };

  assert.equal(
    registrationSchema.safeParse({ ...input, password: "short" }).success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({ ...input, password: "a".repeat(73) }).success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({ ...input, password: "a".repeat(72) }).success,
    true,
  );
  assert.equal(
    registrationSchema.safeParse({ ...input, password: "😀".repeat(24) }).success,
    false,
  );
});

test("password reset validates email, token, and password limits", () => {
  assert.equal(
    passwordResetRequestSchema.parse({ email: "USER@EXAMPLE.COM" }).email,
    "user@example.com",
  );
  assert.equal(
    passwordResetConfirmationSchema.safeParse({
      token: "x".repeat(32),
      password: "long enough password",
    }).success,
    true,
  );
  assert.equal(
    passwordResetConfirmationSchema.safeParse({
      token: "too-short",
      password: "long enough password",
    }).success,
    false,
  );
});

test("classroom access is limited to enrolled pupils and assigned approved teachers", () => {
  const common = {
    classActive: true,
    teacherUserId: "teacher-1",
    teacherVerificationStatus: "APPROVED" as const,
  };

  assert.equal(
    canManageClassroom({
      ...common,
      role: "TEACHER",
      userId: "teacher-1",
      enrolledPupil: false,
    }),
    true,
  );
  assert.equal(
    canManageClassroom({
      ...common,
      role: "TEACHER",
      userId: "teacher-2",
      enrolledPupil: false,
    }),
    false,
  );
  assert.equal(
    canJoinClassroom({
      ...common,
      role: "PUPIL",
      userId: "pupil-1",
      enrolledPupil: false,
    }),
    false,
  );
  assert.equal(
    canJoinClassroom({
      ...common,
      role: "PUPIL",
      userId: "pupil-1",
      enrolledPupil: true,
    }),
    true,
  );
  assert.equal(
    canJoinClassroom({
      ...common,
      role: "ADMIN",
      userId: "admin-1",
      enrolledPupil: false,
      classActive: false,
    }),
    false,
  );
});
