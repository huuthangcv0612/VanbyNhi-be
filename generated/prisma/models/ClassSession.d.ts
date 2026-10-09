import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClassSessionModel = runtime.Types.Result.DefaultSelection<Prisma.$ClassSessionPayload>;
export type AggregateClassSession = {
    _count: ClassSessionCountAggregateOutputType | null;
    _min: ClassSessionMinAggregateOutputType | null;
    _max: ClassSessionMaxAggregateOutputType | null;
};
export type ClassSessionMinAggregateOutputType = {
    id: string | null;
    classId: string | null;
    title: string | null;
    description: string | null;
    startTime: Date | null;
    endTime: Date | null;
    meetUrl: string | null;
    status: $Enums.SessionStatus | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassSessionMaxAggregateOutputType = {
    id: string | null;
    classId: string | null;
    title: string | null;
    description: string | null;
    startTime: Date | null;
    endTime: Date | null;
    meetUrl: string | null;
    status: $Enums.SessionStatus | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassSessionCountAggregateOutputType = {
    id: number;
    classId: number;
    title: number;
    description: number;
    startTime: number;
    endTime: number;
    meetUrl: number;
    status: number;
    createdById: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ClassSessionMinAggregateInputType = {
    id?: true;
    classId?: true;
    title?: true;
    description?: true;
    startTime?: true;
    endTime?: true;
    meetUrl?: true;
    status?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassSessionMaxAggregateInputType = {
    id?: true;
    classId?: true;
    title?: true;
    description?: true;
    startTime?: true;
    endTime?: true;
    meetUrl?: true;
    status?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassSessionCountAggregateInputType = {
    id?: true;
    classId?: true;
    title?: true;
    description?: true;
    startTime?: true;
    endTime?: true;
    meetUrl?: true;
    status?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ClassSessionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassSessionWhereInput;
    orderBy?: Prisma.ClassSessionOrderByWithRelationInput | Prisma.ClassSessionOrderByWithRelationInput[];
    cursor?: Prisma.ClassSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClassSessionCountAggregateInputType;
    _min?: ClassSessionMinAggregateInputType;
    _max?: ClassSessionMaxAggregateInputType;
};
export type GetClassSessionAggregateType<T extends ClassSessionAggregateArgs> = {
    [P in keyof T & keyof AggregateClassSession]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClassSession[P]> : Prisma.GetScalarType<T[P], AggregateClassSession[P]>;
};
export type ClassSessionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassSessionWhereInput;
    orderBy?: Prisma.ClassSessionOrderByWithAggregationInput | Prisma.ClassSessionOrderByWithAggregationInput[];
    by: Prisma.ClassSessionScalarFieldEnum[] | Prisma.ClassSessionScalarFieldEnum;
    having?: Prisma.ClassSessionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClassSessionCountAggregateInputType | true;
    _min?: ClassSessionMinAggregateInputType;
    _max?: ClassSessionMaxAggregateInputType;
};
export type ClassSessionGroupByOutputType = {
    id: string;
    classId: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    meetUrl: string | null;
    status: $Enums.SessionStatus;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ClassSessionCountAggregateOutputType | null;
    _min: ClassSessionMinAggregateOutputType | null;
    _max: ClassSessionMaxAggregateOutputType | null;
};
export type GetClassSessionGroupByPayload<T extends ClassSessionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClassSessionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClassSessionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClassSessionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClassSessionGroupByOutputType[P]>;
}>>;
export type ClassSessionWhereInput = {
    AND?: Prisma.ClassSessionWhereInput | Prisma.ClassSessionWhereInput[];
    OR?: Prisma.ClassSessionWhereInput[];
    NOT?: Prisma.ClassSessionWhereInput | Prisma.ClassSessionWhereInput[];
    id?: Prisma.StringFilter<"ClassSession"> | string;
    classId?: Prisma.StringFilter<"ClassSession"> | string;
    title?: Prisma.StringFilter<"ClassSession"> | string;
    description?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    startTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    endTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    meetUrl?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    status?: Prisma.EnumSessionStatusFilter<"ClassSession"> | $Enums.SessionStatus;
    createdById?: Prisma.StringFilter<"ClassSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    attendances?: Prisma.AttendanceListRelationFilter;
    materials?: Prisma.ClassMaterialListRelationFilter;
    assignments?: Prisma.AssignmentListRelationFilter;
    lessonRecord?: Prisma.XOR<Prisma.LessonRecordNullableScalarRelationFilter, Prisma.LessonRecordWhereInput> | null;
};
export type ClassSessionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    meetUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    class?: Prisma.ClassOrderByWithRelationInput;
    createdBy?: Prisma.UserOrderByWithRelationInput;
    attendances?: Prisma.AttendanceOrderByRelationAggregateInput;
    materials?: Prisma.ClassMaterialOrderByRelationAggregateInput;
    assignments?: Prisma.AssignmentOrderByRelationAggregateInput;
    lessonRecord?: Prisma.LessonRecordOrderByWithRelationInput;
};
export type ClassSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ClassSessionWhereInput | Prisma.ClassSessionWhereInput[];
    OR?: Prisma.ClassSessionWhereInput[];
    NOT?: Prisma.ClassSessionWhereInput | Prisma.ClassSessionWhereInput[];
    classId?: Prisma.StringFilter<"ClassSession"> | string;
    title?: Prisma.StringFilter<"ClassSession"> | string;
    description?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    startTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    endTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    meetUrl?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    status?: Prisma.EnumSessionStatusFilter<"ClassSession"> | $Enums.SessionStatus;
    createdById?: Prisma.StringFilter<"ClassSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    attendances?: Prisma.AttendanceListRelationFilter;
    materials?: Prisma.ClassMaterialListRelationFilter;
    assignments?: Prisma.AssignmentListRelationFilter;
    lessonRecord?: Prisma.XOR<Prisma.LessonRecordNullableScalarRelationFilter, Prisma.LessonRecordWhereInput> | null;
}, "id">;
export type ClassSessionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    meetUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ClassSessionCountOrderByAggregateInput;
    _max?: Prisma.ClassSessionMaxOrderByAggregateInput;
    _min?: Prisma.ClassSessionMinOrderByAggregateInput;
};
export type ClassSessionScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClassSessionScalarWhereWithAggregatesInput | Prisma.ClassSessionScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClassSessionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClassSessionScalarWhereWithAggregatesInput | Prisma.ClassSessionScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ClassSession"> | string;
    classId?: Prisma.StringWithAggregatesFilter<"ClassSession"> | string;
    title?: Prisma.StringWithAggregatesFilter<"ClassSession"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"ClassSession"> | string | null;
    startTime?: Prisma.DateTimeWithAggregatesFilter<"ClassSession"> | Date | string;
    endTime?: Prisma.DateTimeWithAggregatesFilter<"ClassSession"> | Date | string;
    meetUrl?: Prisma.StringNullableWithAggregatesFilter<"ClassSession"> | string | null;
    status?: Prisma.EnumSessionStatusWithAggregatesFilter<"ClassSession"> | $Enums.SessionStatus;
    createdById?: Prisma.StringWithAggregatesFilter<"ClassSession"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ClassSession"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ClassSession"> | Date | string;
};
export type ClassSessionCreateInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionCreateManyInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassSessionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassSessionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassSessionListRelationFilter = {
    every?: Prisma.ClassSessionWhereInput;
    some?: Prisma.ClassSessionWhereInput;
    none?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClassSessionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    meetUrl?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassSessionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    meetUrl?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassSessionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    meetUrl?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassSessionScalarRelationFilter = {
    is?: Prisma.ClassSessionWhereInput;
    isNot?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionNullableScalarRelationFilter = {
    is?: Prisma.ClassSessionWhereInput | null;
    isNot?: Prisma.ClassSessionWhereInput | null;
};
export type ClassSessionCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput> | Prisma.ClassSessionCreateWithoutCreatedByInput[] | Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput | Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.ClassSessionCreateManyCreatedByInputEnvelope;
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
};
export type ClassSessionUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput> | Prisma.ClassSessionCreateWithoutCreatedByInput[] | Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput | Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.ClassSessionCreateManyCreatedByInputEnvelope;
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
};
export type ClassSessionUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput> | Prisma.ClassSessionCreateWithoutCreatedByInput[] | Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput | Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.ClassSessionUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.ClassSessionUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.ClassSessionCreateManyCreatedByInputEnvelope;
    set?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    disconnect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    delete?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    update?: Prisma.ClassSessionUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.ClassSessionUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.ClassSessionUpdateManyWithWhereWithoutCreatedByInput | Prisma.ClassSessionUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
};
export type ClassSessionUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput> | Prisma.ClassSessionCreateWithoutCreatedByInput[] | Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput | Prisma.ClassSessionCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.ClassSessionUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.ClassSessionUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.ClassSessionCreateManyCreatedByInputEnvelope;
    set?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    disconnect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    delete?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    update?: Prisma.ClassSessionUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.ClassSessionUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.ClassSessionUpdateManyWithWhereWithoutCreatedByInput | Prisma.ClassSessionUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
};
export type ClassSessionCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput> | Prisma.ClassSessionCreateWithoutClassInput[] | Prisma.ClassSessionUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutClassInput | Prisma.ClassSessionCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.ClassSessionCreateManyClassInputEnvelope;
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
};
export type ClassSessionUncheckedCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput> | Prisma.ClassSessionCreateWithoutClassInput[] | Prisma.ClassSessionUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutClassInput | Prisma.ClassSessionCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.ClassSessionCreateManyClassInputEnvelope;
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
};
export type ClassSessionUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput> | Prisma.ClassSessionCreateWithoutClassInput[] | Prisma.ClassSessionUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutClassInput | Prisma.ClassSessionCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.ClassSessionUpsertWithWhereUniqueWithoutClassInput | Prisma.ClassSessionUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.ClassSessionCreateManyClassInputEnvelope;
    set?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    disconnect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    delete?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    update?: Prisma.ClassSessionUpdateWithWhereUniqueWithoutClassInput | Prisma.ClassSessionUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.ClassSessionUpdateManyWithWhereWithoutClassInput | Prisma.ClassSessionUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
};
export type ClassSessionUncheckedUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput> | Prisma.ClassSessionCreateWithoutClassInput[] | Prisma.ClassSessionUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutClassInput | Prisma.ClassSessionCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.ClassSessionUpsertWithWhereUniqueWithoutClassInput | Prisma.ClassSessionUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.ClassSessionCreateManyClassInputEnvelope;
    set?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    disconnect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    delete?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    connect?: Prisma.ClassSessionWhereUniqueInput | Prisma.ClassSessionWhereUniqueInput[];
    update?: Prisma.ClassSessionUpdateWithWhereUniqueWithoutClassInput | Prisma.ClassSessionUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.ClassSessionUpdateManyWithWhereWithoutClassInput | Prisma.ClassSessionUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
};
export type EnumSessionStatusFieldUpdateOperationsInput = {
    set?: $Enums.SessionStatus;
};
export type ClassSessionCreateNestedOneWithoutAttendancesInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutAttendancesInput, Prisma.ClassSessionUncheckedCreateWithoutAttendancesInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutAttendancesInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionUpdateOneRequiredWithoutAttendancesNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutAttendancesInput, Prisma.ClassSessionUncheckedCreateWithoutAttendancesInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutAttendancesInput;
    upsert?: Prisma.ClassSessionUpsertWithoutAttendancesInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassSessionUpdateToOneWithWhereWithoutAttendancesInput, Prisma.ClassSessionUpdateWithoutAttendancesInput>, Prisma.ClassSessionUncheckedUpdateWithoutAttendancesInput>;
};
export type ClassSessionCreateNestedOneWithoutLessonRecordInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedCreateWithoutLessonRecordInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutLessonRecordInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionUpdateOneRequiredWithoutLessonRecordNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedCreateWithoutLessonRecordInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutLessonRecordInput;
    upsert?: Prisma.ClassSessionUpsertWithoutLessonRecordInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassSessionUpdateToOneWithWhereWithoutLessonRecordInput, Prisma.ClassSessionUpdateWithoutLessonRecordInput>, Prisma.ClassSessionUncheckedUpdateWithoutLessonRecordInput>;
};
export type ClassSessionCreateNestedOneWithoutAssignmentsInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutAssignmentsInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionUpdateOneWithoutAssignmentsNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutAssignmentsInput;
    upsert?: Prisma.ClassSessionUpsertWithoutAssignmentsInput;
    disconnect?: Prisma.ClassSessionWhereInput | boolean;
    delete?: Prisma.ClassSessionWhereInput | boolean;
    connect?: Prisma.ClassSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassSessionUpdateToOneWithWhereWithoutAssignmentsInput, Prisma.ClassSessionUpdateWithoutAssignmentsInput>, Prisma.ClassSessionUncheckedUpdateWithoutAssignmentsInput>;
};
export type ClassSessionCreateNestedOneWithoutMaterialsInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutMaterialsInput, Prisma.ClassSessionUncheckedCreateWithoutMaterialsInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutMaterialsInput;
    connect?: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionUpdateOneWithoutMaterialsNestedInput = {
    create?: Prisma.XOR<Prisma.ClassSessionCreateWithoutMaterialsInput, Prisma.ClassSessionUncheckedCreateWithoutMaterialsInput>;
    connectOrCreate?: Prisma.ClassSessionCreateOrConnectWithoutMaterialsInput;
    upsert?: Prisma.ClassSessionUpsertWithoutMaterialsInput;
    disconnect?: Prisma.ClassSessionWhereInput | boolean;
    delete?: Prisma.ClassSessionWhereInput | boolean;
    connect?: Prisma.ClassSessionWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassSessionUpdateToOneWithWhereWithoutMaterialsInput, Prisma.ClassSessionUpdateWithoutMaterialsInput>, Prisma.ClassSessionUncheckedUpdateWithoutMaterialsInput>;
};
export type ClassSessionCreateWithoutCreatedByInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutCreatedByInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutCreatedByInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput>;
};
export type ClassSessionCreateManyCreatedByInputEnvelope = {
    data: Prisma.ClassSessionCreateManyCreatedByInput | Prisma.ClassSessionCreateManyCreatedByInput[];
    skipDuplicates?: boolean;
};
export type ClassSessionUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutCreatedByInput, Prisma.ClassSessionUncheckedUpdateWithoutCreatedByInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutCreatedByInput, Prisma.ClassSessionUncheckedCreateWithoutCreatedByInput>;
};
export type ClassSessionUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutCreatedByInput, Prisma.ClassSessionUncheckedUpdateWithoutCreatedByInput>;
};
export type ClassSessionUpdateManyWithWhereWithoutCreatedByInput = {
    where: Prisma.ClassSessionScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateManyMutationInput, Prisma.ClassSessionUncheckedUpdateManyWithoutCreatedByInput>;
};
export type ClassSessionScalarWhereInput = {
    AND?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
    OR?: Prisma.ClassSessionScalarWhereInput[];
    NOT?: Prisma.ClassSessionScalarWhereInput | Prisma.ClassSessionScalarWhereInput[];
    id?: Prisma.StringFilter<"ClassSession"> | string;
    classId?: Prisma.StringFilter<"ClassSession"> | string;
    title?: Prisma.StringFilter<"ClassSession"> | string;
    description?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    startTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    endTime?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    meetUrl?: Prisma.StringNullableFilter<"ClassSession"> | string | null;
    status?: Prisma.EnumSessionStatusFilter<"ClassSession"> | $Enums.SessionStatus;
    createdById?: Prisma.StringFilter<"ClassSession"> | string;
    createdAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassSession"> | Date | string;
};
export type ClassSessionCreateWithoutClassInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutClassInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutClassInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput>;
};
export type ClassSessionCreateManyClassInputEnvelope = {
    data: Prisma.ClassSessionCreateManyClassInput | Prisma.ClassSessionCreateManyClassInput[];
    skipDuplicates?: boolean;
};
export type ClassSessionUpsertWithWhereUniqueWithoutClassInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutClassInput, Prisma.ClassSessionUncheckedUpdateWithoutClassInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutClassInput, Prisma.ClassSessionUncheckedCreateWithoutClassInput>;
};
export type ClassSessionUpdateWithWhereUniqueWithoutClassInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutClassInput, Prisma.ClassSessionUncheckedUpdateWithoutClassInput>;
};
export type ClassSessionUpdateManyWithWhereWithoutClassInput = {
    where: Prisma.ClassSessionScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateManyMutationInput, Prisma.ClassSessionUncheckedUpdateManyWithoutClassInput>;
};
export type ClassSessionCreateWithoutAttendancesInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutAttendancesInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutAttendancesInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutAttendancesInput, Prisma.ClassSessionUncheckedCreateWithoutAttendancesInput>;
};
export type ClassSessionUpsertWithoutAttendancesInput = {
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutAttendancesInput, Prisma.ClassSessionUncheckedUpdateWithoutAttendancesInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutAttendancesInput, Prisma.ClassSessionUncheckedCreateWithoutAttendancesInput>;
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionUpdateToOneWithWhereWithoutAttendancesInput = {
    where?: Prisma.ClassSessionWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutAttendancesInput, Prisma.ClassSessionUncheckedUpdateWithoutAttendancesInput>;
};
export type ClassSessionUpdateWithoutAttendancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutAttendancesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionCreateWithoutLessonRecordInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutLessonRecordInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutLessonRecordInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedCreateWithoutLessonRecordInput>;
};
export type ClassSessionUpsertWithoutLessonRecordInput = {
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedUpdateWithoutLessonRecordInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedCreateWithoutLessonRecordInput>;
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionUpdateToOneWithWhereWithoutLessonRecordInput = {
    where?: Prisma.ClassSessionWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutLessonRecordInput, Prisma.ClassSessionUncheckedUpdateWithoutLessonRecordInput>;
};
export type ClassSessionUpdateWithoutLessonRecordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutLessonRecordInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
};
export type ClassSessionCreateWithoutAssignmentsInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutAssignmentsInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutAssignmentsInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedCreateWithoutAssignmentsInput>;
};
export type ClassSessionUpsertWithoutAssignmentsInput = {
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedUpdateWithoutAssignmentsInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedCreateWithoutAssignmentsInput>;
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: Prisma.ClassSessionWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutAssignmentsInput, Prisma.ClassSessionUncheckedUpdateWithoutAssignmentsInput>;
};
export type ClassSessionUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionCreateWithoutMaterialsInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutSessionsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedSessionsInput;
    attendances?: Prisma.AttendanceCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordCreateNestedOneWithoutSessionInput;
};
export type ClassSessionUncheckedCreateWithoutMaterialsInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    attendances?: Prisma.AttendanceUncheckedCreateNestedManyWithoutSessionInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutSessionInput;
    lessonRecord?: Prisma.LessonRecordUncheckedCreateNestedOneWithoutSessionInput;
};
export type ClassSessionCreateOrConnectWithoutMaterialsInput = {
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutMaterialsInput, Prisma.ClassSessionUncheckedCreateWithoutMaterialsInput>;
};
export type ClassSessionUpsertWithoutMaterialsInput = {
    update: Prisma.XOR<Prisma.ClassSessionUpdateWithoutMaterialsInput, Prisma.ClassSessionUncheckedUpdateWithoutMaterialsInput>;
    create: Prisma.XOR<Prisma.ClassSessionCreateWithoutMaterialsInput, Prisma.ClassSessionUncheckedCreateWithoutMaterialsInput>;
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassSessionUpdateToOneWithWhereWithoutMaterialsInput = {
    where?: Prisma.ClassSessionWhereInput;
    data: Prisma.XOR<Prisma.ClassSessionUpdateWithoutMaterialsInput, Prisma.ClassSessionUncheckedUpdateWithoutMaterialsInput>;
};
export type ClassSessionUpdateWithoutMaterialsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutMaterialsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionCreateManyCreatedByInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassSessionUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateManyWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassSessionCreateManyClassInput = {
    id?: string;
    title: string;
    description?: string | null;
    startTime: Date | string;
    endTime: Date | string;
    meetUrl?: string | null;
    status?: $Enums.SessionStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassSessionUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedSessionsNestedInput;
    attendances?: Prisma.AttendanceUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendances?: Prisma.AttendanceUncheckedUpdateManyWithoutSessionNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutSessionNestedInput;
    lessonRecord?: Prisma.LessonRecordUncheckedUpdateOneWithoutSessionNestedInput;
};
export type ClassSessionUncheckedUpdateManyWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    endTime?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    meetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumSessionStatusFieldUpdateOperationsInput | $Enums.SessionStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassSessionCountOutputType = {
    attendances: number;
    materials: number;
    assignments: number;
};
export type ClassSessionCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    attendances?: boolean | ClassSessionCountOutputTypeCountAttendancesArgs;
    materials?: boolean | ClassSessionCountOutputTypeCountMaterialsArgs;
    assignments?: boolean | ClassSessionCountOutputTypeCountAssignmentsArgs;
};
export type ClassSessionCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionCountOutputTypeSelect<ExtArgs> | null;
};
export type ClassSessionCountOutputTypeCountAttendancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AttendanceWhereInput;
};
export type ClassSessionCountOutputTypeCountMaterialsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassMaterialWhereInput;
};
export type ClassSessionCountOutputTypeCountAssignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentWhereInput;
};
export type ClassSessionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    title?: boolean;
    description?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    meetUrl?: boolean;
    status?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    attendances?: boolean | Prisma.ClassSession$attendancesArgs<ExtArgs>;
    materials?: boolean | Prisma.ClassSession$materialsArgs<ExtArgs>;
    assignments?: boolean | Prisma.ClassSession$assignmentsArgs<ExtArgs>;
    lessonRecord?: boolean | Prisma.ClassSession$lessonRecordArgs<ExtArgs>;
    _count?: boolean | Prisma.ClassSessionCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classSession"]>;
export type ClassSessionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    title?: boolean;
    description?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    meetUrl?: boolean;
    status?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classSession"]>;
export type ClassSessionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    title?: boolean;
    description?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    meetUrl?: boolean;
    status?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classSession"]>;
export type ClassSessionSelectScalar = {
    id?: boolean;
    classId?: boolean;
    title?: boolean;
    description?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    meetUrl?: boolean;
    status?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ClassSessionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classId" | "title" | "description" | "startTime" | "endTime" | "meetUrl" | "status" | "createdById" | "createdAt" | "updatedAt", ExtArgs["result"]["classSession"]>;
export type ClassSessionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    attendances?: boolean | Prisma.ClassSession$attendancesArgs<ExtArgs>;
    materials?: boolean | Prisma.ClassSession$materialsArgs<ExtArgs>;
    assignments?: boolean | Prisma.ClassSession$assignmentsArgs<ExtArgs>;
    lessonRecord?: boolean | Prisma.ClassSession$lessonRecordArgs<ExtArgs>;
    _count?: boolean | Prisma.ClassSessionCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClassSessionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ClassSessionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ClassSessionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClassSession";
    objects: {
        class: Prisma.$ClassPayload<ExtArgs>;
        createdBy: Prisma.$UserPayload<ExtArgs>;
        attendances: Prisma.$AttendancePayload<ExtArgs>[];
        materials: Prisma.$ClassMaterialPayload<ExtArgs>[];
        assignments: Prisma.$AssignmentPayload<ExtArgs>[];
        lessonRecord: Prisma.$LessonRecordPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        classId: string;
        title: string;
        description: string | null;
        startTime: Date;
        endTime: Date;
        meetUrl: string | null;
        status: $Enums.SessionStatus;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["classSession"]>;
    composites: {};
};
export type ClassSessionGetPayload<S extends boolean | null | undefined | ClassSessionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload, S>;
export type ClassSessionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClassSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClassSessionCountAggregateInputType | true;
};
export interface ClassSessionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClassSession'];
        meta: {
            name: 'ClassSession';
        };
    };
    findUnique<T extends ClassSessionFindUniqueArgs>(args: Prisma.SelectSubset<T, ClassSessionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClassSessionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClassSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClassSessionFindFirstArgs>(args?: Prisma.SelectSubset<T, ClassSessionFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClassSessionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClassSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClassSessionFindManyArgs>(args?: Prisma.SelectSubset<T, ClassSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClassSessionCreateArgs>(args: Prisma.SelectSubset<T, ClassSessionCreateArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClassSessionCreateManyArgs>(args?: Prisma.SelectSubset<T, ClassSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClassSessionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClassSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClassSessionDeleteArgs>(args: Prisma.SelectSubset<T, ClassSessionDeleteArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClassSessionUpdateArgs>(args: Prisma.SelectSubset<T, ClassSessionUpdateArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClassSessionDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClassSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClassSessionUpdateManyArgs>(args: Prisma.SelectSubset<T, ClassSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClassSessionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClassSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClassSessionUpsertArgs>(args: Prisma.SelectSubset<T, ClassSessionUpsertArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClassSessionCountArgs>(args?: Prisma.Subset<T, ClassSessionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClassSessionCountAggregateOutputType> : number>;
    aggregate<T extends ClassSessionAggregateArgs>(args: Prisma.Subset<T, ClassSessionAggregateArgs>): Prisma.PrismaPromise<GetClassSessionAggregateType<T>>;
    groupBy<T extends ClassSessionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClassSessionGroupByArgs['orderBy'];
    } : {
        orderBy?: ClassSessionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClassSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClassSessionFieldRefs;
}
export interface Prisma__ClassSessionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    class<T extends Prisma.ClassDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    createdBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    attendances<T extends Prisma.ClassSession$attendancesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSession$attendancesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    materials<T extends Prisma.ClassSession$materialsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSession$materialsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    assignments<T extends Prisma.ClassSession$assignmentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSession$assignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    lessonRecord<T extends Prisma.ClassSession$lessonRecordArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSession$lessonRecordArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClassSessionFieldRefs {
    readonly id: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly classId: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly title: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly description: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly startTime: Prisma.FieldRef<"ClassSession", 'DateTime'>;
    readonly endTime: Prisma.FieldRef<"ClassSession", 'DateTime'>;
    readonly meetUrl: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly status: Prisma.FieldRef<"ClassSession", 'SessionStatus'>;
    readonly createdById: Prisma.FieldRef<"ClassSession", 'String'>;
    readonly createdAt: Prisma.FieldRef<"ClassSession", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ClassSession", 'DateTime'>;
}
export type ClassSessionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where?: Prisma.ClassSessionWhereInput;
    orderBy?: Prisma.ClassSessionOrderByWithRelationInput | Prisma.ClassSessionOrderByWithRelationInput[];
    cursor?: Prisma.ClassSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassSessionScalarFieldEnum | Prisma.ClassSessionScalarFieldEnum[];
};
export type ClassSessionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where?: Prisma.ClassSessionWhereInput;
    orderBy?: Prisma.ClassSessionOrderByWithRelationInput | Prisma.ClassSessionOrderByWithRelationInput[];
    cursor?: Prisma.ClassSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassSessionScalarFieldEnum | Prisma.ClassSessionScalarFieldEnum[];
};
export type ClassSessionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where?: Prisma.ClassSessionWhereInput;
    orderBy?: Prisma.ClassSessionOrderByWithRelationInput | Prisma.ClassSessionOrderByWithRelationInput[];
    cursor?: Prisma.ClassSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassSessionScalarFieldEnum | Prisma.ClassSessionScalarFieldEnum[];
};
export type ClassSessionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassSessionCreateInput, Prisma.ClassSessionUncheckedCreateInput>;
};
export type ClassSessionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClassSessionCreateManyInput | Prisma.ClassSessionCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClassSessionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    data: Prisma.ClassSessionCreateManyInput | Prisma.ClassSessionCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClassSessionIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClassSessionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassSessionUpdateInput, Prisma.ClassSessionUncheckedUpdateInput>;
    where: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClassSessionUpdateManyMutationInput, Prisma.ClassSessionUncheckedUpdateManyInput>;
    where?: Prisma.ClassSessionWhereInput;
    limit?: number;
};
export type ClassSessionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassSessionUpdateManyMutationInput, Prisma.ClassSessionUncheckedUpdateManyInput>;
    where?: Prisma.ClassSessionWhereInput;
    limit?: number;
    include?: Prisma.ClassSessionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClassSessionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where: Prisma.ClassSessionWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassSessionCreateInput, Prisma.ClassSessionUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClassSessionUpdateInput, Prisma.ClassSessionUncheckedUpdateInput>;
};
export type ClassSessionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where: Prisma.ClassSessionWhereUniqueInput;
};
export type ClassSessionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassSessionWhereInput;
    limit?: number;
};
export type ClassSession$attendancesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClassSession$materialsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    where?: Prisma.ClassMaterialWhereInput;
    orderBy?: Prisma.ClassMaterialOrderByWithRelationInput | Prisma.ClassMaterialOrderByWithRelationInput[];
    cursor?: Prisma.ClassMaterialWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassMaterialScalarFieldEnum | Prisma.ClassMaterialScalarFieldEnum[];
};
export type ClassSession$assignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithRelationInput | Prisma.AssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssignmentScalarFieldEnum | Prisma.AssignmentScalarFieldEnum[];
};
export type ClassSession$lessonRecordArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where?: Prisma.LessonRecordWhereInput;
};
export type ClassSessionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
};
