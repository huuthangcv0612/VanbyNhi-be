import * as runtime from "@prisma/client/runtime/client";
export const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export const PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export const PrismaClientValidationError = runtime.PrismaClientValidationError;
export const sql = runtime.sqltag;
export const empty = runtime.empty;
export const join = runtime.join;
export const raw = runtime.raw;
export const Sql = runtime.Sql;
export const Decimal = runtime.Decimal;
export const getExtensionContext = runtime.Extensions.getExtensionContext;
export const prismaVersion = {
    client: "7.10.0",
    engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
export const NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
export const DbNull = runtime.DbNull;
export const JsonNull = runtime.JsonNull;
export const AnyNull = runtime.AnyNull;
export const ModelName = {
    User: 'User',
    AuthAccount: 'AuthAccount',
    Class: 'Class',
    Enrollment: 'Enrollment',
    ClassSession: 'ClassSession',
    Attendance: 'Attendance',
    AttendanceChangeLog: 'AttendanceChangeLog',
    TuitionFee: 'TuitionFee',
    TuitionPayment: 'TuitionPayment',
    LessonRecord: 'LessonRecord',
    Assignment: 'Assignment',
    AssignmentSubmission: 'AssignmentSubmission',
    ClassMaterial: 'ClassMaterial',
    Notification: 'Notification',
    RefreshToken: 'RefreshToken'
};
export const TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
export const UserScalarFieldEnum = {
    id: 'id',
    fullName: 'fullName',
    phone: 'phone',
    passwordHash: 'passwordHash',
    email: 'email',
    avatarUrl: 'avatarUrl',
    dateOfBirth: 'dateOfBirth',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AuthAccountScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const ClassScalarFieldEnum = {
    id: 'id',
    name: 'name',
    description: 'description',
    classCode: 'classCode',
    defaultMeetUrl: 'defaultMeetUrl',
    monthlyTuition: 'monthlyTuition',
    status: 'status',
    createdById: 'createdById',
    teacherId: 'teacherId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const EnrollmentScalarFieldEnum = {
    id: 'id',
    classId: 'classId',
    studentId: 'studentId',
    tuitionOverride: 'tuitionOverride',
    status: 'status',
    joinedAt: 'joinedAt',
    leftAt: 'leftAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const ClassSessionScalarFieldEnum = {
    id: 'id',
    classId: 'classId',
    title: 'title',
    description: 'description',
    startTime: 'startTime',
    endTime: 'endTime',
    meetUrl: 'meetUrl',
    status: 'status',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AttendanceScalarFieldEnum = {
    id: 'id',
    sessionId: 'sessionId',
    studentId: 'studentId',
    status: 'status',
    checkedInAt: 'checkedInAt',
    markedById: 'markedById',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AttendanceChangeLogScalarFieldEnum = {
    id: 'id',
    attendanceId: 'attendanceId',
    oldStatus: 'oldStatus',
    newStatus: 'newStatus',
    changedById: 'changedById',
    reason: 'reason',
    changedAt: 'changedAt'
};
export const TuitionFeeScalarFieldEnum = {
    id: 'id',
    enrollmentId: 'enrollmentId',
    billingYear: 'billingYear',
    billingMonth: 'billingMonth',
    amountDue: 'amountDue',
    status: 'status',
    dueDate: 'dueDate',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const TuitionPaymentScalarFieldEnum = {
    id: 'id',
    tuitionFeeId: 'tuitionFeeId',
    amount: 'amount',
    paymentDate: 'paymentDate',
    paymentMethod: 'paymentMethod',
    isVoided: 'isVoided',
    voidedAt: 'voidedAt',
    voidReason: 'voidReason',
    voidedById: 'voidedById',
    recordedById: 'recordedById',
    note: 'note',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const LessonRecordScalarFieldEnum = {
    id: 'id',
    sessionId: 'sessionId',
    content: 'content',
    homeworkSummary: 'homeworkSummary',
    teacherNotes: 'teacherNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AssignmentScalarFieldEnum = {
    id: 'id',
    classId: 'classId',
    sessionId: 'sessionId',
    title: 'title',
    description: 'description',
    fileUrls: 'fileUrls',
    dueDate: 'dueDate',
    createdById: 'createdById',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const AssignmentSubmissionScalarFieldEnum = {
    id: 'id',
    assignmentId: 'assignmentId',
    studentId: 'studentId',
    attemptNumber: 'attemptNumber',
    content: 'content',
    fileUrls: 'fileUrls',
    externalUrl: 'externalUrl',
    submittedAt: 'submittedAt',
    score: 'score',
    feedback: 'feedback',
    gradedById: 'gradedById',
    gradedAt: 'gradedAt',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const ClassMaterialScalarFieldEnum = {
    id: 'id',
    classId: 'classId',
    sessionId: 'sessionId',
    uploadedById: 'uploadedById',
    title: 'title',
    description: 'description',
    type: 'type',
    fileUrl: 'fileUrl',
    externalUrl: 'externalUrl',
    originalName: 'originalName',
    mimeType: 'mimeType',
    fileSize: 'fileSize',
    publishedAt: 'publishedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
export const NotificationScalarFieldEnum = {
    id: 'id',
    recipientId: 'recipientId',
    title: 'title',
    content: 'content',
    type: 'type',
    isRead: 'isRead',
    readAt: 'readAt',
    referenceId: 'referenceId',
    createdAt: 'createdAt'
};
export const RefreshTokenScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    isRevoked: 'isRevoked',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
export const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
export const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
export const NullsOrder = {
    first: 'first',
    last: 'last'
};
export const defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map