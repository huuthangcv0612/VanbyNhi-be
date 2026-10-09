import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AssignmentModel = runtime.Types.Result.DefaultSelection<Prisma.$AssignmentPayload>;
export type AggregateAssignment = {
    _count: AssignmentCountAggregateOutputType | null;
    _min: AssignmentMinAggregateOutputType | null;
    _max: AssignmentMaxAggregateOutputType | null;
};
export type AssignmentMinAggregateOutputType = {
    id: string | null;
    classId: string | null;
    sessionId: string | null;
    title: string | null;
    description: string | null;
    dueDate: Date | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AssignmentMaxAggregateOutputType = {
    id: string | null;
    classId: string | null;
    sessionId: string | null;
    title: string | null;
    description: string | null;
    dueDate: Date | null;
    createdById: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AssignmentCountAggregateOutputType = {
    id: number;
    classId: number;
    sessionId: number;
    title: number;
    description: number;
    fileUrls: number;
    dueDate: number;
    createdById: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AssignmentMinAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    title?: true;
    description?: true;
    dueDate?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AssignmentMaxAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    title?: true;
    description?: true;
    dueDate?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AssignmentCountAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    title?: true;
    description?: true;
    fileUrls?: true;
    dueDate?: true;
    createdById?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AssignmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithRelationInput | Prisma.AssignmentOrderByWithRelationInput[];
    cursor?: Prisma.AssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AssignmentCountAggregateInputType;
    _min?: AssignmentMinAggregateInputType;
    _max?: AssignmentMaxAggregateInputType;
};
export type GetAssignmentAggregateType<T extends AssignmentAggregateArgs> = {
    [P in keyof T & keyof AggregateAssignment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAssignment[P]> : Prisma.GetScalarType<T[P], AggregateAssignment[P]>;
};
export type AssignmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentWhereInput;
    orderBy?: Prisma.AssignmentOrderByWithAggregationInput | Prisma.AssignmentOrderByWithAggregationInput[];
    by: Prisma.AssignmentScalarFieldEnum[] | Prisma.AssignmentScalarFieldEnum;
    having?: Prisma.AssignmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AssignmentCountAggregateInputType | true;
    _min?: AssignmentMinAggregateInputType;
    _max?: AssignmentMaxAggregateInputType;
};
export type AssignmentGroupByOutputType = {
    id: string;
    classId: string;
    sessionId: string | null;
    title: string;
    description: string | null;
    fileUrls: string[];
    dueDate: Date | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    _count: AssignmentCountAggregateOutputType | null;
    _min: AssignmentMinAggregateOutputType | null;
    _max: AssignmentMaxAggregateOutputType | null;
};
export type GetAssignmentGroupByPayload<T extends AssignmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AssignmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AssignmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AssignmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AssignmentGroupByOutputType[P]>;
}>>;
export type AssignmentWhereInput = {
    AND?: Prisma.AssignmentWhereInput | Prisma.AssignmentWhereInput[];
    OR?: Prisma.AssignmentWhereInput[];
    NOT?: Prisma.AssignmentWhereInput | Prisma.AssignmentWhereInput[];
    id?: Prisma.StringFilter<"Assignment"> | string;
    classId?: Prisma.StringFilter<"Assignment"> | string;
    sessionId?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    title?: Prisma.StringFilter<"Assignment"> | string;
    description?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    fileUrls?: Prisma.StringNullableListFilter<"Assignment">;
    dueDate?: Prisma.DateTimeNullableFilter<"Assignment"> | Date | string | null;
    createdById?: Prisma.StringFilter<"Assignment"> | string;
    createdAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    session?: Prisma.XOR<Prisma.ClassSessionNullableScalarRelationFilter, Prisma.ClassSessionWhereInput> | null;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    submissions?: Prisma.AssignmentSubmissionListRelationFilter;
};
export type AssignmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileUrls?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    class?: Prisma.ClassOrderByWithRelationInput;
    session?: Prisma.ClassSessionOrderByWithRelationInput;
    createdBy?: Prisma.UserOrderByWithRelationInput;
    submissions?: Prisma.AssignmentSubmissionOrderByRelationAggregateInput;
};
export type AssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.AssignmentWhereInput | Prisma.AssignmentWhereInput[];
    OR?: Prisma.AssignmentWhereInput[];
    NOT?: Prisma.AssignmentWhereInput | Prisma.AssignmentWhereInput[];
    classId?: Prisma.StringFilter<"Assignment"> | string;
    sessionId?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    title?: Prisma.StringFilter<"Assignment"> | string;
    description?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    fileUrls?: Prisma.StringNullableListFilter<"Assignment">;
    dueDate?: Prisma.DateTimeNullableFilter<"Assignment"> | Date | string | null;
    createdById?: Prisma.StringFilter<"Assignment"> | string;
    createdAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    session?: Prisma.XOR<Prisma.ClassSessionNullableScalarRelationFilter, Prisma.ClassSessionWhereInput> | null;
    createdBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    submissions?: Prisma.AssignmentSubmissionListRelationFilter;
}, "id">;
export type AssignmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileUrls?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AssignmentCountOrderByAggregateInput;
    _max?: Prisma.AssignmentMaxOrderByAggregateInput;
    _min?: Prisma.AssignmentMinOrderByAggregateInput;
};
export type AssignmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.AssignmentScalarWhereWithAggregatesInput | Prisma.AssignmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.AssignmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AssignmentScalarWhereWithAggregatesInput | Prisma.AssignmentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Assignment"> | string;
    classId?: Prisma.StringWithAggregatesFilter<"Assignment"> | string;
    sessionId?: Prisma.StringNullableWithAggregatesFilter<"Assignment"> | string | null;
    title?: Prisma.StringWithAggregatesFilter<"Assignment"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Assignment"> | string | null;
    fileUrls?: Prisma.StringNullableListFilter<"Assignment">;
    dueDate?: Prisma.DateTimeNullableWithAggregatesFilter<"Assignment"> | Date | string | null;
    createdById?: Prisma.StringWithAggregatesFilter<"Assignment"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Assignment"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Assignment"> | Date | string;
};
export type AssignmentCreateInput = {
    id?: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutAssignmentsInput;
    session?: Prisma.ClassSessionCreateNestedOneWithoutAssignmentsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedAssignmentsInput;
    submissions?: Prisma.AssignmentSubmissionCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentUncheckedCreateInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutAssignmentsNestedInput;
    session?: Prisma.ClassSessionUpdateOneWithoutAssignmentsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedAssignmentsNestedInput;
    submissions?: Prisma.AssignmentSubmissionUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentCreateManyInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AssignmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentListRelationFilter = {
    every?: Prisma.AssignmentWhereInput;
    some?: Prisma.AssignmentWhereInput;
    none?: Prisma.AssignmentWhereInput;
};
export type AssignmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type AssignmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    fileUrls?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AssignmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AssignmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AssignmentScalarRelationFilter = {
    is?: Prisma.AssignmentWhereInput;
    isNot?: Prisma.AssignmentWhereInput;
};
export type AssignmentCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput> | Prisma.AssignmentCreateWithoutCreatedByInput[] | Prisma.AssignmentUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutCreatedByInput | Prisma.AssignmentCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.AssignmentCreateManyCreatedByInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput> | Prisma.AssignmentCreateWithoutCreatedByInput[] | Prisma.AssignmentUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutCreatedByInput | Prisma.AssignmentCreateOrConnectWithoutCreatedByInput[];
    createMany?: Prisma.AssignmentCreateManyCreatedByInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput> | Prisma.AssignmentCreateWithoutCreatedByInput[] | Prisma.AssignmentUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutCreatedByInput | Prisma.AssignmentCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.AssignmentCreateManyCreatedByInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutCreatedByInput | Prisma.AssignmentUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput> | Prisma.AssignmentCreateWithoutCreatedByInput[] | Prisma.AssignmentUncheckedCreateWithoutCreatedByInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutCreatedByInput | Prisma.AssignmentCreateOrConnectWithoutCreatedByInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutCreatedByInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutCreatedByInput[];
    createMany?: Prisma.AssignmentCreateManyCreatedByInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutCreatedByInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutCreatedByInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutCreatedByInput | Prisma.AssignmentUpdateManyWithWhereWithoutCreatedByInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput> | Prisma.AssignmentCreateWithoutClassInput[] | Prisma.AssignmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutClassInput | Prisma.AssignmentCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.AssignmentCreateManyClassInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUncheckedCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput> | Prisma.AssignmentCreateWithoutClassInput[] | Prisma.AssignmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutClassInput | Prisma.AssignmentCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.AssignmentCreateManyClassInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput> | Prisma.AssignmentCreateWithoutClassInput[] | Prisma.AssignmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutClassInput | Prisma.AssignmentCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutClassInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.AssignmentCreateManyClassInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutClassInput | Prisma.AssignmentUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentUncheckedUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput> | Prisma.AssignmentCreateWithoutClassInput[] | Prisma.AssignmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutClassInput | Prisma.AssignmentCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutClassInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.AssignmentCreateManyClassInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutClassInput | Prisma.AssignmentUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput> | Prisma.AssignmentCreateWithoutSessionInput[] | Prisma.AssignmentUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSessionInput | Prisma.AssignmentCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.AssignmentCreateManySessionInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUncheckedCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput> | Prisma.AssignmentCreateWithoutSessionInput[] | Prisma.AssignmentUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSessionInput | Prisma.AssignmentCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.AssignmentCreateManySessionInputEnvelope;
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
};
export type AssignmentUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput> | Prisma.AssignmentCreateWithoutSessionInput[] | Prisma.AssignmentUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSessionInput | Prisma.AssignmentCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutSessionInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.AssignmentCreateManySessionInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutSessionInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutSessionInput | Prisma.AssignmentUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput> | Prisma.AssignmentCreateWithoutSessionInput[] | Prisma.AssignmentUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSessionInput | Prisma.AssignmentCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.AssignmentUpsertWithWhereUniqueWithoutSessionInput | Prisma.AssignmentUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.AssignmentCreateManySessionInputEnvelope;
    set?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    disconnect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    delete?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    connect?: Prisma.AssignmentWhereUniqueInput | Prisma.AssignmentWhereUniqueInput[];
    update?: Prisma.AssignmentUpdateWithWhereUniqueWithoutSessionInput | Prisma.AssignmentUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.AssignmentUpdateManyWithWhereWithoutSessionInput | Prisma.AssignmentUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
};
export type AssignmentCreatefileUrlsInput = {
    set: string[];
};
export type AssignmentUpdatefileUrlsInput = {
    set?: string[];
    push?: string | string[];
};
export type AssignmentCreateNestedOneWithoutSubmissionsInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSubmissionsInput, Prisma.AssignmentUncheckedCreateWithoutSubmissionsInput>;
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSubmissionsInput;
    connect?: Prisma.AssignmentWhereUniqueInput;
};
export type AssignmentUpdateOneRequiredWithoutSubmissionsNestedInput = {
    create?: Prisma.XOR<Prisma.AssignmentCreateWithoutSubmissionsInput, Prisma.AssignmentUncheckedCreateWithoutSubmissionsInput>;
    connectOrCreate?: Prisma.AssignmentCreateOrConnectWithoutSubmissionsInput;
    upsert?: Prisma.AssignmentUpsertWithoutSubmissionsInput;
    connect?: Prisma.AssignmentWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.AssignmentUpdateToOneWithWhereWithoutSubmissionsInput, Prisma.AssignmentUpdateWithoutSubmissionsInput>, Prisma.AssignmentUncheckedUpdateWithoutSubmissionsInput>;
};
export type AssignmentCreateWithoutCreatedByInput = {
    id?: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutAssignmentsInput;
    session?: Prisma.ClassSessionCreateNestedOneWithoutAssignmentsInput;
    submissions?: Prisma.AssignmentSubmissionCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentUncheckedCreateWithoutCreatedByInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentCreateOrConnectWithoutCreatedByInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput>;
};
export type AssignmentCreateManyCreatedByInputEnvelope = {
    data: Prisma.AssignmentCreateManyCreatedByInput | Prisma.AssignmentCreateManyCreatedByInput[];
    skipDuplicates?: boolean;
};
export type AssignmentUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssignmentUpdateWithoutCreatedByInput, Prisma.AssignmentUncheckedUpdateWithoutCreatedByInput>;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutCreatedByInput, Prisma.AssignmentUncheckedCreateWithoutCreatedByInput>;
};
export type AssignmentUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateWithoutCreatedByInput, Prisma.AssignmentUncheckedUpdateWithoutCreatedByInput>;
};
export type AssignmentUpdateManyWithWhereWithoutCreatedByInput = {
    where: Prisma.AssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateManyMutationInput, Prisma.AssignmentUncheckedUpdateManyWithoutCreatedByInput>;
};
export type AssignmentScalarWhereInput = {
    AND?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
    OR?: Prisma.AssignmentScalarWhereInput[];
    NOT?: Prisma.AssignmentScalarWhereInput | Prisma.AssignmentScalarWhereInput[];
    id?: Prisma.StringFilter<"Assignment"> | string;
    classId?: Prisma.StringFilter<"Assignment"> | string;
    sessionId?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    title?: Prisma.StringFilter<"Assignment"> | string;
    description?: Prisma.StringNullableFilter<"Assignment"> | string | null;
    fileUrls?: Prisma.StringNullableListFilter<"Assignment">;
    dueDate?: Prisma.DateTimeNullableFilter<"Assignment"> | Date | string | null;
    createdById?: Prisma.StringFilter<"Assignment"> | string;
    createdAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Assignment"> | Date | string;
};
export type AssignmentCreateWithoutClassInput = {
    id?: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session?: Prisma.ClassSessionCreateNestedOneWithoutAssignmentsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedAssignmentsInput;
    submissions?: Prisma.AssignmentSubmissionCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentUncheckedCreateWithoutClassInput = {
    id?: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentCreateOrConnectWithoutClassInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput>;
};
export type AssignmentCreateManyClassInputEnvelope = {
    data: Prisma.AssignmentCreateManyClassInput | Prisma.AssignmentCreateManyClassInput[];
    skipDuplicates?: boolean;
};
export type AssignmentUpsertWithWhereUniqueWithoutClassInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssignmentUpdateWithoutClassInput, Prisma.AssignmentUncheckedUpdateWithoutClassInput>;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutClassInput, Prisma.AssignmentUncheckedCreateWithoutClassInput>;
};
export type AssignmentUpdateWithWhereUniqueWithoutClassInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateWithoutClassInput, Prisma.AssignmentUncheckedUpdateWithoutClassInput>;
};
export type AssignmentUpdateManyWithWhereWithoutClassInput = {
    where: Prisma.AssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateManyMutationInput, Prisma.AssignmentUncheckedUpdateManyWithoutClassInput>;
};
export type AssignmentCreateWithoutSessionInput = {
    id?: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutAssignmentsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedAssignmentsInput;
    submissions?: Prisma.AssignmentSubmissionCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentUncheckedCreateWithoutSessionInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedCreateNestedManyWithoutAssignmentInput;
};
export type AssignmentCreateOrConnectWithoutSessionInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput>;
};
export type AssignmentCreateManySessionInputEnvelope = {
    data: Prisma.AssignmentCreateManySessionInput | Prisma.AssignmentCreateManySessionInput[];
    skipDuplicates?: boolean;
};
export type AssignmentUpsertWithWhereUniqueWithoutSessionInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.AssignmentUpdateWithoutSessionInput, Prisma.AssignmentUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutSessionInput, Prisma.AssignmentUncheckedCreateWithoutSessionInput>;
};
export type AssignmentUpdateWithWhereUniqueWithoutSessionInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateWithoutSessionInput, Prisma.AssignmentUncheckedUpdateWithoutSessionInput>;
};
export type AssignmentUpdateManyWithWhereWithoutSessionInput = {
    where: Prisma.AssignmentScalarWhereInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateManyMutationInput, Prisma.AssignmentUncheckedUpdateManyWithoutSessionInput>;
};
export type AssignmentCreateWithoutSubmissionsInput = {
    id?: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutAssignmentsInput;
    session?: Prisma.ClassSessionCreateNestedOneWithoutAssignmentsInput;
    createdBy: Prisma.UserCreateNestedOneWithoutCreatedAssignmentsInput;
};
export type AssignmentUncheckedCreateWithoutSubmissionsInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AssignmentCreateOrConnectWithoutSubmissionsInput = {
    where: Prisma.AssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutSubmissionsInput, Prisma.AssignmentUncheckedCreateWithoutSubmissionsInput>;
};
export type AssignmentUpsertWithoutSubmissionsInput = {
    update: Prisma.XOR<Prisma.AssignmentUpdateWithoutSubmissionsInput, Prisma.AssignmentUncheckedUpdateWithoutSubmissionsInput>;
    create: Prisma.XOR<Prisma.AssignmentCreateWithoutSubmissionsInput, Prisma.AssignmentUncheckedCreateWithoutSubmissionsInput>;
    where?: Prisma.AssignmentWhereInput;
};
export type AssignmentUpdateToOneWithWhereWithoutSubmissionsInput = {
    where?: Prisma.AssignmentWhereInput;
    data: Prisma.XOR<Prisma.AssignmentUpdateWithoutSubmissionsInput, Prisma.AssignmentUncheckedUpdateWithoutSubmissionsInput>;
};
export type AssignmentUpdateWithoutSubmissionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutAssignmentsNestedInput;
    session?: Prisma.ClassSessionUpdateOneWithoutAssignmentsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedAssignmentsNestedInput;
};
export type AssignmentUncheckedUpdateWithoutSubmissionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentCreateManyCreatedByInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AssignmentUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutAssignmentsNestedInput;
    session?: Prisma.ClassSessionUpdateOneWithoutAssignmentsNestedInput;
    submissions?: Prisma.AssignmentSubmissionUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateManyWithoutCreatedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentCreateManyClassInput = {
    id?: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AssignmentUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneWithoutAssignmentsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedAssignmentsNestedInput;
    submissions?: Prisma.AssignmentSubmissionUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateManyWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentCreateManySessionInput = {
    id?: string;
    classId: string;
    title: string;
    description?: string | null;
    fileUrls?: Prisma.AssignmentCreatefileUrlsInput | string[];
    dueDate?: Date | string | null;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AssignmentUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutAssignmentsNestedInput;
    createdBy?: Prisma.UserUpdateOneRequiredWithoutCreatedAssignmentsNestedInput;
    submissions?: Prisma.AssignmentSubmissionUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    submissions?: Prisma.AssignmentSubmissionUncheckedUpdateManyWithoutAssignmentNestedInput;
};
export type AssignmentUncheckedUpdateManyWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileUrls?: Prisma.AssignmentUpdatefileUrlsInput | string[];
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AssignmentCountOutputType = {
    submissions: number;
};
export type AssignmentCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    submissions?: boolean | AssignmentCountOutputTypeCountSubmissionsArgs;
};
export type AssignmentCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentCountOutputTypeSelect<ExtArgs> | null;
};
export type AssignmentCountOutputTypeCountSubmissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentSubmissionWhereInput;
};
export type AssignmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    title?: boolean;
    description?: boolean;
    fileUrls?: boolean;
    dueDate?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    submissions?: boolean | Prisma.Assignment$submissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.AssignmentCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assignment"]>;
export type AssignmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    title?: boolean;
    description?: boolean;
    fileUrls?: boolean;
    dueDate?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assignment"]>;
export type AssignmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    title?: boolean;
    description?: boolean;
    fileUrls?: boolean;
    dueDate?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["assignment"]>;
export type AssignmentSelectScalar = {
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    title?: boolean;
    description?: boolean;
    fileUrls?: boolean;
    dueDate?: boolean;
    createdById?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AssignmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classId" | "sessionId" | "title" | "description" | "fileUrls" | "dueDate" | "createdById" | "createdAt" | "updatedAt", ExtArgs["result"]["assignment"]>;
export type AssignmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    submissions?: boolean | Prisma.Assignment$submissionsArgs<ExtArgs>;
    _count?: boolean | Prisma.AssignmentCountOutputTypeDefaultArgs<ExtArgs>;
};
export type AssignmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AssignmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.Assignment$sessionArgs<ExtArgs>;
    createdBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $AssignmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Assignment";
    objects: {
        class: Prisma.$ClassPayload<ExtArgs>;
        session: Prisma.$ClassSessionPayload<ExtArgs> | null;
        createdBy: Prisma.$UserPayload<ExtArgs>;
        submissions: Prisma.$AssignmentSubmissionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        classId: string;
        sessionId: string | null;
        title: string;
        description: string | null;
        fileUrls: string[];
        dueDate: Date | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["assignment"]>;
    composites: {};
};
export type AssignmentGetPayload<S extends boolean | null | undefined | AssignmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AssignmentPayload, S>;
export type AssignmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AssignmentCountAggregateInputType | true;
};
export interface AssignmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Assignment'];
        meta: {
            name: 'Assignment';
        };
    };
    findUnique<T extends AssignmentFindUniqueArgs>(args: Prisma.SelectSubset<T, AssignmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AssignmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AssignmentFindFirstArgs>(args?: Prisma.SelectSubset<T, AssignmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AssignmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AssignmentFindManyArgs>(args?: Prisma.SelectSubset<T, AssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AssignmentCreateArgs>(args: Prisma.SelectSubset<T, AssignmentCreateArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AssignmentCreateManyArgs>(args?: Prisma.SelectSubset<T, AssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AssignmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AssignmentDeleteArgs>(args: Prisma.SelectSubset<T, AssignmentDeleteArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AssignmentUpdateArgs>(args: Prisma.SelectSubset<T, AssignmentUpdateArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AssignmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, AssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AssignmentUpdateManyArgs>(args: Prisma.SelectSubset<T, AssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AssignmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AssignmentUpsertArgs>(args: Prisma.SelectSubset<T, AssignmentUpsertArgs<ExtArgs>>): Prisma.Prisma__AssignmentClient<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AssignmentCountArgs>(args?: Prisma.Subset<T, AssignmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AssignmentCountAggregateOutputType> : number>;
    aggregate<T extends AssignmentAggregateArgs>(args: Prisma.Subset<T, AssignmentAggregateArgs>): Prisma.PrismaPromise<GetAssignmentAggregateType<T>>;
    groupBy<T extends AssignmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AssignmentGroupByArgs['orderBy'];
    } : {
        orderBy?: AssignmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AssignmentFieldRefs;
}
export interface Prisma__AssignmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    class<T extends Prisma.ClassDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    session<T extends Prisma.Assignment$sessionArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Assignment$sessionArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    createdBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    submissions<T extends Prisma.Assignment$submissionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Assignment$submissionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentSubmissionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AssignmentFieldRefs {
    readonly id: Prisma.FieldRef<"Assignment", 'String'>;
    readonly classId: Prisma.FieldRef<"Assignment", 'String'>;
    readonly sessionId: Prisma.FieldRef<"Assignment", 'String'>;
    readonly title: Prisma.FieldRef<"Assignment", 'String'>;
    readonly description: Prisma.FieldRef<"Assignment", 'String'>;
    readonly fileUrls: Prisma.FieldRef<"Assignment", 'String[]'>;
    readonly dueDate: Prisma.FieldRef<"Assignment", 'DateTime'>;
    readonly createdById: Prisma.FieldRef<"Assignment", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Assignment", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Assignment", 'DateTime'>;
}
export type AssignmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    where: Prisma.AssignmentWhereUniqueInput;
};
export type AssignmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    where: Prisma.AssignmentWhereUniqueInput;
};
export type AssignmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AssignmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AssignmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type AssignmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssignmentCreateInput, Prisma.AssignmentUncheckedCreateInput>;
};
export type AssignmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AssignmentCreateManyInput | Prisma.AssignmentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AssignmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    data: Prisma.AssignmentCreateManyInput | Prisma.AssignmentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AssignmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AssignmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssignmentUpdateInput, Prisma.AssignmentUncheckedUpdateInput>;
    where: Prisma.AssignmentWhereUniqueInput;
};
export type AssignmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AssignmentUpdateManyMutationInput, Prisma.AssignmentUncheckedUpdateManyInput>;
    where?: Prisma.AssignmentWhereInput;
    limit?: number;
};
export type AssignmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AssignmentUpdateManyMutationInput, Prisma.AssignmentUncheckedUpdateManyInput>;
    where?: Prisma.AssignmentWhereInput;
    limit?: number;
    include?: Prisma.AssignmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AssignmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    where: Prisma.AssignmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.AssignmentCreateInput, Prisma.AssignmentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AssignmentUpdateInput, Prisma.AssignmentUncheckedUpdateInput>;
};
export type AssignmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
    where: Prisma.AssignmentWhereUniqueInput;
};
export type AssignmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentWhereInput;
    limit?: number;
};
export type Assignment$sessionArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where?: Prisma.ClassSessionWhereInput;
};
export type Assignment$submissionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSubmissionSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentSubmissionOmit<ExtArgs> | null;
    include?: Prisma.AssignmentSubmissionInclude<ExtArgs> | null;
    where?: Prisma.AssignmentSubmissionWhereInput;
    orderBy?: Prisma.AssignmentSubmissionOrderByWithRelationInput | Prisma.AssignmentSubmissionOrderByWithRelationInput[];
    cursor?: Prisma.AssignmentSubmissionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AssignmentSubmissionScalarFieldEnum | Prisma.AssignmentSubmissionScalarFieldEnum[];
};
export type AssignmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AssignmentSelect<ExtArgs> | null;
    omit?: Prisma.AssignmentOmit<ExtArgs> | null;
    include?: Prisma.AssignmentInclude<ExtArgs> | null;
};
