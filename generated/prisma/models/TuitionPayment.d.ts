import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TuitionPaymentModel = runtime.Types.Result.DefaultSelection<Prisma.$TuitionPaymentPayload>;
export type AggregateTuitionPayment = {
    _count: TuitionPaymentCountAggregateOutputType | null;
    _avg: TuitionPaymentAvgAggregateOutputType | null;
    _sum: TuitionPaymentSumAggregateOutputType | null;
    _min: TuitionPaymentMinAggregateOutputType | null;
    _max: TuitionPaymentMaxAggregateOutputType | null;
};
export type TuitionPaymentAvgAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type TuitionPaymentSumAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type TuitionPaymentMinAggregateOutputType = {
    id: string | null;
    tuitionFeeId: string | null;
    amount: runtime.Decimal | null;
    paymentDate: Date | null;
    paymentMethod: string | null;
    isVoided: boolean | null;
    voidedAt: Date | null;
    voidReason: string | null;
    voidedById: string | null;
    recordedById: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TuitionPaymentMaxAggregateOutputType = {
    id: string | null;
    tuitionFeeId: string | null;
    amount: runtime.Decimal | null;
    paymentDate: Date | null;
    paymentMethod: string | null;
    isVoided: boolean | null;
    voidedAt: Date | null;
    voidReason: string | null;
    voidedById: string | null;
    recordedById: string | null;
    note: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TuitionPaymentCountAggregateOutputType = {
    id: number;
    tuitionFeeId: number;
    amount: number;
    paymentDate: number;
    paymentMethod: number;
    isVoided: number;
    voidedAt: number;
    voidReason: number;
    voidedById: number;
    recordedById: number;
    note: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TuitionPaymentAvgAggregateInputType = {
    amount?: true;
};
export type TuitionPaymentSumAggregateInputType = {
    amount?: true;
};
export type TuitionPaymentMinAggregateInputType = {
    id?: true;
    tuitionFeeId?: true;
    amount?: true;
    paymentDate?: true;
    paymentMethod?: true;
    isVoided?: true;
    voidedAt?: true;
    voidReason?: true;
    voidedById?: true;
    recordedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TuitionPaymentMaxAggregateInputType = {
    id?: true;
    tuitionFeeId?: true;
    amount?: true;
    paymentDate?: true;
    paymentMethod?: true;
    isVoided?: true;
    voidedAt?: true;
    voidReason?: true;
    voidedById?: true;
    recordedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TuitionPaymentCountAggregateInputType = {
    id?: true;
    tuitionFeeId?: true;
    amount?: true;
    paymentDate?: true;
    paymentMethod?: true;
    isVoided?: true;
    voidedAt?: true;
    voidReason?: true;
    voidedById?: true;
    recordedById?: true;
    note?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TuitionPaymentAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionPaymentWhereInput;
    orderBy?: Prisma.TuitionPaymentOrderByWithRelationInput | Prisma.TuitionPaymentOrderByWithRelationInput[];
    cursor?: Prisma.TuitionPaymentWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TuitionPaymentCountAggregateInputType;
    _avg?: TuitionPaymentAvgAggregateInputType;
    _sum?: TuitionPaymentSumAggregateInputType;
    _min?: TuitionPaymentMinAggregateInputType;
    _max?: TuitionPaymentMaxAggregateInputType;
};
export type GetTuitionPaymentAggregateType<T extends TuitionPaymentAggregateArgs> = {
    [P in keyof T & keyof AggregateTuitionPayment]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTuitionPayment[P]> : Prisma.GetScalarType<T[P], AggregateTuitionPayment[P]>;
};
export type TuitionPaymentGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionPaymentWhereInput;
    orderBy?: Prisma.TuitionPaymentOrderByWithAggregationInput | Prisma.TuitionPaymentOrderByWithAggregationInput[];
    by: Prisma.TuitionPaymentScalarFieldEnum[] | Prisma.TuitionPaymentScalarFieldEnum;
    having?: Prisma.TuitionPaymentScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TuitionPaymentCountAggregateInputType | true;
    _avg?: TuitionPaymentAvgAggregateInputType;
    _sum?: TuitionPaymentSumAggregateInputType;
    _min?: TuitionPaymentMinAggregateInputType;
    _max?: TuitionPaymentMaxAggregateInputType;
};
export type TuitionPaymentGroupByOutputType = {
    id: string;
    tuitionFeeId: string;
    amount: runtime.Decimal;
    paymentDate: Date;
    paymentMethod: string | null;
    isVoided: boolean;
    voidedAt: Date | null;
    voidReason: string | null;
    voidedById: string | null;
    recordedById: string;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TuitionPaymentCountAggregateOutputType | null;
    _avg: TuitionPaymentAvgAggregateOutputType | null;
    _sum: TuitionPaymentSumAggregateOutputType | null;
    _min: TuitionPaymentMinAggregateOutputType | null;
    _max: TuitionPaymentMaxAggregateOutputType | null;
};
export type GetTuitionPaymentGroupByPayload<T extends TuitionPaymentGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TuitionPaymentGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TuitionPaymentGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TuitionPaymentGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TuitionPaymentGroupByOutputType[P]>;
}>>;
export type TuitionPaymentWhereInput = {
    AND?: Prisma.TuitionPaymentWhereInput | Prisma.TuitionPaymentWhereInput[];
    OR?: Prisma.TuitionPaymentWhereInput[];
    NOT?: Prisma.TuitionPaymentWhereInput | Prisma.TuitionPaymentWhereInput[];
    id?: Prisma.StringFilter<"TuitionPayment"> | string;
    tuitionFeeId?: Prisma.StringFilter<"TuitionPayment"> | string;
    amount?: Prisma.DecimalFilter<"TuitionPayment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    paymentMethod?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    isVoided?: Prisma.BoolFilter<"TuitionPayment"> | boolean;
    voidedAt?: Prisma.DateTimeNullableFilter<"TuitionPayment"> | Date | string | null;
    voidReason?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    voidedById?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    recordedById?: Prisma.StringFilter<"TuitionPayment"> | string;
    note?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    tuitionFee?: Prisma.XOR<Prisma.TuitionFeeScalarRelationFilter, Prisma.TuitionFeeWhereInput>;
    recordedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    voidedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type TuitionPaymentOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tuitionFeeId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    paymentDate?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrderInput | Prisma.SortOrder;
    isVoided?: Prisma.SortOrder;
    voidedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    voidReason?: Prisma.SortOrderInput | Prisma.SortOrder;
    voidedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    recordedById?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    tuitionFee?: Prisma.TuitionFeeOrderByWithRelationInput;
    recordedBy?: Prisma.UserOrderByWithRelationInput;
    voidedBy?: Prisma.UserOrderByWithRelationInput;
};
export type TuitionPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.TuitionPaymentWhereInput | Prisma.TuitionPaymentWhereInput[];
    OR?: Prisma.TuitionPaymentWhereInput[];
    NOT?: Prisma.TuitionPaymentWhereInput | Prisma.TuitionPaymentWhereInput[];
    tuitionFeeId?: Prisma.StringFilter<"TuitionPayment"> | string;
    amount?: Prisma.DecimalFilter<"TuitionPayment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    paymentMethod?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    isVoided?: Prisma.BoolFilter<"TuitionPayment"> | boolean;
    voidedAt?: Prisma.DateTimeNullableFilter<"TuitionPayment"> | Date | string | null;
    voidReason?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    voidedById?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    recordedById?: Prisma.StringFilter<"TuitionPayment"> | string;
    note?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    tuitionFee?: Prisma.XOR<Prisma.TuitionFeeScalarRelationFilter, Prisma.TuitionFeeWhereInput>;
    recordedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    voidedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type TuitionPaymentOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tuitionFeeId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    paymentDate?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrderInput | Prisma.SortOrder;
    isVoided?: Prisma.SortOrder;
    voidedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    voidReason?: Prisma.SortOrderInput | Prisma.SortOrder;
    voidedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    recordedById?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TuitionPaymentCountOrderByAggregateInput;
    _avg?: Prisma.TuitionPaymentAvgOrderByAggregateInput;
    _max?: Prisma.TuitionPaymentMaxOrderByAggregateInput;
    _min?: Prisma.TuitionPaymentMinOrderByAggregateInput;
    _sum?: Prisma.TuitionPaymentSumOrderByAggregateInput;
};
export type TuitionPaymentScalarWhereWithAggregatesInput = {
    AND?: Prisma.TuitionPaymentScalarWhereWithAggregatesInput | Prisma.TuitionPaymentScalarWhereWithAggregatesInput[];
    OR?: Prisma.TuitionPaymentScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TuitionPaymentScalarWhereWithAggregatesInput | Prisma.TuitionPaymentScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"TuitionPayment"> | string;
    tuitionFeeId?: Prisma.StringWithAggregatesFilter<"TuitionPayment"> | string;
    amount?: Prisma.DecimalWithAggregatesFilter<"TuitionPayment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeWithAggregatesFilter<"TuitionPayment"> | Date | string;
    paymentMethod?: Prisma.StringNullableWithAggregatesFilter<"TuitionPayment"> | string | null;
    isVoided?: Prisma.BoolWithAggregatesFilter<"TuitionPayment"> | boolean;
    voidedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"TuitionPayment"> | Date | string | null;
    voidReason?: Prisma.StringNullableWithAggregatesFilter<"TuitionPayment"> | string | null;
    voidedById?: Prisma.StringNullableWithAggregatesFilter<"TuitionPayment"> | string | null;
    recordedById?: Prisma.StringWithAggregatesFilter<"TuitionPayment"> | string;
    note?: Prisma.StringNullableWithAggregatesFilter<"TuitionPayment"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"TuitionPayment"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"TuitionPayment"> | Date | string;
};
export type TuitionPaymentCreateInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFee: Prisma.TuitionFeeCreateNestedOneWithoutPaymentsInput;
    recordedBy: Prisma.UserCreateNestedOneWithoutRecordedTuitionPaymentsInput;
    voidedBy?: Prisma.UserCreateNestedOneWithoutVoidedTuitionPaymentsInput;
};
export type TuitionPaymentUncheckedCreateInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFee?: Prisma.TuitionFeeUpdateOneRequiredWithoutPaymentsNestedInput;
    recordedBy?: Prisma.UserUpdateOneRequiredWithoutRecordedTuitionPaymentsNestedInput;
    voidedBy?: Prisma.UserUpdateOneWithoutVoidedTuitionPaymentsNestedInput;
};
export type TuitionPaymentUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentCreateManyInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentListRelationFilter = {
    every?: Prisma.TuitionPaymentWhereInput;
    some?: Prisma.TuitionPaymentWhereInput;
    none?: Prisma.TuitionPaymentWhereInput;
};
export type TuitionPaymentOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type TuitionPaymentCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tuitionFeeId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    paymentDate?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    isVoided?: Prisma.SortOrder;
    voidedAt?: Prisma.SortOrder;
    voidReason?: Prisma.SortOrder;
    voidedById?: Prisma.SortOrder;
    recordedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionPaymentAvgOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type TuitionPaymentMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tuitionFeeId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    paymentDate?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    isVoided?: Prisma.SortOrder;
    voidedAt?: Prisma.SortOrder;
    voidReason?: Prisma.SortOrder;
    voidedById?: Prisma.SortOrder;
    recordedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionPaymentMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tuitionFeeId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    paymentDate?: Prisma.SortOrder;
    paymentMethod?: Prisma.SortOrder;
    isVoided?: Prisma.SortOrder;
    voidedAt?: Prisma.SortOrder;
    voidReason?: Prisma.SortOrder;
    voidedById?: Prisma.SortOrder;
    recordedById?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TuitionPaymentSumOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type TuitionPaymentCreateNestedManyWithoutRecordedByInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput> | Prisma.TuitionPaymentCreateWithoutRecordedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyRecordedByInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentCreateNestedManyWithoutVoidedByInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput> | Prisma.TuitionPaymentCreateWithoutVoidedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyVoidedByInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentUncheckedCreateNestedManyWithoutRecordedByInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput> | Prisma.TuitionPaymentCreateWithoutRecordedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyRecordedByInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentUncheckedCreateNestedManyWithoutVoidedByInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput> | Prisma.TuitionPaymentCreateWithoutVoidedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyVoidedByInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentUpdateManyWithoutRecordedByNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput> | Prisma.TuitionPaymentCreateWithoutRecordedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutRecordedByInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutRecordedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyRecordedByInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutRecordedByInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutRecordedByInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutRecordedByInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutRecordedByInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentUpdateManyWithoutVoidedByNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput> | Prisma.TuitionPaymentCreateWithoutVoidedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutVoidedByInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutVoidedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyVoidedByInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutVoidedByInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutVoidedByInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutVoidedByInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutVoidedByInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentUncheckedUpdateManyWithoutRecordedByNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput> | Prisma.TuitionPaymentCreateWithoutRecordedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutRecordedByInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutRecordedByInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutRecordedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyRecordedByInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutRecordedByInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutRecordedByInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutRecordedByInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutRecordedByInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentUncheckedUpdateManyWithoutVoidedByNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput> | Prisma.TuitionPaymentCreateWithoutVoidedByInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput | Prisma.TuitionPaymentCreateOrConnectWithoutVoidedByInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutVoidedByInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutVoidedByInput[];
    createMany?: Prisma.TuitionPaymentCreateManyVoidedByInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutVoidedByInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutVoidedByInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutVoidedByInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutVoidedByInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentCreateNestedManyWithoutTuitionFeeInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput> | Prisma.TuitionPaymentCreateWithoutTuitionFeeInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput | Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput[];
    createMany?: Prisma.TuitionPaymentCreateManyTuitionFeeInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentUncheckedCreateNestedManyWithoutTuitionFeeInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput> | Prisma.TuitionPaymentCreateWithoutTuitionFeeInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput | Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput[];
    createMany?: Prisma.TuitionPaymentCreateManyTuitionFeeInputEnvelope;
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
};
export type TuitionPaymentUpdateManyWithoutTuitionFeeNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput> | Prisma.TuitionPaymentCreateWithoutTuitionFeeInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput | Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutTuitionFeeInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutTuitionFeeInput[];
    createMany?: Prisma.TuitionPaymentCreateManyTuitionFeeInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutTuitionFeeInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutTuitionFeeInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutTuitionFeeInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutTuitionFeeInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentUncheckedUpdateManyWithoutTuitionFeeNestedInput = {
    create?: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput> | Prisma.TuitionPaymentCreateWithoutTuitionFeeInput[] | Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput[];
    connectOrCreate?: Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput | Prisma.TuitionPaymentCreateOrConnectWithoutTuitionFeeInput[];
    upsert?: Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutTuitionFeeInput | Prisma.TuitionPaymentUpsertWithWhereUniqueWithoutTuitionFeeInput[];
    createMany?: Prisma.TuitionPaymentCreateManyTuitionFeeInputEnvelope;
    set?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    disconnect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    delete?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    connect?: Prisma.TuitionPaymentWhereUniqueInput | Prisma.TuitionPaymentWhereUniqueInput[];
    update?: Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutTuitionFeeInput | Prisma.TuitionPaymentUpdateWithWhereUniqueWithoutTuitionFeeInput[];
    updateMany?: Prisma.TuitionPaymentUpdateManyWithWhereWithoutTuitionFeeInput | Prisma.TuitionPaymentUpdateManyWithWhereWithoutTuitionFeeInput[];
    deleteMany?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
};
export type TuitionPaymentCreateWithoutRecordedByInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFee: Prisma.TuitionFeeCreateNestedOneWithoutPaymentsInput;
    voidedBy?: Prisma.UserCreateNestedOneWithoutVoidedTuitionPaymentsInput;
};
export type TuitionPaymentUncheckedCreateWithoutRecordedByInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentCreateOrConnectWithoutRecordedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput>;
};
export type TuitionPaymentCreateManyRecordedByInputEnvelope = {
    data: Prisma.TuitionPaymentCreateManyRecordedByInput | Prisma.TuitionPaymentCreateManyRecordedByInput[];
    skipDuplicates?: boolean;
};
export type TuitionPaymentCreateWithoutVoidedByInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tuitionFee: Prisma.TuitionFeeCreateNestedOneWithoutPaymentsInput;
    recordedBy: Prisma.UserCreateNestedOneWithoutRecordedTuitionPaymentsInput;
};
export type TuitionPaymentUncheckedCreateWithoutVoidedByInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentCreateOrConnectWithoutVoidedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput>;
};
export type TuitionPaymentCreateManyVoidedByInputEnvelope = {
    data: Prisma.TuitionPaymentCreateManyVoidedByInput | Prisma.TuitionPaymentCreateManyVoidedByInput[];
    skipDuplicates?: boolean;
};
export type TuitionPaymentUpsertWithWhereUniqueWithoutRecordedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    update: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedUpdateWithoutRecordedByInput>;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutRecordedByInput>;
};
export type TuitionPaymentUpdateWithWhereUniqueWithoutRecordedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutRecordedByInput, Prisma.TuitionPaymentUncheckedUpdateWithoutRecordedByInput>;
};
export type TuitionPaymentUpdateManyWithWhereWithoutRecordedByInput = {
    where: Prisma.TuitionPaymentScalarWhereInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateManyMutationInput, Prisma.TuitionPaymentUncheckedUpdateManyWithoutRecordedByInput>;
};
export type TuitionPaymentScalarWhereInput = {
    AND?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
    OR?: Prisma.TuitionPaymentScalarWhereInput[];
    NOT?: Prisma.TuitionPaymentScalarWhereInput | Prisma.TuitionPaymentScalarWhereInput[];
    id?: Prisma.StringFilter<"TuitionPayment"> | string;
    tuitionFeeId?: Prisma.StringFilter<"TuitionPayment"> | string;
    amount?: Prisma.DecimalFilter<"TuitionPayment"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    paymentMethod?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    isVoided?: Prisma.BoolFilter<"TuitionPayment"> | boolean;
    voidedAt?: Prisma.DateTimeNullableFilter<"TuitionPayment"> | Date | string | null;
    voidReason?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    voidedById?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    recordedById?: Prisma.StringFilter<"TuitionPayment"> | string;
    note?: Prisma.StringNullableFilter<"TuitionPayment"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"TuitionPayment"> | Date | string;
};
export type TuitionPaymentUpsertWithWhereUniqueWithoutVoidedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    update: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedUpdateWithoutVoidedByInput>;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedCreateWithoutVoidedByInput>;
};
export type TuitionPaymentUpdateWithWhereUniqueWithoutVoidedByInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutVoidedByInput, Prisma.TuitionPaymentUncheckedUpdateWithoutVoidedByInput>;
};
export type TuitionPaymentUpdateManyWithWhereWithoutVoidedByInput = {
    where: Prisma.TuitionPaymentScalarWhereInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateManyMutationInput, Prisma.TuitionPaymentUncheckedUpdateManyWithoutVoidedByInput>;
};
export type TuitionPaymentCreateWithoutTuitionFeeInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    recordedBy: Prisma.UserCreateNestedOneWithoutRecordedTuitionPaymentsInput;
    voidedBy?: Prisma.UserCreateNestedOneWithoutVoidedTuitionPaymentsInput;
};
export type TuitionPaymentUncheckedCreateWithoutTuitionFeeInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentCreateOrConnectWithoutTuitionFeeInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput>;
};
export type TuitionPaymentCreateManyTuitionFeeInputEnvelope = {
    data: Prisma.TuitionPaymentCreateManyTuitionFeeInput | Prisma.TuitionPaymentCreateManyTuitionFeeInput[];
    skipDuplicates?: boolean;
};
export type TuitionPaymentUpsertWithWhereUniqueWithoutTuitionFeeInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    update: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedUpdateWithoutTuitionFeeInput>;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedCreateWithoutTuitionFeeInput>;
};
export type TuitionPaymentUpdateWithWhereUniqueWithoutTuitionFeeInput = {
    where: Prisma.TuitionPaymentWhereUniqueInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateWithoutTuitionFeeInput, Prisma.TuitionPaymentUncheckedUpdateWithoutTuitionFeeInput>;
};
export type TuitionPaymentUpdateManyWithWhereWithoutTuitionFeeInput = {
    where: Prisma.TuitionPaymentScalarWhereInput;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateManyMutationInput, Prisma.TuitionPaymentUncheckedUpdateManyWithoutTuitionFeeInput>;
};
export type TuitionPaymentCreateManyRecordedByInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentCreateManyVoidedByInput = {
    id?: string;
    tuitionFeeId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentUpdateWithoutRecordedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFee?: Prisma.TuitionFeeUpdateOneRequiredWithoutPaymentsNestedInput;
    voidedBy?: Prisma.UserUpdateOneWithoutVoidedTuitionPaymentsNestedInput;
};
export type TuitionPaymentUncheckedUpdateWithoutRecordedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentUncheckedUpdateManyWithoutRecordedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentUpdateWithoutVoidedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tuitionFee?: Prisma.TuitionFeeUpdateOneRequiredWithoutPaymentsNestedInput;
    recordedBy?: Prisma.UserUpdateOneRequiredWithoutRecordedTuitionPaymentsNestedInput;
};
export type TuitionPaymentUncheckedUpdateWithoutVoidedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentUncheckedUpdateManyWithoutVoidedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tuitionFeeId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentCreateManyTuitionFeeInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Date | string;
    paymentMethod?: string | null;
    isVoided?: boolean;
    voidedAt?: Date | string | null;
    voidReason?: string | null;
    voidedById?: string | null;
    recordedById: string;
    note?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TuitionPaymentUpdateWithoutTuitionFeeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    recordedBy?: Prisma.UserUpdateOneRequiredWithoutRecordedTuitionPaymentsNestedInput;
    voidedBy?: Prisma.UserUpdateOneWithoutVoidedTuitionPaymentsNestedInput;
};
export type TuitionPaymentUncheckedUpdateWithoutTuitionFeeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentUncheckedUpdateManyWithoutTuitionFeeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    paymentDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    paymentMethod?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    isVoided?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    voidedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    voidReason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    voidedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    recordedById?: Prisma.StringFieldUpdateOperationsInput | string;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TuitionPaymentSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tuitionFeeId?: boolean;
    amount?: boolean;
    paymentDate?: boolean;
    paymentMethod?: boolean;
    isVoided?: boolean;
    voidedAt?: boolean;
    voidReason?: boolean;
    voidedById?: boolean;
    recordedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionPayment"]>;
export type TuitionPaymentSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tuitionFeeId?: boolean;
    amount?: boolean;
    paymentDate?: boolean;
    paymentMethod?: boolean;
    isVoided?: boolean;
    voidedAt?: boolean;
    voidReason?: boolean;
    voidedById?: boolean;
    recordedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionPayment"]>;
export type TuitionPaymentSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tuitionFeeId?: boolean;
    amount?: boolean;
    paymentDate?: boolean;
    paymentMethod?: boolean;
    isVoided?: boolean;
    voidedAt?: boolean;
    voidReason?: boolean;
    voidedById?: boolean;
    recordedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
}, ExtArgs["result"]["tuitionPayment"]>;
export type TuitionPaymentSelectScalar = {
    id?: boolean;
    tuitionFeeId?: boolean;
    amount?: boolean;
    paymentDate?: boolean;
    paymentMethod?: boolean;
    isVoided?: boolean;
    voidedAt?: boolean;
    voidReason?: boolean;
    voidedById?: boolean;
    recordedById?: boolean;
    note?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TuitionPaymentOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tuitionFeeId" | "amount" | "paymentDate" | "paymentMethod" | "isVoided" | "voidedAt" | "voidReason" | "voidedById" | "recordedById" | "note" | "createdAt" | "updatedAt", ExtArgs["result"]["tuitionPayment"]>;
export type TuitionPaymentInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
};
export type TuitionPaymentIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
};
export type TuitionPaymentIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tuitionFee?: boolean | Prisma.TuitionFeeDefaultArgs<ExtArgs>;
    recordedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    voidedBy?: boolean | Prisma.TuitionPayment$voidedByArgs<ExtArgs>;
};
export type $TuitionPaymentPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "TuitionPayment";
    objects: {
        tuitionFee: Prisma.$TuitionFeePayload<ExtArgs>;
        recordedBy: Prisma.$UserPayload<ExtArgs>;
        voidedBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tuitionFeeId: string;
        amount: runtime.Decimal;
        paymentDate: Date;
        paymentMethod: string | null;
        isVoided: boolean;
        voidedAt: Date | null;
        voidReason: string | null;
        voidedById: string | null;
        recordedById: string;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tuitionPayment"]>;
    composites: {};
};
export type TuitionPaymentGetPayload<S extends boolean | null | undefined | TuitionPaymentDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload, S>;
export type TuitionPaymentCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TuitionPaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TuitionPaymentCountAggregateInputType | true;
};
export interface TuitionPaymentDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['TuitionPayment'];
        meta: {
            name: 'TuitionPayment';
        };
    };
    findUnique<T extends TuitionPaymentFindUniqueArgs>(args: Prisma.SelectSubset<T, TuitionPaymentFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TuitionPaymentFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TuitionPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TuitionPaymentFindFirstArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentFindFirstArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TuitionPaymentFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TuitionPaymentFindManyArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TuitionPaymentCreateArgs>(args: Prisma.SelectSubset<T, TuitionPaymentCreateArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TuitionPaymentCreateManyArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TuitionPaymentCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TuitionPaymentDeleteArgs>(args: Prisma.SelectSubset<T, TuitionPaymentDeleteArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TuitionPaymentUpdateArgs>(args: Prisma.SelectSubset<T, TuitionPaymentUpdateArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TuitionPaymentDeleteManyArgs>(args?: Prisma.SelectSubset<T, TuitionPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TuitionPaymentUpdateManyArgs>(args: Prisma.SelectSubset<T, TuitionPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TuitionPaymentUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TuitionPaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TuitionPaymentUpsertArgs>(args: Prisma.SelectSubset<T, TuitionPaymentUpsertArgs<ExtArgs>>): Prisma.Prisma__TuitionPaymentClient<runtime.Types.Result.GetResult<Prisma.$TuitionPaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TuitionPaymentCountArgs>(args?: Prisma.Subset<T, TuitionPaymentCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TuitionPaymentCountAggregateOutputType> : number>;
    aggregate<T extends TuitionPaymentAggregateArgs>(args: Prisma.Subset<T, TuitionPaymentAggregateArgs>): Prisma.PrismaPromise<GetTuitionPaymentAggregateType<T>>;
    groupBy<T extends TuitionPaymentGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TuitionPaymentGroupByArgs['orderBy'];
    } : {
        orderBy?: TuitionPaymentGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TuitionPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTuitionPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TuitionPaymentFieldRefs;
}
export interface Prisma__TuitionPaymentClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tuitionFee<T extends Prisma.TuitionFeeDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TuitionFeeDefaultArgs<ExtArgs>>): Prisma.Prisma__TuitionFeeClient<runtime.Types.Result.GetResult<Prisma.$TuitionFeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    recordedBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    voidedBy<T extends Prisma.TuitionPayment$voidedByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TuitionPayment$voidedByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TuitionPaymentFieldRefs {
    readonly id: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly tuitionFeeId: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly amount: Prisma.FieldRef<"TuitionPayment", 'Decimal'>;
    readonly paymentDate: Prisma.FieldRef<"TuitionPayment", 'DateTime'>;
    readonly paymentMethod: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly isVoided: Prisma.FieldRef<"TuitionPayment", 'Boolean'>;
    readonly voidedAt: Prisma.FieldRef<"TuitionPayment", 'DateTime'>;
    readonly voidReason: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly voidedById: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly recordedById: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly note: Prisma.FieldRef<"TuitionPayment", 'String'>;
    readonly createdAt: Prisma.FieldRef<"TuitionPayment", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"TuitionPayment", 'DateTime'>;
}
export type TuitionPaymentFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    where: Prisma.TuitionPaymentWhereUniqueInput;
};
export type TuitionPaymentFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    where: Prisma.TuitionPaymentWhereUniqueInput;
};
export type TuitionPaymentFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionPaymentFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionPaymentFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TuitionPaymentCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionPaymentCreateInput, Prisma.TuitionPaymentUncheckedCreateInput>;
};
export type TuitionPaymentCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TuitionPaymentCreateManyInput | Prisma.TuitionPaymentCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TuitionPaymentCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    data: Prisma.TuitionPaymentCreateManyInput | Prisma.TuitionPaymentCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TuitionPaymentIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TuitionPaymentUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateInput, Prisma.TuitionPaymentUncheckedUpdateInput>;
    where: Prisma.TuitionPaymentWhereUniqueInput;
};
export type TuitionPaymentUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateManyMutationInput, Prisma.TuitionPaymentUncheckedUpdateManyInput>;
    where?: Prisma.TuitionPaymentWhereInput;
    limit?: number;
};
export type TuitionPaymentUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TuitionPaymentUpdateManyMutationInput, Prisma.TuitionPaymentUncheckedUpdateManyInput>;
    where?: Prisma.TuitionPaymentWhereInput;
    limit?: number;
    include?: Prisma.TuitionPaymentIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TuitionPaymentUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    where: Prisma.TuitionPaymentWhereUniqueInput;
    create: Prisma.XOR<Prisma.TuitionPaymentCreateInput, Prisma.TuitionPaymentUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TuitionPaymentUpdateInput, Prisma.TuitionPaymentUncheckedUpdateInput>;
};
export type TuitionPaymentDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
    where: Prisma.TuitionPaymentWhereUniqueInput;
};
export type TuitionPaymentDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TuitionPaymentWhereInput;
    limit?: number;
};
export type TuitionPayment$voidedByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type TuitionPaymentDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TuitionPaymentSelect<ExtArgs> | null;
    omit?: Prisma.TuitionPaymentOmit<ExtArgs> | null;
    include?: Prisma.TuitionPaymentInclude<ExtArgs> | null;
};
