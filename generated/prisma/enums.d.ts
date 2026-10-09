export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly TEACHER: "TEACHER";
    readonly STUDENT: "STUDENT";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const ClassStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly COMPLETED: "COMPLETED";
};
export type ClassStatus = (typeof ClassStatus)[keyof typeof ClassStatus];
export declare const MemberStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly INACTIVE: "INACTIVE";
    readonly LEFT: "LEFT";
};
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];
export declare const SessionStatus: {
    readonly SCHEDULED: "SCHEDULED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
};
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];
export declare const AttendanceStatus: {
    readonly PRESENT: "PRESENT";
    readonly ABSENT: "ABSENT";
    readonly LATE: "LATE";
};
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];
export declare const MaterialType: {
    readonly DOCUMENT: "DOCUMENT";
    readonly RECORDING: "RECORDING";
    readonly IMAGE: "IMAGE";
    readonly LINK: "LINK";
    readonly OTHER: "OTHER";
};
export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType];
export declare const TuitionStatus: {
    readonly UNPAID: "UNPAID";
    readonly PARTIAL: "PARTIAL";
    readonly PAID: "PAID";
    readonly OVERDUE: "OVERDUE";
};
export type TuitionStatus = (typeof TuitionStatus)[keyof typeof TuitionStatus];
export declare const AssignmentStatus: {
    readonly SUBMITTED: "SUBMITTED";
    readonly GRADED: "GRADED";
    readonly RESUBMIT_REQUESTED: "RESUBMIT_REQUESTED";
};
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];
export declare const NotificationType: {
    readonly TUITION: "TUITION";
    readonly SESSION: "SESSION";
    readonly ASSIGNMENT: "ASSIGNMENT";
    readonly ATTENDANCE: "ATTENDANCE";
    readonly SYSTEM: "SYSTEM";
};
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
