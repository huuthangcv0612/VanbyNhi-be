import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClassMaterialModel = runtime.Types.Result.DefaultSelection<Prisma.$ClassMaterialPayload>;
export type AggregateClassMaterial = {
    _count: ClassMaterialCountAggregateOutputType | null;
    _avg: ClassMaterialAvgAggregateOutputType | null;
    _sum: ClassMaterialSumAggregateOutputType | null;
    _min: ClassMaterialMinAggregateOutputType | null;
    _max: ClassMaterialMaxAggregateOutputType | null;
};
export type ClassMaterialAvgAggregateOutputType = {
    fileSize: number | null;
};
export type ClassMaterialSumAggregateOutputType = {
    fileSize: bigint | null;
};
export type ClassMaterialMinAggregateOutputType = {
    id: string | null;
    classId: string | null;
    sessionId: string | null;
    uploadedById: string | null;
    title: string | null;
    description: string | null;
    type: $Enums.MaterialType | null;
    fileUrl: string | null;
    externalUrl: string | null;
    originalName: string | null;
    mimeType: string | null;
    fileSize: bigint | null;
    publishedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassMaterialMaxAggregateOutputType = {
    id: string | null;
    classId: string | null;
    sessionId: string | null;
    uploadedById: string | null;
    title: string | null;
    description: string | null;
    type: $Enums.MaterialType | null;
    fileUrl: string | null;
    externalUrl: string | null;
    originalName: string | null;
    mimeType: string | null;
    fileSize: bigint | null;
    publishedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassMaterialCountAggregateOutputType = {
    id: number;
    classId: number;
    sessionId: number;
    uploadedById: number;
    title: number;
    description: number;
    type: number;
    fileUrl: number;
    externalUrl: number;
    originalName: number;
    mimeType: number;
    fileSize: number;
    publishedAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ClassMaterialAvgAggregateInputType = {
    fileSize?: true;
};
export type ClassMaterialSumAggregateInputType = {
    fileSize?: true;
};
export type ClassMaterialMinAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    uploadedById?: true;
    title?: true;
    description?: true;
    type?: true;
    fileUrl?: true;
    externalUrl?: true;
    originalName?: true;
    mimeType?: true;
    fileSize?: true;
    publishedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassMaterialMaxAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    uploadedById?: true;
    title?: true;
    description?: true;
    type?: true;
    fileUrl?: true;
    externalUrl?: true;
    originalName?: true;
    mimeType?: true;
    fileSize?: true;
    publishedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassMaterialCountAggregateInputType = {
    id?: true;
    classId?: true;
    sessionId?: true;
    uploadedById?: true;
    title?: true;
    description?: true;
    type?: true;
    fileUrl?: true;
    externalUrl?: true;
    originalName?: true;
    mimeType?: true;
    fileSize?: true;
    publishedAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ClassMaterialAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassMaterialWhereInput;
    orderBy?: Prisma.ClassMaterialOrderByWithRelationInput | Prisma.ClassMaterialOrderByWithRelationInput[];
    cursor?: Prisma.ClassMaterialWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClassMaterialCountAggregateInputType;
    _avg?: ClassMaterialAvgAggregateInputType;
    _sum?: ClassMaterialSumAggregateInputType;
    _min?: ClassMaterialMinAggregateInputType;
    _max?: ClassMaterialMaxAggregateInputType;
};
export type GetClassMaterialAggregateType<T extends ClassMaterialAggregateArgs> = {
    [P in keyof T & keyof AggregateClassMaterial]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClassMaterial[P]> : Prisma.GetScalarType<T[P], AggregateClassMaterial[P]>;
};
export type ClassMaterialGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassMaterialWhereInput;
    orderBy?: Prisma.ClassMaterialOrderByWithAggregationInput | Prisma.ClassMaterialOrderByWithAggregationInput[];
    by: Prisma.ClassMaterialScalarFieldEnum[] | Prisma.ClassMaterialScalarFieldEnum;
    having?: Prisma.ClassMaterialScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClassMaterialCountAggregateInputType | true;
    _avg?: ClassMaterialAvgAggregateInputType;
    _sum?: ClassMaterialSumAggregateInputType;
    _min?: ClassMaterialMinAggregateInputType;
    _max?: ClassMaterialMaxAggregateInputType;
};
export type ClassMaterialGroupByOutputType = {
    id: string;
    classId: string;
    sessionId: string | null;
    uploadedById: string;
    title: string;
    description: string | null;
    type: $Enums.MaterialType;
    fileUrl: string | null;
    externalUrl: string | null;
    originalName: string | null;
    mimeType: string | null;
    fileSize: bigint | null;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ClassMaterialCountAggregateOutputType | null;
    _avg: ClassMaterialAvgAggregateOutputType | null;
    _sum: ClassMaterialSumAggregateOutputType | null;
    _min: ClassMaterialMinAggregateOutputType | null;
    _max: ClassMaterialMaxAggregateOutputType | null;
};
export type GetClassMaterialGroupByPayload<T extends ClassMaterialGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClassMaterialGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClassMaterialGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClassMaterialGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClassMaterialGroupByOutputType[P]>;
}>>;
export type ClassMaterialWhereInput = {
    AND?: Prisma.ClassMaterialWhereInput | Prisma.ClassMaterialWhereInput[];
    OR?: Prisma.ClassMaterialWhereInput[];
    NOT?: Prisma.ClassMaterialWhereInput | Prisma.ClassMaterialWhereInput[];
    id?: Prisma.StringFilter<"ClassMaterial"> | string;
    classId?: Prisma.StringFilter<"ClassMaterial"> | string;
    sessionId?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    uploadedById?: Prisma.StringFilter<"ClassMaterial"> | string;
    title?: Prisma.StringFilter<"ClassMaterial"> | string;
    description?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    type?: Prisma.EnumMaterialTypeFilter<"ClassMaterial"> | $Enums.MaterialType;
    fileUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    externalUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    originalName?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    mimeType?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    fileSize?: Prisma.BigIntNullableFilter<"ClassMaterial"> | bigint | number | null;
    publishedAt?: Prisma.DateTimeNullableFilter<"ClassMaterial"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    session?: Prisma.XOR<Prisma.ClassSessionNullableScalarRelationFilter, Prisma.ClassSessionWhereInput> | null;
    uploadedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ClassMaterialOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    uploadedById?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    type?: Prisma.SortOrder;
    fileUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    externalUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    originalName?: Prisma.SortOrderInput | Prisma.SortOrder;
    mimeType?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileSize?: Prisma.SortOrderInput | Prisma.SortOrder;
    publishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    class?: Prisma.ClassOrderByWithRelationInput;
    session?: Prisma.ClassSessionOrderByWithRelationInput;
    uploadedBy?: Prisma.UserOrderByWithRelationInput;
};
export type ClassMaterialWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ClassMaterialWhereInput | Prisma.ClassMaterialWhereInput[];
    OR?: Prisma.ClassMaterialWhereInput[];
    NOT?: Prisma.ClassMaterialWhereInput | Prisma.ClassMaterialWhereInput[];
    classId?: Prisma.StringFilter<"ClassMaterial"> | string;
    sessionId?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    uploadedById?: Prisma.StringFilter<"ClassMaterial"> | string;
    title?: Prisma.StringFilter<"ClassMaterial"> | string;
    description?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    type?: Prisma.EnumMaterialTypeFilter<"ClassMaterial"> | $Enums.MaterialType;
    fileUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    externalUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    originalName?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    mimeType?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    fileSize?: Prisma.BigIntNullableFilter<"ClassMaterial"> | bigint | number | null;
    publishedAt?: Prisma.DateTimeNullableFilter<"ClassMaterial"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
    class?: Prisma.XOR<Prisma.ClassScalarRelationFilter, Prisma.ClassWhereInput>;
    session?: Prisma.XOR<Prisma.ClassSessionNullableScalarRelationFilter, Prisma.ClassSessionWhereInput> | null;
    uploadedBy?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id">;
export type ClassMaterialOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrderInput | Prisma.SortOrder;
    uploadedById?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    type?: Prisma.SortOrder;
    fileUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    externalUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    originalName?: Prisma.SortOrderInput | Prisma.SortOrder;
    mimeType?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileSize?: Prisma.SortOrderInput | Prisma.SortOrder;
    publishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ClassMaterialCountOrderByAggregateInput;
    _avg?: Prisma.ClassMaterialAvgOrderByAggregateInput;
    _max?: Prisma.ClassMaterialMaxOrderByAggregateInput;
    _min?: Prisma.ClassMaterialMinOrderByAggregateInput;
    _sum?: Prisma.ClassMaterialSumOrderByAggregateInput;
};
export type ClassMaterialScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClassMaterialScalarWhereWithAggregatesInput | Prisma.ClassMaterialScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClassMaterialScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClassMaterialScalarWhereWithAggregatesInput | Prisma.ClassMaterialScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ClassMaterial"> | string;
    classId?: Prisma.StringWithAggregatesFilter<"ClassMaterial"> | string;
    sessionId?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    uploadedById?: Prisma.StringWithAggregatesFilter<"ClassMaterial"> | string;
    title?: Prisma.StringWithAggregatesFilter<"ClassMaterial"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    type?: Prisma.EnumMaterialTypeWithAggregatesFilter<"ClassMaterial"> | $Enums.MaterialType;
    fileUrl?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    externalUrl?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    originalName?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    mimeType?: Prisma.StringNullableWithAggregatesFilter<"ClassMaterial"> | string | null;
    fileSize?: Prisma.BigIntNullableWithAggregatesFilter<"ClassMaterial"> | bigint | number | null;
    publishedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"ClassMaterial"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ClassMaterial"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ClassMaterial"> | Date | string;
};
export type ClassMaterialCreateInput = {
    id?: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMaterialsInput;
    session?: Prisma.ClassSessionCreateNestedOneWithoutMaterialsInput;
    uploadedBy: Prisma.UserCreateNestedOneWithoutUploadedMaterialsInput;
};
export type ClassMaterialUncheckedCreateInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMaterialsNestedInput;
    session?: Prisma.ClassSessionUpdateOneWithoutMaterialsNestedInput;
    uploadedBy?: Prisma.UserUpdateOneRequiredWithoutUploadedMaterialsNestedInput;
};
export type ClassMaterialUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialCreateManyInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialListRelationFilter = {
    every?: Prisma.ClassMaterialWhereInput;
    some?: Prisma.ClassMaterialWhereInput;
    none?: Prisma.ClassMaterialWhereInput;
};
export type ClassMaterialOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClassMaterialCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    uploadedById?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    fileUrl?: Prisma.SortOrder;
    externalUrl?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    mimeType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassMaterialAvgOrderByAggregateInput = {
    fileSize?: Prisma.SortOrder;
};
export type ClassMaterialMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    uploadedById?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    fileUrl?: Prisma.SortOrder;
    externalUrl?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    mimeType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassMaterialMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    classId?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    uploadedById?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    fileUrl?: Prisma.SortOrder;
    externalUrl?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    mimeType?: Prisma.SortOrder;
    fileSize?: Prisma.SortOrder;
    publishedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassMaterialSumOrderByAggregateInput = {
    fileSize?: Prisma.SortOrder;
};
export type ClassMaterialCreateNestedManyWithoutUploadedByInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput> | Prisma.ClassMaterialCreateWithoutUploadedByInput[] | Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput | Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput[];
    createMany?: Prisma.ClassMaterialCreateManyUploadedByInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUncheckedCreateNestedManyWithoutUploadedByInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput> | Prisma.ClassMaterialCreateWithoutUploadedByInput[] | Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput | Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput[];
    createMany?: Prisma.ClassMaterialCreateManyUploadedByInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUpdateManyWithoutUploadedByNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput> | Prisma.ClassMaterialCreateWithoutUploadedByInput[] | Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput | Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutUploadedByInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutUploadedByInput[];
    createMany?: Prisma.ClassMaterialCreateManyUploadedByInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutUploadedByInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutUploadedByInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutUploadedByInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutUploadedByInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type ClassMaterialUncheckedUpdateManyWithoutUploadedByNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput> | Prisma.ClassMaterialCreateWithoutUploadedByInput[] | Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput | Prisma.ClassMaterialCreateOrConnectWithoutUploadedByInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutUploadedByInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutUploadedByInput[];
    createMany?: Prisma.ClassMaterialCreateManyUploadedByInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutUploadedByInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutUploadedByInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutUploadedByInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutUploadedByInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type ClassMaterialCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput> | Prisma.ClassMaterialCreateWithoutClassInput[] | Prisma.ClassMaterialUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutClassInput | Prisma.ClassMaterialCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.ClassMaterialCreateManyClassInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUncheckedCreateNestedManyWithoutClassInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput> | Prisma.ClassMaterialCreateWithoutClassInput[] | Prisma.ClassMaterialUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutClassInput | Prisma.ClassMaterialCreateOrConnectWithoutClassInput[];
    createMany?: Prisma.ClassMaterialCreateManyClassInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput> | Prisma.ClassMaterialCreateWithoutClassInput[] | Prisma.ClassMaterialUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutClassInput | Prisma.ClassMaterialCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutClassInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.ClassMaterialCreateManyClassInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutClassInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutClassInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type ClassMaterialUncheckedUpdateManyWithoutClassNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput> | Prisma.ClassMaterialCreateWithoutClassInput[] | Prisma.ClassMaterialUncheckedCreateWithoutClassInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutClassInput | Prisma.ClassMaterialCreateOrConnectWithoutClassInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutClassInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutClassInput[];
    createMany?: Prisma.ClassMaterialCreateManyClassInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutClassInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutClassInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutClassInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutClassInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type ClassMaterialCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput> | Prisma.ClassMaterialCreateWithoutSessionInput[] | Prisma.ClassMaterialUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutSessionInput | Prisma.ClassMaterialCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.ClassMaterialCreateManySessionInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUncheckedCreateNestedManyWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput> | Prisma.ClassMaterialCreateWithoutSessionInput[] | Prisma.ClassMaterialUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutSessionInput | Prisma.ClassMaterialCreateOrConnectWithoutSessionInput[];
    createMany?: Prisma.ClassMaterialCreateManySessionInputEnvelope;
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
};
export type ClassMaterialUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput> | Prisma.ClassMaterialCreateWithoutSessionInput[] | Prisma.ClassMaterialUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutSessionInput | Prisma.ClassMaterialCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutSessionInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.ClassMaterialCreateManySessionInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutSessionInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutSessionInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type ClassMaterialUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput> | Prisma.ClassMaterialCreateWithoutSessionInput[] | Prisma.ClassMaterialUncheckedCreateWithoutSessionInput[];
    connectOrCreate?: Prisma.ClassMaterialCreateOrConnectWithoutSessionInput | Prisma.ClassMaterialCreateOrConnectWithoutSessionInput[];
    upsert?: Prisma.ClassMaterialUpsertWithWhereUniqueWithoutSessionInput | Prisma.ClassMaterialUpsertWithWhereUniqueWithoutSessionInput[];
    createMany?: Prisma.ClassMaterialCreateManySessionInputEnvelope;
    set?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    disconnect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    delete?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    connect?: Prisma.ClassMaterialWhereUniqueInput | Prisma.ClassMaterialWhereUniqueInput[];
    update?: Prisma.ClassMaterialUpdateWithWhereUniqueWithoutSessionInput | Prisma.ClassMaterialUpdateWithWhereUniqueWithoutSessionInput[];
    updateMany?: Prisma.ClassMaterialUpdateManyWithWhereWithoutSessionInput | Prisma.ClassMaterialUpdateManyWithWhereWithoutSessionInput[];
    deleteMany?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
};
export type EnumMaterialTypeFieldUpdateOperationsInput = {
    set?: $Enums.MaterialType;
};
export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null;
    increment?: bigint | number;
    decrement?: bigint | number;
    multiply?: bigint | number;
    divide?: bigint | number;
};
export type ClassMaterialCreateWithoutUploadedByInput = {
    id?: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMaterialsInput;
    session?: Prisma.ClassSessionCreateNestedOneWithoutMaterialsInput;
};
export type ClassMaterialUncheckedCreateWithoutUploadedByInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialCreateOrConnectWithoutUploadedByInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput>;
};
export type ClassMaterialCreateManyUploadedByInputEnvelope = {
    data: Prisma.ClassMaterialCreateManyUploadedByInput | Prisma.ClassMaterialCreateManyUploadedByInput[];
    skipDuplicates?: boolean;
};
export type ClassMaterialUpsertWithWhereUniqueWithoutUploadedByInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedUpdateWithoutUploadedByInput>;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedCreateWithoutUploadedByInput>;
};
export type ClassMaterialUpdateWithWhereUniqueWithoutUploadedByInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutUploadedByInput, Prisma.ClassMaterialUncheckedUpdateWithoutUploadedByInput>;
};
export type ClassMaterialUpdateManyWithWhereWithoutUploadedByInput = {
    where: Prisma.ClassMaterialScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateManyMutationInput, Prisma.ClassMaterialUncheckedUpdateManyWithoutUploadedByInput>;
};
export type ClassMaterialScalarWhereInput = {
    AND?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
    OR?: Prisma.ClassMaterialScalarWhereInput[];
    NOT?: Prisma.ClassMaterialScalarWhereInput | Prisma.ClassMaterialScalarWhereInput[];
    id?: Prisma.StringFilter<"ClassMaterial"> | string;
    classId?: Prisma.StringFilter<"ClassMaterial"> | string;
    sessionId?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    uploadedById?: Prisma.StringFilter<"ClassMaterial"> | string;
    title?: Prisma.StringFilter<"ClassMaterial"> | string;
    description?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    type?: Prisma.EnumMaterialTypeFilter<"ClassMaterial"> | $Enums.MaterialType;
    fileUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    externalUrl?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    originalName?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    mimeType?: Prisma.StringNullableFilter<"ClassMaterial"> | string | null;
    fileSize?: Prisma.BigIntNullableFilter<"ClassMaterial"> | bigint | number | null;
    publishedAt?: Prisma.DateTimeNullableFilter<"ClassMaterial"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ClassMaterial"> | Date | string;
};
export type ClassMaterialCreateWithoutClassInput = {
    id?: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session?: Prisma.ClassSessionCreateNestedOneWithoutMaterialsInput;
    uploadedBy: Prisma.UserCreateNestedOneWithoutUploadedMaterialsInput;
};
export type ClassMaterialUncheckedCreateWithoutClassInput = {
    id?: string;
    sessionId?: string | null;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialCreateOrConnectWithoutClassInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput>;
};
export type ClassMaterialCreateManyClassInputEnvelope = {
    data: Prisma.ClassMaterialCreateManyClassInput | Prisma.ClassMaterialCreateManyClassInput[];
    skipDuplicates?: boolean;
};
export type ClassMaterialUpsertWithWhereUniqueWithoutClassInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutClassInput, Prisma.ClassMaterialUncheckedUpdateWithoutClassInput>;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutClassInput, Prisma.ClassMaterialUncheckedCreateWithoutClassInput>;
};
export type ClassMaterialUpdateWithWhereUniqueWithoutClassInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutClassInput, Prisma.ClassMaterialUncheckedUpdateWithoutClassInput>;
};
export type ClassMaterialUpdateManyWithWhereWithoutClassInput = {
    where: Prisma.ClassMaterialScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateManyMutationInput, Prisma.ClassMaterialUncheckedUpdateManyWithoutClassInput>;
};
export type ClassMaterialCreateWithoutSessionInput = {
    id?: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    class: Prisma.ClassCreateNestedOneWithoutMaterialsInput;
    uploadedBy: Prisma.UserCreateNestedOneWithoutUploadedMaterialsInput;
};
export type ClassMaterialUncheckedCreateWithoutSessionInput = {
    id?: string;
    classId: string;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialCreateOrConnectWithoutSessionInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput>;
};
export type ClassMaterialCreateManySessionInputEnvelope = {
    data: Prisma.ClassMaterialCreateManySessionInput | Prisma.ClassMaterialCreateManySessionInput[];
    skipDuplicates?: boolean;
};
export type ClassMaterialUpsertWithWhereUniqueWithoutSessionInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutSessionInput, Prisma.ClassMaterialUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.ClassMaterialCreateWithoutSessionInput, Prisma.ClassMaterialUncheckedCreateWithoutSessionInput>;
};
export type ClassMaterialUpdateWithWhereUniqueWithoutSessionInput = {
    where: Prisma.ClassMaterialWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateWithoutSessionInput, Prisma.ClassMaterialUncheckedUpdateWithoutSessionInput>;
};
export type ClassMaterialUpdateManyWithWhereWithoutSessionInput = {
    where: Prisma.ClassMaterialScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateManyMutationInput, Prisma.ClassMaterialUncheckedUpdateManyWithoutSessionInput>;
};
export type ClassMaterialCreateManyUploadedByInput = {
    id?: string;
    classId: string;
    sessionId?: string | null;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialUpdateWithoutUploadedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMaterialsNestedInput;
    session?: Prisma.ClassSessionUpdateOneWithoutMaterialsNestedInput;
};
export type ClassMaterialUncheckedUpdateWithoutUploadedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialUncheckedUpdateManyWithoutUploadedByInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialCreateManyClassInput = {
    id?: string;
    sessionId?: string | null;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneWithoutMaterialsNestedInput;
    uploadedBy?: Prisma.UserUpdateOneRequiredWithoutUploadedMaterialsNestedInput;
};
export type ClassMaterialUncheckedUpdateWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialUncheckedUpdateManyWithoutClassInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialCreateManySessionInput = {
    id?: string;
    classId: string;
    uploadedById: string;
    title: string;
    description?: string | null;
    type: $Enums.MaterialType;
    fileUrl?: string | null;
    externalUrl?: string | null;
    originalName?: string | null;
    mimeType?: string | null;
    fileSize?: bigint | number | null;
    publishedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassMaterialUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    class?: Prisma.ClassUpdateOneRequiredWithoutMaterialsNestedInput;
    uploadedBy?: Prisma.UserUpdateOneRequiredWithoutUploadedMaterialsNestedInput;
};
export type ClassMaterialUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialUncheckedUpdateManyWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    classId?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedById?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    type?: Prisma.EnumMaterialTypeFieldUpdateOperationsInput | $Enums.MaterialType;
    fileUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    externalUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    originalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    mimeType?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fileSize?: Prisma.NullableBigIntFieldUpdateOperationsInput | bigint | number | null;
    publishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassMaterialSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    uploadedById?: boolean;
    title?: boolean;
    description?: boolean;
    type?: boolean;
    fileUrl?: boolean;
    externalUrl?: boolean;
    originalName?: boolean;
    mimeType?: boolean;
    fileSize?: boolean;
    publishedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classMaterial"]>;
export type ClassMaterialSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    uploadedById?: boolean;
    title?: boolean;
    description?: boolean;
    type?: boolean;
    fileUrl?: boolean;
    externalUrl?: boolean;
    originalName?: boolean;
    mimeType?: boolean;
    fileSize?: boolean;
    publishedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classMaterial"]>;
export type ClassMaterialSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    uploadedById?: boolean;
    title?: boolean;
    description?: boolean;
    type?: boolean;
    fileUrl?: boolean;
    externalUrl?: boolean;
    originalName?: boolean;
    mimeType?: boolean;
    fileSize?: boolean;
    publishedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["classMaterial"]>;
export type ClassMaterialSelectScalar = {
    id?: boolean;
    classId?: boolean;
    sessionId?: boolean;
    uploadedById?: boolean;
    title?: boolean;
    description?: boolean;
    type?: boolean;
    fileUrl?: boolean;
    externalUrl?: boolean;
    originalName?: boolean;
    mimeType?: boolean;
    fileSize?: boolean;
    publishedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ClassMaterialOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "classId" | "sessionId" | "uploadedById" | "title" | "description" | "type" | "fileUrl" | "externalUrl" | "originalName" | "mimeType" | "fileSize" | "publishedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["classMaterial"]>;
export type ClassMaterialInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ClassMaterialIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ClassMaterialIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    class?: boolean | Prisma.ClassDefaultArgs<ExtArgs>;
    session?: boolean | Prisma.ClassMaterial$sessionArgs<ExtArgs>;
    uploadedBy?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ClassMaterialPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ClassMaterial";
    objects: {
        class: Prisma.$ClassPayload<ExtArgs>;
        session: Prisma.$ClassSessionPayload<ExtArgs> | null;
        uploadedBy: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        classId: string;
        sessionId: string | null;
        uploadedById: string;
        title: string;
        description: string | null;
        type: $Enums.MaterialType;
        fileUrl: string | null;
        externalUrl: string | null;
        originalName: string | null;
        mimeType: string | null;
        fileSize: bigint | null;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["classMaterial"]>;
    composites: {};
};
export type ClassMaterialGetPayload<S extends boolean | null | undefined | ClassMaterialDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload, S>;
export type ClassMaterialCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClassMaterialFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClassMaterialCountAggregateInputType | true;
};
export interface ClassMaterialDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ClassMaterial'];
        meta: {
            name: 'ClassMaterial';
        };
    };
    findUnique<T extends ClassMaterialFindUniqueArgs>(args: Prisma.SelectSubset<T, ClassMaterialFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClassMaterialFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClassMaterialFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClassMaterialFindFirstArgs>(args?: Prisma.SelectSubset<T, ClassMaterialFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClassMaterialFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClassMaterialFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClassMaterialFindManyArgs>(args?: Prisma.SelectSubset<T, ClassMaterialFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClassMaterialCreateArgs>(args: Prisma.SelectSubset<T, ClassMaterialCreateArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClassMaterialCreateManyArgs>(args?: Prisma.SelectSubset<T, ClassMaterialCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClassMaterialCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClassMaterialCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClassMaterialDeleteArgs>(args: Prisma.SelectSubset<T, ClassMaterialDeleteArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClassMaterialUpdateArgs>(args: Prisma.SelectSubset<T, ClassMaterialUpdateArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClassMaterialDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClassMaterialDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClassMaterialUpdateManyArgs>(args: Prisma.SelectSubset<T, ClassMaterialUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClassMaterialUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClassMaterialUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClassMaterialUpsertArgs>(args: Prisma.SelectSubset<T, ClassMaterialUpsertArgs<ExtArgs>>): Prisma.Prisma__ClassMaterialClient<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClassMaterialCountArgs>(args?: Prisma.Subset<T, ClassMaterialCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClassMaterialCountAggregateOutputType> : number>;
    aggregate<T extends ClassMaterialAggregateArgs>(args: Prisma.Subset<T, ClassMaterialAggregateArgs>): Prisma.PrismaPromise<GetClassMaterialAggregateType<T>>;
    groupBy<T extends ClassMaterialGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClassMaterialGroupByArgs['orderBy'];
    } : {
        orderBy?: ClassMaterialGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClassMaterialGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassMaterialGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClassMaterialFieldRefs;
}
export interface Prisma__ClassMaterialClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    class<T extends Prisma.ClassDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    session<T extends Prisma.ClassMaterial$sessionArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassMaterial$sessionArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    uploadedBy<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClassMaterialFieldRefs {
    readonly id: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly classId: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly sessionId: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly uploadedById: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly title: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly description: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly type: Prisma.FieldRef<"ClassMaterial", 'MaterialType'>;
    readonly fileUrl: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly externalUrl: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly originalName: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly mimeType: Prisma.FieldRef<"ClassMaterial", 'String'>;
    readonly fileSize: Prisma.FieldRef<"ClassMaterial", 'BigInt'>;
    readonly publishedAt: Prisma.FieldRef<"ClassMaterial", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"ClassMaterial", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ClassMaterial", 'DateTime'>;
}
export type ClassMaterialFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    where: Prisma.ClassMaterialWhereUniqueInput;
};
export type ClassMaterialFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    where: Prisma.ClassMaterialWhereUniqueInput;
};
export type ClassMaterialFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClassMaterialFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClassMaterialFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClassMaterialCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassMaterialCreateInput, Prisma.ClassMaterialUncheckedCreateInput>;
};
export type ClassMaterialCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClassMaterialCreateManyInput | Prisma.ClassMaterialCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClassMaterialCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    data: Prisma.ClassMaterialCreateManyInput | Prisma.ClassMaterialCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClassMaterialIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClassMaterialUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateInput, Prisma.ClassMaterialUncheckedUpdateInput>;
    where: Prisma.ClassMaterialWhereUniqueInput;
};
export type ClassMaterialUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClassMaterialUpdateManyMutationInput, Prisma.ClassMaterialUncheckedUpdateManyInput>;
    where?: Prisma.ClassMaterialWhereInput;
    limit?: number;
};
export type ClassMaterialUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassMaterialUpdateManyMutationInput, Prisma.ClassMaterialUncheckedUpdateManyInput>;
    where?: Prisma.ClassMaterialWhereInput;
    limit?: number;
    include?: Prisma.ClassMaterialIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClassMaterialUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    where: Prisma.ClassMaterialWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassMaterialCreateInput, Prisma.ClassMaterialUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClassMaterialUpdateInput, Prisma.ClassMaterialUncheckedUpdateInput>;
};
export type ClassMaterialDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
    where: Prisma.ClassMaterialWhereUniqueInput;
};
export type ClassMaterialDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassMaterialWhereInput;
    limit?: number;
};
export type ClassMaterial$sessionArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSessionSelect<ExtArgs> | null;
    omit?: Prisma.ClassSessionOmit<ExtArgs> | null;
    include?: Prisma.ClassSessionInclude<ExtArgs> | null;
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassMaterialDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassMaterialSelect<ExtArgs> | null;
    omit?: Prisma.ClassMaterialOmit<ExtArgs> | null;
    include?: Prisma.ClassMaterialInclude<ExtArgs> | null;
};
