import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EnrollmentModel = runtime.Types.Result.DefaultSelection<Prisma.$EnrollmentPayload>;
export type AggregateEnrollment = {
    _count: EnrollmentCountAggregateOutputType | null;
    _avg: EnrollmentAvgAggregateOutputType | null;
    _sum: EnrollmentSumAggregateOutputType | null;
    _min: EnrollmentMinAggregateOutputType | null;
    _max: EnrollmentMaxAggregateOutputType | null;
};
export type EnrollmentAvgAggregateOutputType = {
    tuitionOverride: runtime.Decimal | null;
};
export type EnrollmentSumAggregateOutputType = {
    tuitionOverride: runtime.Decimal | null;
};
export type EnrollmentMinAggregateOutputType = {
    id: string | null;
    classId: string | null;
    studentId: string | null;
    tuitionOverride: runtime.Decimal | null;
    status: $Enums.MemberStatus | null;
    joinedAt: Date | null;
    leftAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EnrollmentMaxAggregateOutputType = {
    id: string | null;
    classId: string | null;
    studentId: string | null;
    tuitionOverride: runtime.Decimal | null;
    status: $Enums.MemberStatus | null;
    joinedAt: Date | null;
    leftAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EnrollmentCountAggregateOutputType = {
    id: number;
    classId: number;
    studentId: number;
    tuitionOverride: number;
    status: number;
    joinedAt: number;
    leftAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type EnrollmentAvgAggregateInputType = {
    tuitionOverride?: true;
};
export type EnrollmentSumAggregateInputType = {
    tuitionOverride?: true;
};
export type EnrollmentMinAggregateInputType = {
    id?: true;
    classId?: true;
    studentId?: true;
    tuitionOverride?: true;
    status?: true;
    joinedAt?: true;
    leftAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EnrollmentMaxAggregateInputType = {
    id?: true;
    classId?: true;
    studentId?: true;
    tuitionOverride?: true;
    status?: true;
    joinedAt?: true;
    leftAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EnrollmentCountAggregateInputType = {
    id?: true;
    classId?: true;
    studentId?: true;
    tuitionOverride?: true;
    status?: true;
    joinedAt?: true;
    leftAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type EnrollmentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithRelationInput | Prisma.EnrollmentOrderByWithRelationInput[];
    cursor?: Prisma.EnrollmentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EnrollmentCountAggregateInputType;
    _avg?: EnrollmentAvgAggregateInputType;
    _sum?: EnrollmentSumAggregateInputType;
    _min?: EnrollmentMinAggregateInputType;
    _max?: EnrollmentMaxAggregateInputType;
};
export type GetEnrollmentAggregateType<T extends EnrollmentAggregateArgs> = {
    [P in keyof T & keyof AggregateEnrollment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEnrollment[P]> : Prisma.GetScalarType<T[P], AggregateEnrollment[P]>;
};
export type EnrollmentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithAggregationInput | Prisma.EnrollmentOrderByWithAggregationInput[];
    by: Prisma.EnrollmentScalarFieldEnum[] | Prisma.EnrollmentScalarFieldEnum;
    having?: Prisma.EnrollmentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EnrollmentCountAggregateInputType | true;
    _avg?: EnrollmentAvgAggregateInputType;
    _sum?: EnrollmentSumAggregateInputType;
    _min?: EnrollmentMinAggregateInputType;
    _max?: EnrollmentMaxAggregateInputType;
};
export type EnrollmentGroupByOutputType = {
    id: string;
    classId: string;
    studentId: string;
    tuitionOverride: runtime.Decimal | null;
    status: $Enums.MemberStatus;
    joinedAt: Date;
    leftAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: EnrollmentCountAggregateOutputType | null;
    _avg: EnrollmentAvgAggregateOutputType | null;
    _sum: EnrollmentSumAggregateOutputType | null;
    _min: EnrollmentMinAggregateOutputType | null;
    _max: EnrollmentMaxAggregateOutputType | null;
};
export type GetEnrollmentGroupByPayload<T extends EnrollmentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EnrollmentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EnrollmentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EnrollmentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EnrollmentGroupByOutputType[P]>;
}>>;
export type EnrollmentWhereInput = {
    AND?: Prisma.EnrollmentWhereInput | Prisma.EnrollmentWhereInput[];
    OR?: Prisma.EnrollmentWhereInput[];
    NOT?: Prisma.EnrollmentWhereInput | Prisma.EnrollmentWhereInput[];
    id?: Prisma.StringFilter<"Enrollment"> | string;
    classId?: Prisma.StringFilter<"Enrollment"> | string;
    studentId?: Prisma.StringFilter<"Enrollment"> | string;
    tuitionOverride?: Prisma.DecimalNullableFilter<"Enrollment"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFilter<"Enrollment"> | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    leftAt?: Prisma.DateTimeNullableFilter<"Enrollment"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    student?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tuitionFees?: Prisma.TuitionFeeListRelationFilter;
};
export type EnrollmentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    tuitionOverride?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    leftAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    class?: Prisma.ClassOrderByWithRelationInput;
    student?: Prisma.UserOrderByWithRelationInput;
    tuitionFees?: Prisma.TuitionFeeOrderByRelationAggregateInput;
};
export type EnrollmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.EnrollmentWhereInput | Prisma.EnrollmentWhereInput[];
    OR?: Prisma.EnrollmentWhereInput[];
    NOT?: Prisma.EnrollmentWhereInput | Prisma.EnrollmentWhereInput[];
    classId?: Prisma.StringFilter<"Enrollment"> | string;
    studentId?: Prisma.StringFilter<"Enrollment"> | string;
    tuitionOverride?: Prisma.DecimalNullableFilter<"Enrollment"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFilter<"Enrollment"> | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    leftAt?: Prisma.DateTimeNullableFilter<"Enrollment"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    student?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    tuitionFees?: Prisma.TuitionFeeListRelationFilter;
}, "id">;
export type EnrollmentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    tuitionOverride?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    leftAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.EnrollmentCountOrderByAggregateInput;
    _avg?: Prisma.EnrollmentAvgOrderByAggregateInput;
    _max?: Prisma.EnrollmentMaxOrderByAggregateInput;
    _min?: Prisma.EnrollmentMinOrderByAggregateInput;
    _sum?: Prisma.EnrollmentSumOrderByAggregateInput;
};
export type EnrollmentScalarWhereWithAggregatesInput = {
    AND?: Prisma.EnrollmentScalarWhereWithAggregatesInput | Prisma.EnrollmentScalarWhereWithAggregatesInput[];
    OR?: Prisma.EnrollmentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EnrollmentScalarWhereWithAggregatesInput | Prisma.EnrollmentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Enrollment"> | string;
    classId?: Prisma.StringWithAggregatesFilter<"Enrollment"> | string;
    studentId?: Prisma.StringWithAggregatesFilter<"Enrollment"> | string;
    tuitionOverride?: Prisma.DecimalNullableWithAggregatesFilter<"Enrollment"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusWithAggregatesFilter<"Enrollment"> | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeWithAggregatesFilter<"Enrollment"> | Date | string;
    leftAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Enrollment"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Enrollment"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Enrollment"> | Date | string;
};
export type EnrollmentCreateInput = {
    id?: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMembersInput;
    student: Prisma.UserCreateNestedOneWithoutEnrollmentsInput;
    tuitionFees?: Prisma.TuitionFeeCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentUncheckedCreateInput = {
    id?: string;
    classId: string;
    studentId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMembersNestedInput;
    student?: Prisma.UserUpdateOneRequiredWithoutEnrollmentsNestedInput;
    tuitionFees?: Prisma.TuitionFeeUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentCreateManyInput = {
    id?: string;
    classId: string;
    studentId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EnrollmentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EnrollmentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EnrollmentListRelationFilter = {
    every?: Prisma.EnrollmentWhereInput;
    some?: Prisma.EnrollmentWhereInput;
    none?: Prisma.EnrollmentWhereInput;
};
export type EnrollmentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EnrollmentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    tuitionOverride?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    leftAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnrollmentAvgOrderByAggregateInput = {
    tuitionOverride?: Prisma.SortOrder;
};
export type EnrollmentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    tuitionOverride?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    leftAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnrollmentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    studentId?: Prisma.SortOrder;
    tuitionOverride?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    leftAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnrollmentSumOrderByAggregateInput = {
    tuitionOverride?: Prisma.SortOrder;
};
export type EnrollmentScalarRelationFilter = {
    is?: Prisma.EnrollmentWhereInput;
    isNot?: Prisma.EnrollmentWhereInput;
};
export type EnrollmentCreateNestedManyWithoutStudentInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput> | Prisma.EnrollmentCreateWithoutStudentInput[] | Prisma.EnrollmentUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutStudentInput | Prisma.EnrollmentCreateOrConnectWithoutStudentInput[];
    createMany?: Prisma.EnrollmentCreateManyStudentInputEnvelope;
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
};
export type EnrollmentUncheckedCreateNestedManyWithoutStudentInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput> | Prisma.EnrollmentCreateWithoutStudentInput[] | Prisma.EnrollmentUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutStudentInput | Prisma.EnrollmentCreateOrConnectWithoutStudentInput[];
    createMany?: Prisma.EnrollmentCreateManyStudentInputEnvelope;
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
};
export type EnrollmentUpdateManyWithoutStudentNestedInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput> | Prisma.EnrollmentCreateWithoutStudentInput[] | Prisma.EnrollmentUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutStudentInput | Prisma.EnrollmentCreateOrConnectWithoutStudentInput[];
    upsert?: Prisma.EnrollmentUpsertWithWhereUniqueWithoutStudentInput | Prisma.EnrollmentUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: Prisma.EnrollmentCreateManyStudentInputEnvelope;
    set?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    disconnect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    delete?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    update?: Prisma.EnrollmentUpdateWithWhereUniqueWithoutStudentInput | Prisma.EnrollmentUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?: Prisma.EnrollmentUpdateManyWithWhereWithoutStudentInput | Prisma.EnrollmentUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
};
export type EnrollmentUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput> | Prisma.EnrollmentCreateWithoutStudentInput[] | Prisma.EnrollmentUncheckedCreateWithoutStudentInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutStudentInput | Prisma.EnrollmentCreateOrConnectWithoutStudentInput[];
    upsert?: Prisma.EnrollmentUpsertWithWhereUniqueWithoutStudentInput | Prisma.EnrollmentUpsertWithWhereUniqueWithoutStudentInput[];
    createMany?: Prisma.EnrollmentCreateManyStudentInputEnvelope;
    set?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    disconnect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    delete?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    update?: Prisma.EnrollmentUpdateWithWhereUniqueWithoutStudentInput | Prisma.EnrollmentUpdateWithWhereUniqueWithoutStudentInput[];
    updateMany?: Prisma.EnrollmentUpdateManyWithWhereWithoutStudentInput | Prisma.EnrollmentUpdateManyWithWhereWithoutStudentInput[];
    deleteMany?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
};
export type EnrollmentCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput> | Prisma.EnrollmentCreateWithoutClassInput[] | Prisma.EnrollmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutClassInput | Prisma.EnrollmentCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.EnrollmentCreateManyClassInputEnvelope;
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
};
export type EnrollmentUncheckedCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput> | Prisma.EnrollmentCreateWithoutClassInput[] | Prisma.EnrollmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutClassInput | Prisma.EnrollmentCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.EnrollmentCreateManyClassInputEnvelope;
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
};
export type EnrollmentUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput> | Prisma.EnrollmentCreateWithoutClassInput[] | Prisma.EnrollmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutClassInput | Prisma.EnrollmentCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.EnrollmentUpsertWithWhereUniqueWithoutClassInput | Prisma.EnrollmentUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.EnrollmentCreateManyClassInputEnvelope;
    set?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    disconnect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    delete?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    update?: Prisma.EnrollmentUpdateWithWhereUniqueWithoutClassInput | Prisma.EnrollmentUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.EnrollmentUpdateManyWithWhereWithoutClassInput | Prisma.EnrollmentUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
};
export type EnrollmentUncheckedUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput> | Prisma.EnrollmentCreateWithoutClassInput[] | Prisma.EnrollmentUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutClassInput | Prisma.EnrollmentCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.EnrollmentUpsertWithWhereUniqueWithoutClassInput | Prisma.EnrollmentUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.EnrollmentCreateManyClassInputEnvelope;
    set?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    disconnect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    delete?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    connect?: Prisma.EnrollmentWhereUniqueInput | Prisma.EnrollmentWhereUniqueInput[];
    update?: Prisma.EnrollmentUpdateWithWhereUniqueWithoutClassInput | Prisma.EnrollmentUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.EnrollmentUpdateManyWithWhereWithoutClassInput | Prisma.EnrollmentUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumMemberStatusFieldUpdateOperationsInput = {
    set?: $Enums.MemberStatus;
};
export type EnrollmentCreateNestedOneWithoutTuitionFeesInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedCreateWithoutTuitionFeesInput>;
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutTuitionFeesInput;
    connect?: Prisma.EnrollmentWhereUniqueInput;
};
export type EnrollmentUpdateOneRequiredWithoutTuitionFeesNestedInput = {
    create?: Prisma.XOR<Prisma.EnrollmentCreateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedCreateWithoutTuitionFeesInput>;
    connectOrCreate?: Prisma.EnrollmentCreateOrConnectWithoutTuitionFeesInput;
    upsert?: Prisma.EnrollmentUpsertWithoutTuitionFeesInput;
    connect?: Prisma.EnrollmentWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EnrollmentUpdateToOneWithWhereWithoutTuitionFeesInput, Prisma.EnrollmentUpdateWithoutTuitionFeesInput>, Prisma.EnrollmentUncheckedUpdateWithoutTuitionFeesInput>;
};
export type EnrollmentCreateWithoutStudentInput = {
    id?: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMembersInput;
    tuitionFees?: Prisma.TuitionFeeCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentUncheckedCreateWithoutStudentInput = {
    id?: string;
    classId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentCreateOrConnectWithoutStudentInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput>;
};
export type EnrollmentCreateManyStudentInputEnvelope = {
    data: Prisma.EnrollmentCreateManyStudentInput | Prisma.EnrollmentCreateManyStudentInput[];
    skipDuplicates?: boolean;
};
export type EnrollmentUpsertWithWhereUniqueWithoutStudentInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.EnrollmentUpdateWithoutStudentInput, Prisma.EnrollmentUncheckedUpdateWithoutStudentInput>;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutStudentInput, Prisma.EnrollmentUncheckedCreateWithoutStudentInput>;
};
export type EnrollmentUpdateWithWhereUniqueWithoutStudentInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.EnrollmentUpdateWithoutStudentInput, Prisma.EnrollmentUncheckedUpdateWithoutStudentInput>;
};
export type EnrollmentUpdateManyWithWhereWithoutStudentInput = {
    where: Prisma.EnrollmentScalarWhereInput;
    data: Prisma.XOR<Prisma.EnrollmentUpdateManyMutationInput, Prisma.EnrollmentUncheckedUpdateManyWithoutStudentInput>;
};
export type EnrollmentScalarWhereInput = {
    AND?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
    OR?: Prisma.EnrollmentScalarWhereInput[];
    NOT?: Prisma.EnrollmentScalarWhereInput | Prisma.EnrollmentScalarWhereInput[];
    id?: Prisma.StringFilter<"Enrollment"> | string;
    classId?: Prisma.StringFilter<"Enrollment"> | string;
    studentId?: Prisma.StringFilter<"Enrollment"> | string;
    tuitionOverride?: Prisma.DecimalNullableFilter<"Enrollment"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFilter<"Enrollment"> | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    leftAt?: Prisma.DateTimeNullableFilter<"Enrollment"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Enrollment"> | Date | string;
};
export type EnrollmentCreateWithoutClassInput = {
    id?: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    student: Prisma.UserCreateNestedOneWithoutEnrollmentsInput;
    tuitionFees?: Prisma.TuitionFeeCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentUncheckedCreateWithoutClassInput = {
    id?: string;
    studentId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedCreateNestedManyWithoutEnrollmentInput;
};
export type EnrollmentCreateOrConnectWithoutClassInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput>;
};
export type EnrollmentCreateManyClassInputEnvelope = {
    data: Prisma.EnrollmentCreateManyClassInput | Prisma.EnrollmentCreateManyClassInput[];
    skipDuplicates?: boolean;
};
export type EnrollmentUpsertWithWhereUniqueWithoutClassInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    update: Prisma.XOR<Prisma.EnrollmentUpdateWithoutClassInput, Prisma.EnrollmentUncheckedUpdateWithoutClassInput>;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutClassInput, Prisma.EnrollmentUncheckedCreateWithoutClassInput>;
};
export type EnrollmentUpdateWithWhereUniqueWithoutClassInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    data: Prisma.XOR<Prisma.EnrollmentUpdateWithoutClassInput, Prisma.EnrollmentUncheckedUpdateWithoutClassInput>;
};
export type EnrollmentUpdateManyWithWhereWithoutClassInput = {
    where: Prisma.EnrollmentScalarWhereInput;
    data: Prisma.XOR<Prisma.EnrollmentUpdateManyMutationInput, Prisma.EnrollmentUncheckedUpdateManyWithoutClassInput>;
};
export type EnrollmentCreateWithoutTuitionFeesInput = {
    id?: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMembersInput;
    student: Prisma.UserCreateNestedOneWithoutEnrollmentsInput;
};
export type EnrollmentUncheckedCreateWithoutTuitionFeesInput = {
    id?: string;
    classId: string;
    studentId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EnrollmentCreateOrConnectWithoutTuitionFeesInput = {
    where: Prisma.EnrollmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedCreateWithoutTuitionFeesInput>;
};
export type EnrollmentUpsertWithoutTuitionFeesInput = {
    update: Prisma.XOR<Prisma.EnrollmentUpdateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedUpdateWithoutTuitionFeesInput>;
    create: Prisma.XOR<Prisma.EnrollmentCreateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedCreateWithoutTuitionFeesInput>;
    where?: Prisma.EnrollmentWhereInput;
};
export type EnrollmentUpdateToOneWithWhereWithoutTuitionFeesInput = {
    where?: Prisma.EnrollmentWhereInput;
    data: Prisma.XOR<Prisma.EnrollmentUpdateWithoutTuitionFeesInput, Prisma.EnrollmentUncheckedUpdateWithoutTuitionFeesInput>;
};
export type EnrollmentUpdateWithoutTuitionFeesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMembersNestedInput;
    student?: Prisma.UserUpdateOneRequiredWithoutEnrollmentsNestedInput;
};
export type EnrollmentUncheckedUpdateWithoutTuitionFeesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EnrollmentCreateManyStudentInput = {
    id?: string;
    classId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EnrollmentUpdateWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMembersNestedInput;
    tuitionFees?: Prisma.TuitionFeeUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentUncheckedUpdateWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentUncheckedUpdateManyWithoutStudentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EnrollmentCreateManyClassInput = {
    id?: string;
    studentId: string;
    tuitionOverride?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.MemberStatus;
    joinedAt?: Date | string;
    leftAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EnrollmentUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    student?: Prisma.UserUpdateOneRequiredWithoutEnrollmentsNestedInput;
    tuitionFees?: Prisma.TuitionFeeUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentUncheckedUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFees?: Prisma.TuitionFeeUncheckedUpdateManyWithoutEnrollmentNestedInput;
};
export type EnrollmentUncheckedUpdateManyWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    studentId?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionOverride?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumMemberStatusFieldUpdateOperationsInput | $Enums.MemberStatus;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    leftAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EnrollmentCountOutputType = {
    tuitionFees: number;
};
export type EnrollmentCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tuitionFees?: boolean | EnrollmentCountOutputTypeCountTuitionFeesArgs;
};
export type EnrollmentCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentCountOutputTypeSelect<ExtArgs> | null;
};
export type EnrollmentCountOutputTypeCountTuitionFeesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionFeeWhereInput;
};
export type EnrollmentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    studentId?: boolean;
    tuitionOverride?: boolean;
    status?: boolean;
    joinedAt?: boolean;
    leftAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tuitionFees?: boolean | Prisma.Enrollment$tuitionFeesArgs<ExtArgs>;
    _count?: boolean | Prisma.EnrollmentCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["enrollment"]>;
export type EnrollmentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    studentId?: boolean;
    tuitionOverride?: boolean;
    status?: boolean;
    joinedAt?: boolean;
    leftAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["enrollment"]>;
export type EnrollmentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    studentId?: boolean;
    tuitionOverride?: boolean;
    status?: boolean;
    joinedAt?: boolean;
    leftAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["enrollment"]>;
export type EnrollmentSelectScalar = {
    id?: boolean;
    classId?: boolean;
    studentId?: boolean;
    tuitionOverride?: boolean;
    status?: boolean;
    joinedAt?: boolean;
    leftAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type EnrollmentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classId" | "studentId" | "tuitionOverride" | "status" | "joinedAt" | "leftAt" | "createdAt" | "updatedAt", ExtArgs["result"]["enrollment"]>;
export type EnrollmentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    tuitionFees?: boolean | Prisma.Enrollment$tuitionFeesArgs<ExtArgs>;
    _count?: boolean | Prisma.EnrollmentCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EnrollmentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type EnrollmentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    student?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $EnrollmentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Enrollment";
    objects: {
        class: Prisma.$ClassPayload<ExtArgs>;
        student: Prisma.$UserPayload<ExtArgs>;
        tuitionFees: Prisma.$TuitionFeePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        classId: string;
        studentId: string;
        tuitionOverride: runtime.Decimal | null;
        status: $Enums.MemberStatus;
        joinedAt: Date;
        leftAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["enrollment"]>;
    composites: {};
};
export type EnrollmentGetPayload<S extends boolean | null | undefined | EnrollmentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload, S>;
export type EnrollmentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EnrollmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EnrollmentCountAggregateInputType | true;
};
export interface EnrollmentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Enrollment'];
        meta: {
            name: 'Enrollment';
        };
    };
    findUnique<T extends EnrollmentFindUniqueArgs>(args: Prisma.SelectSubset<T, EnrollmentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EnrollmentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EnrollmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EnrollmentFindFirstArgs>(args?: Prisma.SelectSubset<T, EnrollmentFindFirstArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EnrollmentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EnrollmentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EnrollmentFindManyArgs>(args?: Prisma.SelectSubset<T, EnrollmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EnrollmentCreateArgs>(args: Prisma.SelectSubset<T, EnrollmentCreateArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EnrollmentCreateManyArgs>(args?: Prisma.SelectSubset<T, EnrollmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EnrollmentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EnrollmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EnrollmentDeleteArgs>(args: Prisma.SelectSubset<T, EnrollmentDeleteArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EnrollmentUpdateArgs>(args: Prisma.SelectSubset<T, EnrollmentUpdateArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EnrollmentDeleteManyArgs>(args?: Prisma.SelectSubset<T, EnrollmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EnrollmentUpdateManyArgs>(args: Prisma.SelectSubset<T, EnrollmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EnrollmentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EnrollmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EnrollmentUpsertArgs>(args: Prisma.SelectSubset<T, EnrollmentUpsertArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EnrollmentCountArgs>(args?: Prisma.Subset<T, EnrollmentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EnrollmentCountAggregateOutputType> : number>;
    aggregate<T extends EnrollmentAggregateArgs>(args: Prisma.Subset<T, EnrollmentAggregateArgs>): Prisma.PrismaPromise<GetEnrollmentAggregateType<T>>;
    groupBy<T extends EnrollmentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EnrollmentGroupByArgs['orderBy'];
    } : {
        orderBy?: EnrollmentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EnrollmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEnrollmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EnrollmentFieldRefs;
}
export interface Prisma__EnrollmentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    class<T extends Prisma.ClassDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    student<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tuitionFees<T extends Prisma.Enrollment$tuitionFeesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Enrollment$tuitionFeesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EnrollmentFieldRefs {
    readonly id: Prisma.FieldRef<"Enrollment", 'String'>;
    readonly classId: Prisma.FieldRef<"Enrollment", 'String'>;
    readonly studentId: Prisma.FieldRef<"Enrollment", 'String'>;
    readonly tuitionOverride: Prisma.FieldRef<"Enrollment", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Enrollment", 'MemberStatus'>;
    readonly joinedAt: Prisma.FieldRef<"Enrollment", 'DateTime'>;
    readonly leftAt: Prisma.FieldRef<"Enrollment", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Enrollment", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Enrollment", 'DateTime'>;
}
export type EnrollmentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where: Prisma.EnrollmentWhereUniqueInput;
};
export type EnrollmentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where: Prisma.EnrollmentWhereUniqueInput;
};
export type EnrollmentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithRelationInput | Prisma.EnrollmentOrderByWithRelationInput[];
    cursor?: Prisma.EnrollmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EnrollmentScalarFieldEnum | Prisma.EnrollmentScalarFieldEnum[];
};
export type EnrollmentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithRelationInput | Prisma.EnrollmentOrderByWithRelationInput[];
    cursor?: Prisma.EnrollmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EnrollmentScalarFieldEnum | Prisma.EnrollmentScalarFieldEnum[];
};
export type EnrollmentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where?: Prisma.EnrollmentWhereInput;
    orderBy?: Prisma.EnrollmentOrderByWithRelationInput | Prisma.EnrollmentOrderByWithRelationInput[];
    cursor?: Prisma.EnrollmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EnrollmentScalarFieldEnum | Prisma.EnrollmentScalarFieldEnum[];
};
export type EnrollmentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EnrollmentCreateInput, Prisma.EnrollmentUncheckedCreateInput>;
};
export type EnrollmentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EnrollmentCreateManyInput | Prisma.EnrollmentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EnrollmentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    data: Prisma.EnrollmentCreateManyInput | Prisma.EnrollmentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.EnrollmentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EnrollmentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EnrollmentUpdateInput, Prisma.EnrollmentUncheckedUpdateInput>;
    where: Prisma.EnrollmentWhereUniqueInput;
};
export type EnrollmentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EnrollmentUpdateManyMutationInput, Prisma.EnrollmentUncheckedUpdateManyInput>;
    where?: Prisma.EnrollmentWhereInput;
    limit?: number;
};
export type EnrollmentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EnrollmentUpdateManyMutationInput, Prisma.EnrollmentUncheckedUpdateManyInput>;
    where?: Prisma.EnrollmentWhereInput;
    limit?: number;
    include?: Prisma.EnrollmentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EnrollmentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where: Prisma.EnrollmentWhereUniqueInput;
    create: Prisma.XOR<Prisma.EnrollmentCreateInput, Prisma.EnrollmentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EnrollmentUpdateInput, Prisma.EnrollmentUncheckedUpdateInput>;
};
export type EnrollmentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
    where: Prisma.EnrollmentWhereUniqueInput;
};
export type EnrollmentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EnrollmentWhereInput;
    limit?: number;
};
export type Enrollment$tuitionFeesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    where?: Prisma.TuitionFeeWhereInput;
    orderBy?: Prisma.TuitionFeeOrderByWithRelationInput | Prisma.TuitionFeeOrderByWithRelationInput[];
    cursor?: Prisma.TuitionFeeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TuitionFeeScalarFieldEnum | Prisma.TuitionFeeScalarFieldEnum[];
};
export type EnrollmentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EnrollmentSelect<ExtArgs> | null;
    omit?: Prisma.EnrollmentOmit<ExtArgs> | null;
    include?: Prisma.EnrollmentInclude<ExtArgs> | null;
};
