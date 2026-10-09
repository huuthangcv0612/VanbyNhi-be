import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AttendanceChangeLogModel = runtime.Types.Result.DefaultSelection<Prisma.$AttendanceChangeLogPayload>;
export type AggregateAttendanceChangeLog = {
    _count: AttendanceChangeLogCountAggregateOutputType | null;
    _min: AttendanceChangeLogMinAggregateOutputType | null;
    _max: AttendanceChangeLogMaxAggregateOutputType | null;
};
export type AttendanceChangeLogMinAggregateOutputType = {
    id: string | null;
    attendanceId: string | null;
    oldStatus: $Enums.AttendanceStatus | null;
    newStatus: $Enums.AttendanceStatus | null;
    changedById: string | null;
    reason: string | null;
    changedAt: Date | null;
};
export type AttendanceChangeLogMaxAggregateOutputType = {
    id: string | null;
    attendanceId: string | null;
    oldStatus: $Enums.AttendanceStatus | null;
    newStatus: $Enums.AttendanceStatus | null;
    changedById: string | null;
    reason: string | null;
    changedAt: Date | null;
};
export type AttendanceChangeLogCountAggregateOutputType = {
    id: number;
    attendanceId: number;
    oldStatus: number;
    newStatus: number;
    changedById: number;
    reason: number;
    changedAt: number;
    _all: number;
};
export type AttendanceChangeLogMinAggregateInputType = {
    id?: true;
    attendanceId?: true;
    oldStatus?: true;
    newStatus?: true;
    changedById?: true;
    reason?: true;
    changedAt?: true;
};
export type AttendanceChangeLogMaxAggregateInputType = {
    id?: true;
    attendanceId?: true;
    oldStatus?: true;
    newStatus?: true;
    changedById?: true;
    reason?: true;
    changedAt?: true;
};
export type AttendanceChangeLogCountAggregateInputType = {
    id?: true;
    attendanceId?: true;
    oldStatus?: true;
    newStatus?: true;
    changedById?: true;
    reason?: true;
    changedAt?: true;
    _all?: true;
};
export type AttendanceChangeLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceChangeLogWhereInput;
    orderBy?: Prisma.AttendanceChangeLogOrderByWithRelationInput | Prisma.AttendanceChangeLogOrderByWithRelationInput[];
    cursor?: Prisma.AttendanceChangeLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AttendanceChangeLogCountAggregateInputType;
    _min?: AttendanceChangeLogMinAggregateInputType;
    _max?: AttendanceChangeLogMaxAggregateInputType;
};
export type GetAttendanceChangeLogAggregateType<T extends AttendanceChangeLogAggregateArgs> = {
    [P in keyof T & keyof AggregateAttendanceChangeLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAttendanceChangeLog[P]> : Prisma.GetScalarType<T[P], AggregateAttendanceChangeLog[P]>;
};
export type AttendanceChangeLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceChangeLogWhereInput;
    orderBy?: Prisma.AttendanceChangeLogOrderByWithAggregationInput | Prisma.AttendanceChangeLogOrderByWithAggregationInput[];
    by: Prisma.AttendanceChangeLogScalarFieldEnum[] | Prisma.AttendanceChangeLogScalarFieldEnum;
    having?: Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AttendanceChangeLogCountAggregateInputType | true;
    _min?: AttendanceChangeLogMinAggregateInputType;
    _max?: AttendanceChangeLogMaxAggregateInputType;
};
export type AttendanceChangeLogGroupByOutputType = {
    id: string;
    attendanceId: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    changedById: string;
    reason: string | null;
    changedAt: Date;
    _count: AttendanceChangeLogCountAggregateOutputType | null;
    _min: AttendanceChangeLogMinAggregateOutputType | null;
    _max: AttendanceChangeLogMaxAggregateOutputType | null;
};
export type GetAttendanceChangeLogGroupByPayload<T extends AttendanceChangeLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AttendanceChangeLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AttendanceChangeLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AttendanceChangeLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AttendanceChangeLogGroupByOutputType[P]>;
}>>;
export type AttendanceChangeLogWhereInput = {
    AND?: Prisma.AttendanceChangeLogWhereInput | Prisma.AttendanceChangeLogWhereInput[];
    OR?: Prisma.AttendanceChangeLogWhereInput[];
    NOT?: Prisma.AttendanceChangeLogWhereInput | Prisma.AttendanceChangeLogWhereInput[];
    id?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    attendanceId?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    oldStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    reason?: Prisma.StringNullableFilter<"AttendanceChangeLog"> | string | null;
    changedAt?: Prisma.DateTimeFilter<"AttendanceChangeLog"> | Date | string;
    attendance?: Prisma.XOR<Prisma.AttendanceScalarRelationFilter, Prisma.AttendanceWhereInput>;
    changedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type AttendanceChangeLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    attendanceId?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    changedById?: Prisma.SortOrder;
    reason?: Prisma.SortOrderInput | Prisma.SortOrder;
    changedAt?: Prisma.SortOrder;
    attendance?: Prisma.AttendanceOrderByWithRelationInput;
    changedBy?: Prisma.UserOrderByWithRelationInput;
};
export type AttendanceChangeLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AttendanceChangeLogWhereInput | Prisma.AttendanceChangeLogWhereInput[];
    OR?: Prisma.AttendanceChangeLogWhereInput[];
    NOT?: Prisma.AttendanceChangeLogWhereInput | Prisma.AttendanceChangeLogWhereInput[];
    attendanceId?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    oldStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    reason?: Prisma.StringNullableFilter<"AttendanceChangeLog"> | string | null;
    changedAt?: Prisma.DateTimeFilter<"AttendanceChangeLog"> | Date | string;
    attendance?: Prisma.XOR<Prisma.AttendanceScalarRelationFilter, Prisma.AttendanceWhereInput>;
    changedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type AttendanceChangeLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    attendanceId?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    changedById?: Prisma.SortOrder;
    reason?: Prisma.SortOrderInput | Prisma.SortOrder;
    changedAt?: Prisma.SortOrder;
    _count?: Prisma.AttendanceChangeLogCountOrderByAggregateInput;
    _max?: Prisma.AttendanceChangeLogMaxOrderByAggregateInput;
    _min?: Prisma.AttendanceChangeLogMinOrderByAggregateInput;
};
export type AttendanceChangeLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput | Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput | Prisma.AttendanceChangeLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AttendanceChangeLog"> | string;
    attendanceId?: Prisma.StringWithAggregatesFilter<"AttendanceChangeLog"> | string;
    oldStatus?: Prisma.EnumAttendanceStatusWithAggregatesFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusWithAggregatesFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    changedById?: Prisma.StringWithAggregatesFilter<"AttendanceChangeLog"> | string;
    reason?: Prisma.StringNullableWithAggregatesFilter<"AttendanceChangeLog"> | string | null;
    changedAt?: Prisma.DateTimeWithAggregatesFilter<"AttendanceChangeLog"> | Date | string;
};
export type AttendanceChangeLogCreateInput = {
    id?: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    reason?: string | null;
    changedAt?: Date | string;
    attendance: Prisma.AttendanceCreateNestedOneWithoutChangeLogsInput;
    changedBy: Prisma.UserCreateNestedOneWithoutAttendanceChangesInput;
};
export type AttendanceChangeLogUncheckedCreateInput = {
    id?: string;
    attendanceId: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    changedById: string;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendance?: Prisma.AttendanceUpdateOneRequiredWithoutChangeLogsNestedInput;
    changedBy?: Prisma.UserUpdateOneRequiredWithoutAttendanceChangesNestedInput;
};
export type AttendanceChangeLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attendanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFieldUpdateOperationsInput | string;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogCreateManyInput = {
    id?: string;
    attendanceId: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    changedById: string;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attendanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFieldUpdateOperationsInput | string;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogListRelationFilter = {
    every?: Prisma.AttendanceChangeLogWhereInput;
    some?: Prisma.AttendanceChangeLogWhereInput;
    none?: Prisma.AttendanceChangeLogWhereInput;
};
export type AttendanceChangeLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AttendanceChangeLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    attendanceId?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    changedById?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    changedAt?: Prisma.SortOrder;
};
export type AttendanceChangeLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    attendanceId?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    changedById?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    changedAt?: Prisma.SortOrder;
};
export type AttendanceChangeLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    attendanceId?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    changedById?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    changedAt?: Prisma.SortOrder;
};
export type AttendanceChangeLogCreateNestedManyWithoutChangedByInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput> | Prisma.AttendanceChangeLogCreateWithoutChangedByInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyChangedByInputEnvelope;
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
};
export type AttendanceChangeLogUncheckedCreateNestedManyWithoutChangedByInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput> | Prisma.AttendanceChangeLogCreateWithoutChangedByInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyChangedByInputEnvelope;
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
};
export type AttendanceChangeLogUpdateManyWithoutChangedByNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput> | Prisma.AttendanceChangeLogCreateWithoutChangedByInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput[];
    upsert?: Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutChangedByInput | Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutChangedByInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyChangedByInputEnvelope;
    set?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    disconnect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    delete?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    update?: Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutChangedByInput | Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutChangedByInput[];
    updateMany?: Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutChangedByInput | Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutChangedByInput[];
    deleteMany?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
};
export type AttendanceChangeLogUncheckedUpdateManyWithoutChangedByNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput> | Prisma.AttendanceChangeLogCreateWithoutChangedByInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutChangedByInput[];
    upsert?: Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutChangedByInput | Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutChangedByInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyChangedByInputEnvelope;
    set?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    disconnect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    delete?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    update?: Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutChangedByInput | Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutChangedByInput[];
    updateMany?: Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutChangedByInput | Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutChangedByInput[];
    deleteMany?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
};
export type AttendanceChangeLogCreateNestedManyWithoutAttendanceInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput> | Prisma.AttendanceChangeLogCreateWithoutAttendanceInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyAttendanceInputEnvelope;
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
};
export type AttendanceChangeLogUncheckedCreateNestedManyWithoutAttendanceInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput> | Prisma.AttendanceChangeLogCreateWithoutAttendanceInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyAttendanceInputEnvelope;
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
};
export type AttendanceChangeLogUpdateManyWithoutAttendanceNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput> | Prisma.AttendanceChangeLogCreateWithoutAttendanceInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput[];
    upsert?: Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutAttendanceInput | Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutAttendanceInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyAttendanceInputEnvelope;
    set?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    disconnect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    delete?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    update?: Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutAttendanceInput | Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutAttendanceInput[];
    updateMany?: Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutAttendanceInput | Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutAttendanceInput[];
    deleteMany?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
};
export type AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceNestedInput = {
    create?: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput> | Prisma.AttendanceChangeLogCreateWithoutAttendanceInput[] | Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput[];
    connectOrCreate?: Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput | Prisma.AttendanceChangeLogCreateOrConnectWithoutAttendanceInput[];
    upsert?: Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutAttendanceInput | Prisma.AttendanceChangeLogUpsertWithWhereUniqueWithoutAttendanceInput[];
    createMany?: Prisma.AttendanceChangeLogCreateManyAttendanceInputEnvelope;
    set?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    disconnect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    delete?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    connect?: Prisma.AttendanceChangeLogWhereUniqueInput | Prisma.AttendanceChangeLogWhereUniqueInput[];
    update?: Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutAttendanceInput | Prisma.AttendanceChangeLogUpdateWithWhereUniqueWithoutAttendanceInput[];
    updateMany?: Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutAttendanceInput | Prisma.AttendanceChangeLogUpdateManyWithWhereWithoutAttendanceInput[];
    deleteMany?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
};
export type AttendanceChangeLogCreateWithoutChangedByInput = {
    id?: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    reason?: string | null;
    changedAt?: Date | string;
    attendance: Prisma.AttendanceCreateNestedOneWithoutChangeLogsInput;
};
export type AttendanceChangeLogUncheckedCreateWithoutChangedByInput = {
    id?: string;
    attendanceId: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogCreateOrConnectWithoutChangedByInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput>;
};
export type AttendanceChangeLogCreateManyChangedByInputEnvelope = {
    data: Prisma.AttendanceChangeLogCreateManyChangedByInput | Prisma.AttendanceChangeLogCreateManyChangedByInput[];
    skipDuplicates?: boolean;
};
export type AttendanceChangeLogUpsertWithWhereUniqueWithoutChangedByInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceChangeLogUpdateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedUpdateWithoutChangedByInput>;
    create: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutChangedByInput>;
};
export type AttendanceChangeLogUpdateWithWhereUniqueWithoutChangedByInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateWithoutChangedByInput, Prisma.AttendanceChangeLogUncheckedUpdateWithoutChangedByInput>;
};
export type AttendanceChangeLogUpdateManyWithWhereWithoutChangedByInput = {
    where: Prisma.AttendanceChangeLogScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateManyMutationInput, Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutChangedByInput>;
};
export type AttendanceChangeLogScalarWhereInput = {
    AND?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
    OR?: Prisma.AttendanceChangeLogScalarWhereInput[];
    NOT?: Prisma.AttendanceChangeLogScalarWhereInput | Prisma.AttendanceChangeLogScalarWhereInput[];
    id?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    attendanceId?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    oldStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFilter<"AttendanceChangeLog"> | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFilter<"AttendanceChangeLog"> | string;
    reason?: Prisma.StringNullableFilter<"AttendanceChangeLog"> | string | null;
    changedAt?: Prisma.DateTimeFilter<"AttendanceChangeLog"> | Date | string;
};
export type AttendanceChangeLogCreateWithoutAttendanceInput = {
    id?: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    reason?: string | null;
    changedAt?: Date | string;
    changedBy: Prisma.UserCreateNestedOneWithoutAttendanceChangesInput;
};
export type AttendanceChangeLogUncheckedCreateWithoutAttendanceInput = {
    id?: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    changedById: string;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogCreateOrConnectWithoutAttendanceInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput>;
};
export type AttendanceChangeLogCreateManyAttendanceInputEnvelope = {
    data: Prisma.AttendanceChangeLogCreateManyAttendanceInput | Prisma.AttendanceChangeLogCreateManyAttendanceInput[];
    skipDuplicates?: boolean;
};
export type AttendanceChangeLogUpsertWithWhereUniqueWithoutAttendanceInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.AttendanceChangeLogUpdateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedUpdateWithoutAttendanceInput>;
    create: Prisma.XOR<Prisma.AttendanceChangeLogCreateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedCreateWithoutAttendanceInput>;
};
export type AttendanceChangeLogUpdateWithWhereUniqueWithoutAttendanceInput = {
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateWithoutAttendanceInput, Prisma.AttendanceChangeLogUncheckedUpdateWithoutAttendanceInput>;
};
export type AttendanceChangeLogUpdateManyWithWhereWithoutAttendanceInput = {
    where: Prisma.AttendanceChangeLogScalarWhereInput;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateManyMutationInput, Prisma.AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceInput>;
};
export type AttendanceChangeLogCreateManyChangedByInput = {
    id?: string;
    attendanceId: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogUpdateWithoutChangedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendance?: Prisma.AttendanceUpdateOneRequiredWithoutChangeLogsNestedInput;
};
export type AttendanceChangeLogUncheckedUpdateWithoutChangedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attendanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogUncheckedUpdateManyWithoutChangedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    attendanceId?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogCreateManyAttendanceInput = {
    id?: string;
    oldStatus: $Enums.AttendanceStatus;
    newStatus: $Enums.AttendanceStatus;
    changedById: string;
    reason?: string | null;
    changedAt?: Date | string;
};
export type AttendanceChangeLogUpdateWithoutAttendanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    changedBy?: Prisma.UserUpdateOneRequiredWithoutAttendanceChangesNestedInput;
};
export type AttendanceChangeLogUncheckedUpdateWithoutAttendanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFieldUpdateOperationsInput | string;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogUncheckedUpdateManyWithoutAttendanceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    newStatus?: Prisma.EnumAttendanceStatusFieldUpdateOperationsInput | $Enums.AttendanceStatus;
    changedById?: Prisma.StringFieldUpdateOperationsInput | string;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    changedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AttendanceChangeLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    attendanceId?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    changedById?: boolean;
    reason?: boolean;
    changedAt?: boolean;
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attendanceChangeLog"]>;
export type AttendanceChangeLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    attendanceId?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    changedById?: boolean;
    reason?: boolean;
    changedAt?: boolean;
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attendanceChangeLog"]>;
export type AttendanceChangeLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    attendanceId?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    changedById?: boolean;
    reason?: boolean;
    changedAt?: boolean;
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["attendanceChangeLog"]>;
export type AttendanceChangeLogSelectScalar = {
    id?: boolean;
    attendanceId?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    changedById?: boolean;
    reason?: boolean;
    changedAt?: boolean;
};
export type AttendanceChangeLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "attendanceId" | "oldStatus" | "newStatus" | "changedById" | "reason" | "changedAt", ExtArgs["result"]["attendanceChangeLog"]>;
export type AttendanceChangeLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AttendanceChangeLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AttendanceChangeLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attendance?: boolean | Prisma.AttendanceDefaultArgs<ExtArgs>;
    changedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $AttendanceChangeLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AttendanceChangeLog";
    objects: {
        attendance: Prisma.$AttendancePayload<ExtArgs>;
        changedBy: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        attendanceId: string;
        oldStatus: $Enums.AttendanceStatus;
        newStatus: $Enums.AttendanceStatus;
        changedById: string;
        reason: string | null;
        changedAt: Date;
    }, ExtArgs["result"]["attendanceChangeLog"]>;
    composites: {};
};
export type AttendanceChangeLogGetPayload<S extends boolean | null | undefined | AttendanceChangeLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload, S>;
export type AttendanceChangeLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AttendanceChangeLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AttendanceChangeLogCountAggregateInputType | true;
};
export interface AttendanceChangeLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AttendanceChangeLog'];
        meta: {
            name: 'AttendanceChangeLog';
        };
    };
    findUnique<T extends AttendanceChangeLogFindUniqueArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AttendanceChangeLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AttendanceChangeLogFindFirstArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AttendanceChangeLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AttendanceChangeLogFindManyArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AttendanceChangeLogCreateArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogCreateArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AttendanceChangeLogCreateManyArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AttendanceChangeLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AttendanceChangeLogDeleteArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogDeleteArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AttendanceChangeLogUpdateArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogUpdateArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AttendanceChangeLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, AttendanceChangeLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AttendanceChangeLogUpdateManyArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AttendanceChangeLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AttendanceChangeLogUpsertArgs>(args: Prisma.SelectSubset<T, AttendanceChangeLogUpsertArgs<ExtArgs>>): Prisma.Prisma__AttendanceChangeLogClient<runtime.Types.Result.GetResult<Prisma.$AttendanceChangeLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AttendanceChangeLogCountArgs>(args?: Prisma.Subset<T, AttendanceChangeLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AttendanceChangeLogCountAggregateOutputType> : number>;
    aggregate<T extends AttendanceChangeLogAggregateArgs>(args: Prisma.Subset<T, AttendanceChangeLogAggregateArgs>): Prisma.PrismaPromise<GetAttendanceChangeLogAggregateType<T>>;
    groupBy<T extends AttendanceChangeLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AttendanceChangeLogGroupByArgs['orderBy'];
    } : {
        orderBy?: AttendanceChangeLogGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AttendanceChangeLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceChangeLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AttendanceChangeLogFieldRefs;
}
export interface Prisma__AttendanceChangeLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    attendance<T extends Prisma.AttendanceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.AttendanceDefaultArgs<ExtArgs>>): Prisma.Prisma__AttendanceClient<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    changedBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AttendanceChangeLogFieldRefs {
    readonly id: Prisma.FieldRef<"AttendanceChangeLog", 'String'>;
    readonly attendanceId: Prisma.FieldRef<"AttendanceChangeLog", 'String'>;
    readonly oldStatus: Prisma.FieldRef<"AttendanceChangeLog", 'AttendanceStatus'>;
    readonly newStatus: Prisma.FieldRef<"AttendanceChangeLog", 'AttendanceStatus'>;
    readonly changedById: Prisma.FieldRef<"AttendanceChangeLog", 'String'>;
    readonly reason: Prisma.FieldRef<"AttendanceChangeLog", 'String'>;
    readonly changedAt: Prisma.FieldRef<"AttendanceChangeLog", 'DateTime'>;
}
export type AttendanceChangeLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
};
export type AttendanceChangeLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
};
export type AttendanceChangeLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceChangeLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceChangeLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AttendanceChangeLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceChangeLogCreateInput, Prisma.AttendanceChangeLogUncheckedCreateInput>;
};
export type AttendanceChangeLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AttendanceChangeLogCreateManyInput | Prisma.AttendanceChangeLogCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AttendanceChangeLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    data: Prisma.AttendanceChangeLogCreateManyInput | Prisma.AttendanceChangeLogCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AttendanceChangeLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AttendanceChangeLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateInput, Prisma.AttendanceChangeLogUncheckedUpdateInput>;
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
};
export type AttendanceChangeLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateManyMutationInput, Prisma.AttendanceChangeLogUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceChangeLogWhereInput;
    limit?: number;
};
export type AttendanceChangeLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AttendanceChangeLogUpdateManyMutationInput, Prisma.AttendanceChangeLogUncheckedUpdateManyInput>;
    where?: Prisma.AttendanceChangeLogWhereInput;
    limit?: number;
    include?: Prisma.AttendanceChangeLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AttendanceChangeLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.AttendanceChangeLogCreateInput, Prisma.AttendanceChangeLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AttendanceChangeLogUpdateInput, Prisma.AttendanceChangeLogUncheckedUpdateInput>;
};
export type AttendanceChangeLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
    where: Prisma.AttendanceChangeLogWhereUniqueInput;
};
export type AttendanceChangeLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceChangeLogWhereInput;
    limit?: number;
};
export type AttendanceChangeLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AttendanceChangeLogSelect<ExtArgs> | null;
    omit?: Prisma.AttendanceChangeLogOmit<ExtArgs> | null;
    include?: Prisma.AttendanceChangeLogInclude<ExtArgs> | null;
};
