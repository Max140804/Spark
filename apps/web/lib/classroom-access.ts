import { Role, VerificationStatus } from "@prisma/client";

type ClassroomAccess = {
  role: Role;
  userId: string;
  classActive: boolean;
  teacherUserId: string;
  teacherVerificationStatus: VerificationStatus;
  enrolledPupil: boolean;
};

export function canManageClassroom(access: ClassroomAccess) {
  if (!access.classActive) return false;
  if (access.role === Role.ADMIN) return true;
  return (
    access.role === Role.TEACHER &&
    access.userId === access.teacherUserId &&
    access.teacherVerificationStatus === VerificationStatus.APPROVED
  );
}

export function canJoinClassroom(access: ClassroomAccess) {
  if (!access.classActive) return false;
  return (
    canManageClassroom(access) ||
    (access.role === Role.PUPIL && access.enrolledPupil)
  );
}
