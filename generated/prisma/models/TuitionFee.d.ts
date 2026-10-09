import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TuitionFeeModel = runtime.Types.Result.DefaultSelection<Prisma.$TuitionFeePayload>;
export type AggregateTuitionFee = {
    _count: TuitionFeeCountAggregateOutputType | null;
    _avg: TuitionFeeAvgAggregateOutputType | null;
    _sum: TuitionFeeSumAggregateOutputType | null;
    _min: TuitionFeeMinAggregateOutputType | null;
    _max: TuitionFeeMaxAggregateOutputType | null;
};
export type TuitionFeeAvgAggregateOutputType = {
    billingYear: number | null;
    billingMonth: number | null;
    amountDue: runtime.Decimal | null;
};
export type TuitionFeeSumAggregateOutputType = {
    billingYear: number | null;
    billingMonth: number | null;
    amountDue: runtime.Decimal | null;
};
export type TuitionFeeMinAggregateOutputType = {
    id: string | null;
    enrollmentId: string | null;
    billingYear: number | null;
    billingMonth: number | null;
    amountDue: runtime.Decimal | null;
    status: $Enums.TuitionStatus | null;
    dueDate: Date | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TuitionFeeMaxAggregateOutputType = {
    id: string | null;
    enrollmentId: string | null;
    billingYear: number | null;
    billingMonth: number | null;
    amountDue: runtime.Decimal | null;
    status: $Enums.TuitionStatus | null;
    dueDate: Date | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TuitionFeeCountAggregateOutputType = {
    id: number;
    enrollmentId: number;
    billingYear: number;
    billingMonth: number;
    amountDue: number;
    status: number;
    dueDate: number;
    note: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TuitionFeeAvgAggregateInputType = {
    billingYear?: true;
    billingMonth?: true;
    amountDue?: true;
};
export type TuitionFeeSumAggregateInputType = {
    billingYear?: true;
    billingMonth?: true;
    amountDue?: true;
};
export type TuitionFeeMinAggregateInputType = {
    id?: true;
    enrollmentId?: true;
    billingYear?: true;
    billingMonth?: true;
    amountDue?: true;
    status?: true;
    dueDate?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TuitionFeeMaxAggregateInputType = {
    id?: true;
    enrollmentId?: true;
    billingYear?: true;
    billingMonth?: true;
    amountDue?: true;
    status?: true;
    dueDate?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TuitionFeeCountAggregateInputType = {
    id?: true;
    enrollmentId?: true;
    billingYear?: true;
    billingMonth?: true;
    amountDue?: true;
    status?: true;
    dueDate?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TuitionFeeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionFeeWhereInput;
    orderBy?: Prisma.TuitionFeeOrderByWithRelationInput | Prisma.TuitionFeeOrderByWithRelationInput[];
    cursor?: Prisma.TuitionFeeWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TuitionFeeCountAggregateInputType;
    _avg?: TuitionFeeAvgAggregateInputType;
    _sum?: TuitionFeeSumAggregateInputType;
    _min?: TuitionFeeMinAggregateInputType;
    _max?: TuitionFeeMaxAggregateInputType;
};
export type GetTuitionFeeAggregateType<T extends TuitionFeeAggregateArgs> = {
    [P in keyof T & keyof AggregateTuitionFee]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTuitionFee[P]> : Prisma.GetScalarType<T[P], AggregateTuitionFee[P]>;
};
export type TuitionFeeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionFeeWhereInput;
    orderBy?: Prisma.TuitionFeeOrderByWithAggregationInput | Prisma.TuitionFeeOrderByWithAggregationInput[];
    by: Prisma.TuitionFeeScalarFieldEnum[] | Prisma.TuitionFeeScalarFieldEnum;
    having?: Prisma.TuitionFeeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TuitionFeeCountAggregateInputType | true;
    _avg?: TuitionFeeAvgAggregateInputType;
    _sum?: TuitionFeeSumAggregateInputType;
    _min?: TuitionFeeMinAggregateInputType;
    _max?: TuitionFeeMaxAggregateInputType;
};
export type TuitionFeeGroupByOutputType = {
    id: string;
    enrollmentId: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal;
    status: $Enums.TuitionStatus;
    dueDate: Date | null;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TuitionFeeCountAggregateOutputType | null;
    _avg: TuitionFeeAvgAggregateOutputType | null;
    _sum: TuitionFeeSumAggregateOutputType | null;
    _min: TuitionFeeMinAggregateOutputType | null;
    _max: TuitionFeeMaxAggregateOutputType | null;
};
export type GetTuitionFeeGroupByPayload<T extends TuitionFeeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TuitionFeeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TuitionFeeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TuitionFeeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TuitionFeeGroupByOutputType[P]>;
}>>;
export type TuitionFeeWhereInput = {
    AND?: Prisma.TuitionFeeWhereInput | Prisma.TuitionFeeWhereInput[];
    OR?: Prisma.TuitionFeeWhereInput[];
    NOT?: Prisma.TuitionFeeWhereInput | Prisma.TuitionFeeWhereInput[];
    id?: Prisma.StringFilter<"TuitionFee"> | string;
    enrollmentId?: Prisma.StringFilter<"TuitionFee"> | string;
    billingYear?: Prisma.IntFilter<"TuitionFee"> | number;
    billingMonth?: Prisma.IntFilter<"TuitionFee"> | number;
    amountDue?: Prisma.DecimalFilter<"TuitionFee"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFilter<"TuitionFee"> | $Enums.TuitionStatus;
    dueDate?: Prisma.DateTimeNullableFilter<"TuitionFee"> | Date | string | null;
    note?: Prisma.StringNullableFilter<"TuitionFee"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
    enrollment?: Prisma.XOR<Prisma.EnrollmentScalarRelationFilter, Prisma.EnrollmentWhereInput>;
    payments?: Prisma.TuitionPaymentListRelationFilter;
};
export type TuitionFeeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    enrollmentId?: Prisma.SortOrder;
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    enrollment?: Prisma.EnrollmentOrderByWithRelationInput;
    payments?: Prisma.TuitionPaymentOrderByRelationAggregateInput;
};
export type TuitionFeeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    enrollmentId_billingYear_billingMonth?: Prisma.TuitionFeeEnrollmentIdBillingYearBillingMonthCompoundUniqueInput;
    AND?: Prisma.TuitionFeeWhereInput | Prisma.TuitionFeeWhereInput[];
    OR?: Prisma.TuitionFeeWhereInput[];
    NOT?: Prisma.TuitionFeeWhereInput | Prisma.TuitionFeeWhereInput[];
    enrollmentId?: Prisma.StringFilter<"TuitionFee"> | string;
    billingYear?: Prisma.IntFilter<"TuitionFee"> | number;
    billingMonth?: Prisma.IntFilter<"TuitionFee"> | number;
    amountDue?: Prisma.DecimalFilter<"TuitionFee"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFilter<"TuitionFee"> | $Enums.TuitionStatus;
    dueDate?: Prisma.DateTimeNullableFilter<"TuitionFee"> | Date | string | null;
    note?: Prisma.StringNullableFilter<"TuitionFee"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
    enrollment?: Prisma.XOR<Prisma.EnrollmentScalarRelationFilter, Prisma.EnrollmentWhereInput>;
    payments?: Prisma.TuitionPaymentListRelationFilter;
}, "id" | "enrollmentId_billingYear_billingMonth">;
export type TuitionFeeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    enrollmentId?: Prisma.SortOrder;
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TuitionFeeCountOrderByAggregateInput;
    _avg?: Prisma.TuitionFeeAvgOrderByAggregateInput;
    _max?: Prisma.TuitionFeeMaxOrderByAggregateInput;
    _min?: Prisma.TuitionFeeMinOrderByAggregateInput;
    _sum?: Prisma.TuitionFeeSumOrderByAggregateInput;
};
export type TuitionFeeScalarWhereWithAggregatesInput = {
    AND?: Prisma.TuitionFeeScalarWhereWithAggregatesInput | Prisma.TuitionFeeScalarWhereWithAggregatesInput[];
    OR?: Prisma.TuitionFeeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TuitionFeeScalarWhereWithAggregatesInput | Prisma.TuitionFeeScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"TuitionFee"> | string;
    enrollmentId?: Prisma.StringWithAggregatesFilter<"TuitionFee"> | string;
    billingYear?: Prisma.IntWithAggregatesFilter<"TuitionFee"> | number;
    billingMonth?: Prisma.IntWithAggregatesFilter<"TuitionFee"> | number;
    amountDue?: Prisma.DecimalWithAggregatesFilter<"TuitionFee"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusWithAggregatesFilter<"TuitionFee"> | $Enums.TuitionStatus;
    dueDate?: Prisma.DateTimeNullableWithAggregatesFilter<"TuitionFee"> | Date | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"TuitionFee"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TuitionFee"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"TuitionFee"> | Date | string;
};
export type TuitionFeeCreateInput = {
    id?: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    enrollment: Prisma.EnrollmentCreateNestedOneWithoutTuitionFeesInput;
    payments?: Prisma.TuitionPaymentCreateNestedManyWithoutTuitionFeeInput;
};
export type TuitionFeeUncheckedCreateInput = {
    id?: string;
    enrollmentId: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    payments?: Prisma.TuitionPaymentUncheckedCreateNestedManyWithoutTuitionFeeInput;
};
export type TuitionFeeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    enrollment?: Prisma.EnrollmentUpdateOneRequiredWithoutTuitionFeesNestedInput;
    payments?: Prisma.TuitionPaymentUpdateManyWithoutTuitionFeeNestedInput;
};
export type TuitionFeeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enrollmentId?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.TuitionPaymentUncheckedUpdateManyWithoutTuitionFeeNestedInput;
};
export type TuitionFeeCreateManyInput = {
    id?: string;
    enrollmentId: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionFeeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionFeeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enrollmentId?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionFeeListRelationFilter = {
    every?: Prisma.TuitionFeeWhereInput;
    some?: Prisma.TuitionFeeWhereInput;
    none?: Prisma.TuitionFeeWhereInput;
};
export type TuitionFeeOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TuitionFeeEnrollmentIdBillingYearBillingMonthCompoundUniqueInput = {
    enrollmentId: string;
    billingYear: number;
    billingMonth: number;
};
export type TuitionFeeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    enrollmentId?: Prisma.SortOrder;
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionFeeAvgOrderByAggregateInput = {
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
};
export type TuitionFeeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    enrollmentId?: Prisma.SortOrder;
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionFeeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    enrollmentId?: Prisma.SortOrder;
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    dueDate?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionFeeSumOrderByAggregateInput = {
    billingYear?: Prisma.SortOrder;
    billingMonth?: Prisma.SortOrder;
    amountDue?: Prisma.SortOrder;
};
export type TuitionFeeScalarRelationFilter = {
    is?: Prisma.TuitionFeeWhereInput;
    isNot?: Prisma.TuitionFeeWhereInput;
};
export type TuitionFeeCreateNestedManyWithoutEnrollmentInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput> | Prisma.TuitionFeeCreateWithoutEnrollmentInput[] | Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput[];
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput | Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput[];
    createMany?: Prisma.TuitionFeeCreateManyEnrollmentInputEnvelope;
    connect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
};
export type TuitionFeeUncheckedCreateNestedManyWithoutEnrollmentInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput> | Prisma.TuitionFeeCreateWithoutEnrollmentInput[] | Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput[];
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput | Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput[];
    createMany?: Prisma.TuitionFeeCreateManyEnrollmentInputEnvelope;
    connect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
};
export type TuitionFeeUpdateManyWithoutEnrollmentNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput> | Prisma.TuitionFeeCreateWithoutEnrollmentInput[] | Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput[];
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput | Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput[];
    upsert?: Prisma.TuitionFeeUpsertWithWhereUniqueWithoutEnrollmentInput | Prisma.TuitionFeeUpsertWithWhereUniqueWithoutEnrollmentInput[];
    createMany?: Prisma.TuitionFeeCreateManyEnrollmentInputEnvelope;
    set?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    disconnect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    delete?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    connect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    update?: Prisma.TuitionFeeUpdateWithWhereUniqueWithoutEnrollmentInput | Prisma.TuitionFeeUpdateWithWhereUniqueWithoutEnrollmentInput[];
    updateMany?: Prisma.TuitionFeeUpdateManyWithWhereWithoutEnrollmentInput | Prisma.TuitionFeeUpdateManyWithWhereWithoutEnrollmentInput[];
    deleteMany?: Prisma.TuitionFeeScalarWhereInput | Prisma.TuitionFeeScalarWhereInput[];
};
export type TuitionFeeUncheckedUpdateManyWithoutEnrollmentNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput> | Prisma.TuitionFeeCreateWithoutEnrollmentInput[] | Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput[];
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput | Prisma.TuitionFeeCreateOrConnectWithoutEnrollmentInput[];
    upsert?: Prisma.TuitionFeeUpsertWithWhereUniqueWithoutEnrollmentInput | Prisma.TuitionFeeUpsertWithWhereUniqueWithoutEnrollmentInput[];
    createMany?: Prisma.TuitionFeeCreateManyEnrollmentInputEnvelope;
    set?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    disconnect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    delete?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    connect?: Prisma.TuitionFeeWhereUniqueInput | Prisma.TuitionFeeWhereUniqueInput[];
    update?: Prisma.TuitionFeeUpdateWithWhereUniqueWithoutEnrollmentInput | Prisma.TuitionFeeUpdateWithWhereUniqueWithoutEnrollmentInput[];
    updateMany?: Prisma.TuitionFeeUpdateManyWithWhereWithoutEnrollmentInput | Prisma.TuitionFeeUpdateManyWithWhereWithoutEnrollmentInput[];
    deleteMany?: Prisma.TuitionFeeScalarWhereInput | Prisma.TuitionFeeScalarWhereInput[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumTuitionStatusFieldUpdateOperationsInput = {
    set?: $Enums.TuitionStatus;
};
export type TuitionFeeCreateNestedOneWithoutPaymentsInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutPaymentsInput;
    connect?: Prisma.TuitionFeeWhereUniqueInput;
};
export type TuitionFeeUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionFeeCreateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.TuitionFeeCreateOrConnectWithoutPaymentsInput;
    upsert?: Prisma.TuitionFeeUpsertWithoutPaymentsInput;
    connect?: Prisma.TuitionFeeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TuitionFeeUpdateToOneWithWhereWithoutPaymentsInput, Prisma.TuitionFeeUpdateWithoutPaymentsInput>, Prisma.TuitionFeeUncheckedUpdateWithoutPaymentsInput>;
};
export type TuitionFeeCreateWithoutEnrollmentInput = {
    id?: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    payments?: Prisma.TuitionPaymentCreateNestedManyWithoutTuitionFeeInput;
};
export type TuitionFeeUncheckedCreateWithoutEnrollmentInput = {
    id?: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    payments?: Prisma.TuitionPaymentUncheckedCreateNestedManyWithoutTuitionFeeInput;
};
export type TuitionFeeCreateOrConnectWithoutEnrollmentInput = {
    where: Prisma.TuitionFeeWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput>;
};
export type TuitionFeeCreateManyEnrollmentInputEnvelope = {
    data: Prisma.TuitionFeeCreateManyEnrollmentInput | Prisma.TuitionFeeCreateManyEnrollmentInput[];
    skipDuplicates?: boolean;
};
export type TuitionFeeUpsertWithWhereUniqueWithoutEnrollmentInput = {
    where: Prisma.TuitionFeeWhereUniqueInput;
    update: Prisma.XOR<Prisma.TuitionFeeUpdateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedUpdateWithoutEnrollmentInput>;
    create: Prisma.XOR<Prisma.TuitionFeeCreateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedCreateWithoutEnrollmentInput>;
};
export type TuitionFeeUpdateWithWhereUniqueWithoutEnrollmentInput = {
    where: Prisma.TuitionFeeWhereUniqueInput;
    data: Prisma.XOR<Prisma.TuitionFeeUpdateWithoutEnrollmentInput, Prisma.TuitionFeeUncheckedUpdateWithoutEnrollmentInput>;
};
export type TuitionFeeUpdateManyWithWhereWithoutEnrollmentInput = {
    where: Prisma.TuitionFeeScalarWhereInput;
    data: Prisma.XOR<Prisma.TuitionFeeUpdateManyMutationInput, Prisma.TuitionFeeUncheckedUpdateManyWithoutEnrollmentInput>;
};
export type TuitionFeeScalarWhereInput = {
    AND?: Prisma.TuitionFeeScalarWhereInput | Prisma.TuitionFeeScalarWhereInput[];
    OR?: Prisma.TuitionFeeScalarWhereInput[];
    NOT?: Prisma.TuitionFeeScalarWhereInput | Prisma.TuitionFeeScalarWhereInput[];
    id?: Prisma.StringFilter<"TuitionFee"> | string;
    enrollmentId?: Prisma.StringFilter<"TuitionFee"> | string;
    billingYear?: Prisma.IntFilter<"TuitionFee"> | number;
    billingMonth?: Prisma.IntFilter<"TuitionFee"> | number;
    amountDue?: Prisma.DecimalFilter<"TuitionFee"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFilter<"TuitionFee"> | $Enums.TuitionStatus;
    dueDate?: Prisma.DateTimeNullableFilter<"TuitionFee"> | Date | string | null;
    note?: Prisma.StringNullableFilter<"TuitionFee"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionFee"> | Date | string;
};
export type TuitionFeeCreateWithoutPaymentsInput = {
    id?: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    enrollment: Prisma.EnrollmentCreateNestedOneWithoutTuitionFeesInput;
};
export type TuitionFeeUncheckedCreateWithoutPaymentsInput = {
    id?: string;
    enrollmentId: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionFeeCreateOrConnectWithoutPaymentsInput = {
    where: Prisma.TuitionFeeWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionFeeCreateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedCreateWithoutPaymentsInput>;
};
export type TuitionFeeUpsertWithoutPaymentsInput = {
    update: Prisma.XOR<Prisma.TuitionFeeUpdateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedUpdateWithoutPaymentsInput>;
    create: Prisma.XOR<Prisma.TuitionFeeCreateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedCreateWithoutPaymentsInput>;
    where?: Prisma.TuitionFeeWhereInput;
};
export type TuitionFeeUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: Prisma.TuitionFeeWhereInput;
    data: Prisma.XOR<Prisma.TuitionFeeUpdateWithoutPaymentsInput, Prisma.TuitionFeeUncheckedUpdateWithoutPaymentsInput>;
};
export type TuitionFeeUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    enrollment?: Prisma.EnrollmentUpdateOneRequiredWithoutTuitionFeesNestedInput;
};
export type TuitionFeeUncheckedUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enrollmentId?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionFeeCreateManyEnrollmentInput = {
    id?: string;
    billingYear: number;
    billingMonth: number;
    amountDue: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.TuitionStatus;
    dueDate?: Date | string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionFeeUpdateWithoutEnrollmentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.TuitionPaymentUpdateManyWithoutTuitionFeeNestedInput;
};
export type TuitionFeeUncheckedUpdateWithoutEnrollmentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.TuitionPaymentUncheckedUpdateManyWithoutTuitionFeeNestedInput;
};
export type TuitionFeeUncheckedUpdateManyWithoutEnrollmentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    billingYear?: Prisma.IntFieldUpdateOperationsInput | number;
    billingMonth?: Prisma.IntFieldUpdateOperationsInput | number;
    amountDue?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumTuitionStatusFieldUpdateOperationsInput | $Enums.TuitionStatus;
    dueDate?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionFeeCountOutputType = {
    payments: number;
};
export type TuitionFeeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    payments?: boolean | TuitionFeeCountOutputTypeCountPaymentsArgs;
};
export type TuitionFeeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeCountOutputTypeSelect<ExtArgs> | null;
};
export type TuitionFeeCountOutputTypeCountPaymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionPaymentWhereInput;
};
export type TuitionFeeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    enrollmentId?: boolean;
    billingYear?: boolean;
    billingMonth?: boolean;
    amountDue?: boolean;
    status?: boolean;
    dueDate?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
    payments?: boolean | Prisma.TuitionFee$paymentsArgs<ExtArgs>;
    _count?: boolean | Prisma.TuitionFeeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionFee"]>;
export type TuitionFeeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    enrollmentId?: boolean;
    billingYear?: boolean;
    billingMonth?: boolean;
    amountDue?: boolean;
    status?: boolean;
    dueDate?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionFee"]>;
export type TuitionFeeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    enrollmentId?: boolean;
    billingYear?: boolean;
    billingMonth?: boolean;
    amountDue?: boolean;
    status?: boolean;
    dueDate?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionFee"]>;
export type TuitionFeeSelectScalar = {
    id?: boolean;
    enrollmentId?: boolean;
    billingYear?: boolean;
    billingMonth?: boolean;
    amountDue?: boolean;
    status?: boolean;
    dueDate?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TuitionFeeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "enrollmentId" | "billingYear" | "billingMonth" | "amountDue" | "status" | "dueDate" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["tuitionFee"]>;
export type TuitionFeeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
    payments?: boolean | Prisma.TuitionFee$paymentsArgs<ExtArgs>;
    _count?: boolean | Prisma.TuitionFeeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TuitionFeeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
};
export type TuitionFeeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    enrollment?: boolean | Prisma.EnrollmentDefaultArgs<ExtArgs>;
};
export type $TuitionFeePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TuitionFee";
    objects: {
        enrollment: Prisma.$EnrollmentPayload<ExtArgs>;
        payments: Prisma.$TuitionPaymentPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        enrollmentId: string;
        billingYear: number;
        billingMonth: number;
        amountDue: runtime.Decimal;
        status: $Enums.TuitionStatus;
        dueDate: Date | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tuitionFee"]>;
    composites: {};
};
export type TuitionFeeGetPayload<S extends boolean | null | undefined | TuitionFeeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload, S>;
export type TuitionFeeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TuitionFeeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TuitionFeeCountAggregateInputType | true;
};
export interface TuitionFeeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TuitionFee'];
        meta: {
            name: 'TuitionFee';
        };
    };
    findUnique<T extends TuitionFeeFindUniqueArgs>(args: Prisma.SelectSubset<T, TuitionFeeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TuitionFeeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TuitionFeeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TuitionFeeFindFirstArgs>(args?: Prisma.SelectSubset<T, TuitionFeeFindFirstArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TuitionFeeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TuitionFeeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TuitionFeeFindManyArgs>(args?: Prisma.SelectSubset<T, TuitionFeeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TuitionFeeCreateArgs>(args: Prisma.SelectSubset<T, TuitionFeeCreateArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TuitionFeeCreateManyArgs>(args?: Prisma.SelectSubset<T, TuitionFeeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TuitionFeeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TuitionFeeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TuitionFeeDeleteArgs>(args: Prisma.SelectSubset<T, TuitionFeeDeleteArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TuitionFeeUpdateArgs>(args: Prisma.SelectSubset<T, TuitionFeeUpdateArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TuitionFeeDeleteManyArgs>(args?: Prisma.SelectSubset<T, TuitionFeeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TuitionFeeUpdateManyArgs>(args: Prisma.SelectSubset<T, TuitionFeeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TuitionFeeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TuitionFeeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TuitionFeeUpsertArgs>(args: Prisma.SelectSubset<T, TuitionFeeUpsertArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TuitionFeeCountArgs>(args?: Prisma.Subset<T, TuitionFeeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TuitionFeeCountAggregateOutputType> : number>;
    aggregate<T extends TuitionFeeAggregateArgs>(args: Prisma.Subset<T, TuitionFeeAggregateArgs>): Prisma.PrismaPromise<GetTuitionFeeAggregateType<T>>;
    groupBy<T extends TuitionFeeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TuitionFeeGroupByArgs['orderBy'];
    } : {
        orderBy?: TuitionFeeGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TuitionFeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTuitionFeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TuitionFeeFieldRefs;
}
export interface Prisma__TuitionFeeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    enrollment<T extends Prisma.EnrollmentDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EnrollmentDefaultArgs<ExtArgs>>): Prisma.Prisma__EnrollmentClient<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    payments<T extends Prisma.TuitionFee$paymentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TuitionFee$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TuitionFeeFieldRefs {
    readonly id: Prisma.FieldRef<"TuitionFee", 'String'>;
    readonly enrollmentId: Prisma.FieldRef<"TuitionFee", 'String'>;
    readonly billingYear: Prisma.FieldRef<"TuitionFee", 'Int'>;
    readonly billingMonth: Prisma.FieldRef<"TuitionFee", 'Int'>;
    readonly amountDue: Prisma.FieldRef<"TuitionFee", 'Decimal'>;
    readonly status: Prisma.FieldRef<"TuitionFee", 'TuitionStatus'>;
    readonly dueDate: Prisma.FieldRef<"TuitionFee", 'DateTime'>;
    readonly note: Prisma.FieldRef<"TuitionFee", 'String'>;
    readonly createdAt: Prisma.FieldRef<"TuitionFee", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"TuitionFee", 'DateTime'>;
}
export type TuitionFeeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    where: Prisma.TuitionFeeWhereUniqueInput;
};
export type TuitionFeeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    where: Prisma.TuitionFeeWhereUniqueInput;
};
export type TuitionFeeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionFeeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionFeeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionFeeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionFeeCreateInput, Prisma.TuitionFeeUncheckedCreateInput>;
};
export type TuitionFeeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TuitionFeeCreateManyInput | Prisma.TuitionFeeCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TuitionFeeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    data: Prisma.TuitionFeeCreateManyInput | Prisma.TuitionFeeCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TuitionFeeIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TuitionFeeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionFeeUpdateInput, Prisma.TuitionFeeUncheckedUpdateInput>;
    where: Prisma.TuitionFeeWhereUniqueInput;
};
export type TuitionFeeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TuitionFeeUpdateManyMutationInput, Prisma.TuitionFeeUncheckedUpdateManyInput>;
    where?: Prisma.TuitionFeeWhereInput;
    limit?: number;
};
export type TuitionFeeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionFeeUpdateManyMutationInput, Prisma.TuitionFeeUncheckedUpdateManyInput>;
    where?: Prisma.TuitionFeeWhereInput;
    limit?: number;
    include?: Prisma.TuitionFeeIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TuitionFeeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    where: Prisma.TuitionFeeWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionFeeCreateInput, Prisma.TuitionFeeUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TuitionFeeUpdateInput, Prisma.TuitionFeeUncheckedUpdateInput>;
};
export type TuitionFeeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
    where: Prisma.TuitionFeeWhereUniqueInput;
};
export type TuitionFeeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionFeeWhereInput;
    limit?: number;
};
export type TuitionFee$paymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    where?: Prisma.TuitionPaymentWhereInput;
    orderBy?: Prisma.TuitionPaymentOrderByWithRelationInput | Prisma.TuitionPaymentOrderByWithRelationInput[];
    cursor?: Prisma.TuitionPaymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TuitionPaymentScalarFieldEnum | Prisma.TuitionPaymentScalarFieldEnum[];
};
export type TuitionFeeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionFeeSelect<ExtArgs> | null;
    omit?: Prisma.TuitionFeeOmit<ExtArgs> | null;
    include?: Prisma.TuitionFeeInclude<ExtArgs> | null;
};
