import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AttendanceModel = runtime.Types.Result.DefaultSelection<Prisma.$AttendancePayload>;
export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null;
    _min: AttendanceMinAggregateOutputType | null;
    _max: AttendanceMaxAggregateOutputType | null;
};
export type AttendanceMinAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    studentId: string | null;
    status: $Enums.AttendanceStatus | null;
    checkedInAt: Date | null;
    markedById: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AttendanceMaxAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    studentId: string | null;
    status: $Enums.AttendanceStatus | null;
    checkedInAt: Date | null;
    markedById: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AttendanceCountAggregateOutputType = {
    id: number;
    sessionId: number;
    studentId: number;
    status: number;
    checkedInAt: number;
    markedById: number;
    note: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AttendanceMinAggregateInputType = {
    id?: true;
    sessionId?: true;
    studentId?: true;
    status?: true;
    checkedInAt?: true;
    markedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AttendanceMaxAggregateInputType = {
    id?: true;
    sessionId?: true;
    studentId?: true;
    status?: true;
    checkedInAt?: true;
    markedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AttendanceCountAggregateInputType = {
    id?: true;
    sessionId?: true;
    studentId?: true;
    status?: true;
    checkedInAt?: true;
    markedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AttendanceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AttendanceCountAggregateInputType;
    _min?: AttendanceMinAggregateInputType;
    _max?: AttendanceMaxAggregateInputType;
};
export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
    [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAttendance[P]> : Prisma.GetScalarType<T[P], AggregateAttendance[P]>;
};
export type AttendanceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithAggregationInput | Prisma.AttendanceOrderByWithAggregationInput[];
    by: Prisma.AttendanceScalarFieldEnum[] | Prisma.AttendanceScalarFieldEnum;
    having?: Prisma.AttendanceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AttendanceCountAggregateInputType | true;
    _min?: AttendanceMinAggregateInputType;
    _max?: AttendanceMaxAggregateInputType;
};
export type AttendanceGroupByOutputType = {
    id: string;
    sessionId: string;
    studentId: string;
    status: $Enums.AttendanceStatus;
    checkedInAt: Date | null;
    markedById: string | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: AttendanceCountAggregateOutputType | null;
    _min: AttendanceMinAggregateOutputType | null;
    _max: AttendanceMaxAggregateOutputType | null;
};
export type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AttendanceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AttendanceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AttendanceGroupByOutputType[P]>;
}>>;
export type AttendanceWhereInput = {
    AND?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    OR?: Prisma.AttendanceWhereInput[];
    NOT?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    id?: Prisma.StringFilter<"Attendance"> | string;
    sessionId?: Prisma.StringFilter<"Attendance"> | string;
    studentId?: Prisma.StringFilter<"Attendance"> | string;
    status?: Prisma.EnumAttendanceStatusFilter<"Attendance"> | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.DateTimeNullableFilter<"Attendance"> | Date | string | null;
    markedById?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    note?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
    session?: Prisma.XOR<Prisma.ClassSessionScalarRelationFilter, Prisma.ClassSessionWhereInput>;
    student?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    markedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    changeLogs?: Prisma.AttendanceChangeLogListRelationFilter;
};
export type AttendanceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    checkedInAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    markedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    session?: Prisma.ClassSessionOrderByWithRelationInput;
    student?: Prisma.UserOrderByWithRelationInput;
    markedBy?: Prisma.UserOrderByWithRelationInput;
    changeLogs?: Prisma.AttendanceChangeLogOrderByRelationAggregateInput;
};
export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    sessionId_studentId?: Prisma.AttendanceSessionIdStudentIdCompoundUniqueInput;
    AND?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    OR?: Prisma.AttendanceWhereInput[];
    NOT?: Prisma.AttendanceWhereInput | Prisma.AttendanceWhereInput[];
    sessionId?: Prisma.StringFilter<"Attendance"> | string;
    studentId?: Prisma.StringFilter<"Attendance"> | string;
    status?: Prisma.EnumAttendanceStatusFilter<"Attendance"> | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.DateTimeNullableFilter<"Attendance"> | Date | string | null;
    markedById?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    note?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
    session?: Prisma.XOR<Prisma.ClassSessionScalarRelationFilter, Prisma.ClassSessionWhereInput>;
    student?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    markedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
    changeLogs?: Prisma.AttendanceChangeLogListRelationFilter;
}, "id" | "sessionId_studentId">;
export type AttendanceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    checkedInAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    markedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AttendanceCountOrderByAggregateInput;
    _max?: Prisma.AttendanceMaxOrderByAggregateInput;
    _min?: Prisma.AttendanceMinOrderByAggregateInput;
};
export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: Prisma.AttendanceScalarWhereWithAggregatesInput | Prisma.AttendanceScalarWhereWithAggregatesInput[];
    OR?: Prisma.AttendanceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AttendanceScalarWhereWithAggregatesInput | Prisma.AttendanceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Attendance"> | string;
    sessionId?: Prisma.StringWithAggregatesFilter<"Attendance"> | string;
    studentId?: Prisma.StringWithAggregatesFilter<"Attendance"> | string;
    status?: Prisma.EnumAttendanceStatusWithAggregatesFilter<"Attendance"> | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Attendance"> | Date | string | null;
    markedById?: Prisma.StringNullableWithAggregatesFilter<"Attendance"> | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"Attendance"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Attendance"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Attendance"> | Date | string;
};
export type AttendanceCreateInput = {
    id?: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.ClassSessionCreateNestedOneWithoutAttendancesInput;
    student: Prisma.UserCreateNestedOneWithoutAttendancesInput;
    markedBy?: Prisma.UserCreateNestedOneWithoutMarkedAttendancesInput;
    changeLogs?: Prisma.AttendanceChangeLogCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateInput = {
    id?: string;
    sessionId: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneRequiredWithoutAttendancesNestedInput;
    student?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
    markedBy?: Prisma.UserUpdateOneWithoutMarkedAttendancesNestedInput;
    changeLogs?: Prisma.AttendanceChangeLogUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceCreateManyInput = {
    id?: string;
    sessionId: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AttendanceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceListRelationFilter = {
    every?: Prisma.AttendanceWhereInput;
    some?: Prisma.AttendanceWhereInput;
    none?: Prisma.AttendanceWhereInput;
};
export type AttendanceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AttendanceSessionIdStudentIdCompoundUniqueInput = {
    sessionId: string;
    studentId: string;
};
export type AttendanceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    checkedInAt?: Prisma.SortOrder;
    markedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AttendanceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    checkedInAt?: Prisma.SortOrder;
    markedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AttendanceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    checkedInAt?: Prisma.SortOrder;
    markedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AttendanceScalarRelationFilter = {
    is?: Prisma.AttendanceWhereInput;
    isNot?: Prisma.AttendanceWhereInput;
};
export type AttendanceCreateNestedManyWithoutStudentInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput> | Prisma.AttendanceCreateWithoutStudentInput[] | Prisma.AttendanceUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutStudentInput | Prisma.AttendanceCreateOrConnectWithoutStudentInput[];
    createMany?: Prisma.AttendanceCreateManyStudentInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceCreateNestedManyWithoutMarkedByInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput> | Prisma.AttendanceCreateWithoutMarkedByInput[] | Prisma.AttendanceUncheckedCreateWithoutMarkedByInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutMarkedByInput | Prisma.AttendanceCreateOrConnectWithoutMarkedByInput[];
    createMany?: Prisma.AttendanceCreateManyMarkedByInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUncheckedCreateNestedManyWithoutStudentInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput> | Prisma.AttendanceCreateWithoutStudentInput[] | Prisma.AttendanceUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutStudentInput | Prisma.AttendanceCreateOrConnectWithoutStudentInput[];
    createMany?: Prisma.AttendanceCreateManyStudentInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUncheckedCreateNestedManyWithoutMarkedByInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput> | Prisma.AttendanceCreateWithoutMarkedByInput[] | Prisma.AttendanceUncheckedCreateWithoutMarkedByInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutMarkedByInput | Prisma.AttendanceCreateOrConnectWithoutMarkedByInput[];
    createMany?: Prisma.AttendanceCreateManyMarkedByInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUpdateManyWithoutStudentNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput> | Prisma.AttendanceCreateWithoutStudentInput[] | Prisma.AttendanceUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutStudentInput | Prisma.AttendanceCreateOrConnectWithoutStudentInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutStudentInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: Prisma.AttendanceCreateManyStudentInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutStudentInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutStudentInput | Prisma.AttendanceUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUpdateManyWithoutMarkedByNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput> | Prisma.AttendanceCreateWithoutMarkedByInput[] | Prisma.AttendanceUncheckedCreateWithoutMarkedByInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutMarkedByInput | Prisma.AttendanceCreateOrConnectWithoutMarkedByInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutMarkedByInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutMarkedByInput[];
    createMany?: Prisma.AttendanceCreateManyMarkedByInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutMarkedByInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutMarkedByInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutMarkedByInput | Prisma.AttendanceUpdateManyWithWhereWithoutMarkedByInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput> | Prisma.AttendanceCreateWithoutStudentInput[] | Prisma.AttendanceUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutStudentInput | Prisma.AttendanceCreateOrConnectWithoutStudentInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutStudentInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: Prisma.AttendanceCreateManyStudentInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutStudentInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutStudentInput | Prisma.AttendanceUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUncheckedUpdateManyWithoutMarkedByNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput> | Prisma.AttendanceCreateWithoutMarkedByInput[] | Prisma.AttendanceUncheckedCreateWithoutMarkedByInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutMarkedByInput | Prisma.AttendanceCreateOrConnectWithoutMarkedByInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutMarkedByInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutMarkedByInput[];
    createMany?: Prisma.AttendanceCreateManyMarkedByInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutMarkedByInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutMarkedByInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutMarkedByInput | Prisma.AttendanceUpdateManyWithWhereWithoutMarkedByInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput> | Prisma.AttendanceCreateWithoutSessionInput[] | Prisma.AttendanceUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutSessionInput | Prisma.AttendanceCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.AttendanceCreateManySessionInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUncheckedCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput> | Prisma.AttendanceCreateWithoutSessionInput[] | Prisma.AttendanceUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutSessionInput | Prisma.AttendanceCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.AttendanceCreateManySessionInputEnvelope;
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
};
export type AttendanceUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput> | Prisma.AttendanceCreateWithoutSessionInput[] | Prisma.AttendanceUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutSessionInput | Prisma.AttendanceCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutSessionInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.AttendanceCreateManySessionInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutSessionInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutSessionInput | Prisma.AttendanceUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type AttendanceUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput> | Prisma.AttendanceCreateWithoutSessionInput[] | Prisma.AttendanceUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutSessionInput | Prisma.AttendanceCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.AttendanceUpsertWithWhereUniqueWithoutSessionInput | Prisma.AttendanceUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.AttendanceCreateManySessionInputEnvelope;
    set?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    disconnect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    delete?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    connect?: Prisma.AttendanceWhereUniqueInput | Prisma.AttendanceWhereUniqueInput[];
    update?: Prisma.AttendanceUpdateWithWhereUniqueWithoutSessionInput | Prisma.AttendanceUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.AttendanceUpdateManyWithWhereWithoutSessionInput | Prisma.AttendanceUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
};
export type EnumAttendanceStatusFieldUpdateOperationsInput = {
    set?: $Enums.AttendanceStatus;
};
export type AttendanceCreateNestedOneWithoutChangeLogsInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutChangeLogsInput, Prisma.AttendanceUncheckedCreateWithoutChangeLogsInput>;
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutChangeLogsInput;
    connect?: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceUpdateOneRequiredWithoutChangeLogsNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceCreateWithoutChangeLogsInput, Prisma.AttendanceUncheckedCreateWithoutChangeLogsInput>;
    connectOrCreate?: Prisma.AttendanceCreateOrConnectWithoutChangeLogsInput;
    upsert?: Prisma.AttendanceUpsertWithoutChangeLogsInput;
    connect?: Prisma.AttendanceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AttendanceUpdateToOneWithWhereWithoutChangeLogsInput, Prisma.AttendanceUpdateWithoutChangeLogsInput>, Prisma.AttendanceUncheckedUpdateWithoutChangeLogsInput>;
};
export type AttendanceCreateWithoutStudentInput = {
    id?: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.ClassSessionCreateNestedOneWithoutAttendancesInput;
    markedBy?: Prisma.UserCreateNestedOneWithoutMarkedAttendancesInput;
    changeLogs?: Prisma.AttendanceChangeLogCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateWithoutStudentInput = {
    id?: string;
    sessionId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceCreateOrConnectWithoutStudentInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput>;
};
export type AttendanceCreateManyStudentInputEnvelope = {
    data: Prisma.AttendanceCreateManyStudentInput | Prisma.AttendanceCreateManyStudentInput[];
    skipDuplicates?: boolean;
};
export type AttendanceCreateWithoutMarkedByInput = {
    id?: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.ClassSessionCreateNestedOneWithoutAttendancesInput;
    student: Prisma.UserCreateNestedOneWithoutAttendancesInput;
    changeLogs?: Prisma.AttendanceChangeLogCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateWithoutMarkedByInput = {
    id?: string;
    sessionId: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceCreateOrConnectWithoutMarkedByInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput>;
};
export type AttendanceCreateManyMarkedByInputEnvelope = {
    data: Prisma.AttendanceCreateManyMarkedByInput | Prisma.AttendanceCreateManyMarkedByInput[];
    skipDuplicates?: boolean;
};
export type AttendanceUpsertWithWhereUniqueWithoutStudentInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutStudentInput, Prisma.AttendanceUncheckedUpdateWithoutStudentInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutStudentInput, Prisma.AttendanceUncheckedCreateWithoutStudentInput>;
};
export type AttendanceUpdateWithWhereUniqueWithoutStudentInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutStudentInput, Prisma.AttendanceUncheckedUpdateWithoutStudentInput>;
};
export type AttendanceUpdateManyWithWhereWithoutStudentInput = {
    where: Prisma.AttendanceScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyWithoutStudentInput>;
};
export type AttendanceScalarWhereInput = {
    AND?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
    OR?: Prisma.AttendanceScalarWhereInput[];
    NOT?: Prisma.AttendanceScalarWhereInput | Prisma.AttendanceScalarWhereInput[];
    id?: Prisma.StringFilter<"Attendance"> | string;
    sessionId?: Prisma.StringFilter<"Attendance"> | string;
    studentId?: Prisma.StringFilter<"Attendance"> | string;
    status?: Prisma.EnumAttendanceStatusFilter<"Attendance"> | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.DateTimeNullableFilter<"Attendance"> | Date | string | null;
    markedById?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    note?: Prisma.StringNullableFilter<"Attendance"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Attendance"> | Date | string;
};
export type AttendanceUpsertWithWhereUniqueWithoutMarkedByInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutMarkedByInput, Prisma.AttendanceUncheckedUpdateWithoutMarkedByInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutMarkedByInput, Prisma.AttendanceUncheckedCreateWithoutMarkedByInput>;
};
export type AttendanceUpdateWithWhereUniqueWithoutMarkedByInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutMarkedByInput, Prisma.AttendanceUncheckedUpdateWithoutMarkedByInput>;
};
export type AttendanceUpdateManyWithWhereWithoutMarkedByInput = {
    where: Prisma.AttendanceScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyWithoutMarkedByInput>;
};
export type AttendanceCreateWithoutSessionInput = {
    id?: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    student: Prisma.UserCreateNestedOneWithoutAttendancesInput;
    markedBy?: Prisma.UserCreateNestedOneWithoutMarkedAttendancesInput;
    changeLogs?: Prisma.AttendanceChangeLogCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceUncheckedCreateWithoutSessionInput = {
    id?: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedCreateNestedManyWithoutAttendanceInput;
};
export type AttendanceCreateOrConnectWithoutSessionInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput>;
};
export type AttendanceCreateManySessionInputEnvelope = {
    data: Prisma.AttendanceCreateManySessionInput | Prisma.AttendanceCreateManySessionInput[];
    skipDuplicates?: boolean;
};
export type AttendanceUpsertWithWhereUniqueWithoutSessionInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutSessionInput, Prisma.AttendanceUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutSessionInput, Prisma.AttendanceUncheckedCreateWithoutSessionInput>;
};
export type AttendanceUpdateWithWhereUniqueWithoutSessionInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutSessionInput, Prisma.AttendanceUncheckedUpdateWithoutSessionInput>;
};
export type AttendanceUpdateManyWithWhereWithoutSessionInput = {
    where: Prisma.AttendanceScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyWithoutSessionInput>;
};
export type AttendanceCreateWithoutChangeLogsInput = {
    id?: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.ClassSessionCreateNestedOneWithoutAttendancesInput;
    student: Prisma.UserCreateNestedOneWithoutAttendancesInput;
    markedBy?: Prisma.UserCreateNestedOneWithoutMarkedAttendancesInput;
};
export type AttendanceUncheckedCreateWithoutChangeLogsInput = {
    id?: string;
    sessionId: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AttendanceCreateOrConnectWithoutChangeLogsInput = {
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutChangeLogsInput, Prisma.AttendanceUncheckedCreateWithoutChangeLogsInput>;
};
export type AttendanceUpsertWithoutChangeLogsInput = {
    update: Prisma.XOR<Prisma.AttendanceUpdateWithoutChangeLogsInput, Prisma.AttendanceUncheckedUpdateWithoutChangeLogsInput>;
    create: Prisma.XOR<Prisma.AttendanceCreateWithoutChangeLogsInput, Prisma.AttendanceUncheckedCreateWithoutChangeLogsInput>;
    where?: Prisma.AttendanceWhereInput;
};
export type AttendanceUpdateToOneWithWhereWithoutChangeLogsInput = {
    where?: Prisma.AttendanceWhereInput;
    data: Prisma.XOR<Prisma.AttendanceUpdateWithoutChangeLogsInput, Prisma.AttendanceUncheckedUpdateWithoutChangeLogsInput>;
};
export type AttendanceUpdateWithoutChangeLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneRequiredWithoutAttendancesNestedInput;
    student?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
    markedBy?: Prisma.UserUpdateOneWithoutMarkedAttendancesNestedInput;
};
export type AttendanceUncheckedUpdateWithoutChangeLogsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceCreateManyStudentInput = {
    id?: string;
    sessionId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AttendanceCreateManyMarkedByInput = {
    id?: string;
    sessionId: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AttendanceUpdateWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneRequiredWithoutAttendancesNestedInput;
    markedBy?: Prisma.UserUpdateOneWithoutMarkedAttendancesNestedInput;
    changeLogs?: Prisma.AttendanceChangeLogUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateManyWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceUpdateWithoutMarkedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneRequiredWithoutAttendancesNestedInput;
    student?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
    changeLogs?: Prisma.AttendanceChangeLogUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateWithoutMarkedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateManyWithoutMarkedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceCreateManySessionInput = {
    id?: string;
    studentId: string;
    status?: $Enums.AttendanceStatus;
    checkedInAt?: Date | string | null;
    markedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AttendanceUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    student?: Prisma.UserUpdateOneRequiredWithoutAttendancesNestedInput;
    markedBy?: Prisma.UserUpdateOneWithoutMarkedAttendancesNestedInput;
    changeLogs?: Prisma.AttendanceChangeLogUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changeLogs?: Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceNestedInput;
};
export type AttendanceUncheckedUpdateManyWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    checkedInAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    markedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceCountOutputType = {
    changeLogs: number;
};
export type AttendanceCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    changeLogs?: boolean | AttendanceCountOutputTypeCountChangeLogsArgs;
};
export type AttendanceCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceCountOutputTypeSelect<ExtArgs> | null;
};
export type AttendanceCountOutputTypeCountChangeLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceChangeLogWhereInput;
};
export type AttendanceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    studentId?: boolean;
    status?: boolean;
    checkedInAt?: boolean;
    markedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
    changeLogs?: boolean | Prisma.Attendance$changeLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.AttendanceCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attendance"]>;
export type AttendanceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    studentId?: boolean;
    status?: boolean;
    checkedInAt?: boolean;
    markedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
}, ExtArgs["result"]["attendance"]>;
export type AttendanceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    studentId?: boolean;
    status?: boolean;
    checkedInAt?: boolean;
    markedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
}, ExtArgs["result"]["attendance"]>;
export type AttendanceSelectScalar = {
    id?: boolean;
    sessionId?: boolean;
    studentId?: boolean;
    status?: boolean;
    checkedInAt?: boolean;
    markedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AttendanceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessionId" | "studentId" | "status" | "checkedInAt" | "markedById" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["attendance"]>;
export type AttendanceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
    changeLogs?: boolean | Prisma.Attendance$changeLogsArgs<ExtArgs>;
    _count?: boolean | Prisma.AttendanceCountOutputTypeDefaultArgs<ExtArgs>;
};
export type AttendanceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
};
export type AttendanceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    markedBy?: boolean | Prisma.Attendance$markedByArgs<ExtArgs>;
};
export type $AttendancePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Attendance";
    objects: {
        session: Prisma.$ClassSessionPayload<ExtArgs>;
        student: Prisma.$UserPayload<ExtArgs>;
        markedBy: Prisma.$UserPayload<ExtArgs> | null;
        changeLogs: Prisma.$AttendanceChangeLogPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sessionId: string;
        studentId: string;
        status: $Enums.AttendanceStatus;
        checkedInAt: Date | null;
        markedById: string | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["attendance"]>;
    composites: {};
};
export type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AttendancePayload, S>;
export type AttendanceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AttendanceCountAggregateInputType | true;
};
export interface AttendanceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Attendance'];
        meta: {
            name: 'Attendance';
        };
    };
    findUnique<T extends AttendanceFindUniqueArgs>(args: Prisma.SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AttendanceFindFirstArgs>(args?: Prisma.SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AttendanceFindManyArgs>(args?: Prisma.SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AttendanceCreateArgs>(args: Prisma.SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AttendanceCreateManyArgs>(args?: Prisma.SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AttendanceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AttendanceDeleteArgs>(args: Prisma.SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AttendanceUpdateArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: Prisma.SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AttendanceUpdateManyArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AttendanceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AttendanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AttendanceUpsertArgs>(args: Prisma.SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AttendanceCountArgs>(args?: Prisma.Subset<T, AttendanceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AttendanceCountAggregateOutputType> : number>;
    aggregate<T extends AttendanceAggregateArgs>(args: Prisma.Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>;
    groupBy<T extends AttendanceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AttendanceGroupByArgs['orderBy'];
    } : {
        orderBy?: AttendanceGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AttendanceFieldRefs;
}
export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    session<T extends Prisma.ClassSessionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSessionDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    student<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    markedBy<T extends Prisma.Attendance$markedByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Attendance$markedByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    changeLogs<T extends Prisma.Attendance$changeLogsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Attendance$changeLogsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AttendanceFieldRefs {
    readonly id: Prisma.FieldRef<"Attendance", 'String'>;
    readonly sessionId: Prisma.FieldRef<"Attendance", 'String'>;
    readonly studentId: Prisma.FieldRef<"Attendance", 'String'>;
    readonly status: Prisma.FieldRef<"Attendance", 'AttendanceStatus'>;
    readonly checkedInAt: Prisma.FieldRef<"Attendance", 'DateTime'>;
    readonly markedById: Prisma.FieldRef<"Attendance", 'String'>;
    readonly note: Prisma.FieldRef<"Attendance", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Attendance", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Attendance", 'DateTime'>;
}
export type AttendanceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttendanceScalarFieldEnum | Prisma.AttendanceScalarFieldEnum[];
};
export type AttendanceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttendanceScalarFieldEnum | Prisma.AttendanceScalarFieldEnum[];
};
export type AttendanceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where?: Prisma.AttendanceWhereInput;
    orderBy?: Prisma.AttendanceOrderByWithRelationInput | Prisma.AttendanceOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttendanceScalarFieldEnum | Prisma.AttendanceScalarFieldEnum[];
};
export type AttendanceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceCreateInput, Prisma.AttendanceUncheckedCreateInput>;
};
export type AttendanceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AttendanceCreateManyInput | Prisma.AttendanceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AttendanceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    data: Prisma.AttendanceCreateManyInput | Prisma.AttendanceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AttendanceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AttendanceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceUpdateInput, Prisma.AttendanceUncheckedUpdateInput>;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
};
export type AttendanceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceUpdateManyMutationInput, Prisma.AttendanceUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
    include?: Prisma.AttendanceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AttendanceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceCreateInput, Prisma.AttendanceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AttendanceUpdateInput, Prisma.AttendanceUncheckedUpdateInput>;
};
export type AttendanceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
    where: Prisma.AttendanceWhereUniqueInput;
};
export type AttendanceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
    limit?: number;
};
export type Attendance$markedByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type Attendance$changeLogsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    where?: Prisma.AttendanceChangeLogWhereInput;
    orderBy?: Prisma.AttendanceChangeLogOrderByWithRelationInput | Prisma.AttendanceChangeLogOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceChangeLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AttendanceChangeLogScalarFieldEnum | Prisma.AttendanceChangeLogScalarFieldEnum[];
};
export type AttendanceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceOmit<ExtArgs> | null;
    include?: Prisma.AttendanceInclude<ExtArgs> | null;
};
