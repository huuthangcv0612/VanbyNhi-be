import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type ClassModel = runtime.Types.Result.DefaultSelection<Prisma.$ClassPayload>;
export type AggregateClass = {
    _count: ClassCountAggregateOutputType | null;
    _avg: ClassAvgAggregateOutputType | null;
    _sum: ClassSumAggregateOutputType | null;
    _min: ClassMinAggregateOutputType | null;
    _max: ClassMaxAggregateOutputType | null;
};
export type ClassAvgAggregateOutputType = {
    monthlyTuition: runtime.Decimal | null;
};
export type ClassSumAggregateOutputType = {
    monthlyTuition: runtime.Decimal | null;
};
export type ClassMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    classCode: string | null;
    defaultMeetUrl: string | null;
    monthlyTuition: runtime.Decimal | null;
    status: $Enums.ClassStatus | null;
    createdById: string | null;
    teacherId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    description: string | null;
    classCode: string | null;
    defaultMeetUrl: string | null;
    monthlyTuition: runtime.Decimal | null;
    status: $Enums.ClassStatus | null;
    createdById: string | null;
    teacherId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ClassCountAggregateOutputType = {
    id: number;
    name: number;
    description: number;
    classCode: number;
    defaultMeetUrl: number;
    monthlyTuition: number;
    status: number;
    createdById: number;
    teacherId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ClassAvgAggregateInputType = {
    monthlyTuition?: true;
};
export type ClassSumAggregateInputType = {
    monthlyTuition?: true;
};
export type ClassMinAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    classCode?: true;
    defaultMeetUrl?: true;
    monthlyTuition?: true;
    status?: true;
    createdById?: true;
    teacherId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassMaxAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    classCode?: true;
    defaultMeetUrl?: true;
    monthlyTuition?: true;
    status?: true;
    createdById?: true;
    teacherId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ClassCountAggregateInputType = {
    id?: true;
    name?: true;
    description?: true;
    classCode?: true;
    defaultMeetUrl?: true;
    monthlyTuition?: true;
    status?: true;
    createdById?: true;
    teacherId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ClassAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput | Prisma.ClassOrderByWithRelationInput[];
    cursor?: Prisma.ClassWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ClassCountAggregateInputType;
    _avg?: ClassAvgAggregateInputType;
    _sum?: ClassSumAggregateInputType;
    _min?: ClassMinAggregateInputType;
    _max?: ClassMaxAggregateInputType;
};
export type GetClassAggregateType<T extends ClassAggregateArgs> = {
    [P in keyof T & keyof AggregateClass]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateClass[P]> : Prisma.GetScalarType<T[P], AggregateClass[P]>;
};
export type ClassGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithAggregationInput | Prisma.ClassOrderByWithAggregationInput[];
    by: Prisma.ClassScalarFieldEnum[] | Prisma.ClassScalarFieldEnum;
    having?: Prisma.ClassScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ClassCountAggregateInputType | true;
    _avg?: ClassAvgAggregateInputType;
    _sum?: ClassSumAggregateInputType;
    _min?: ClassMinAggregateInputType;
    _max?: ClassMaxAggregateInputType;
};
export type ClassGroupByOutputType = {
    id: string;
    name: string;
    description: string | null;
    classCode: string;
    defaultMeetUrl: string | null;
    monthlyTuition: runtime.Decimal;
    status: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: ClassCountAggregateOutputType | null;
    _avg: ClassAvgAggregateOutputType | null;
    _sum: ClassSumAggregateOutputType | null;
    _min: ClassMinAggregateOutputType | null;
    _max: ClassMaxAggregateOutputType | null;
};
export type GetClassGroupByPayload<T extends ClassGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ClassGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ClassGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ClassGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ClassGroupByOutputType[P]>;
}>>;
export type ClassWhereInput = {
    AND?: Prisma.ClassWhereInput | Prisma.ClassWhereInput[];
    OR?: Prisma.ClassWhereInput[];
    NOT?: Prisma.ClassWhereInput | Prisma.ClassWhereInput[];
    id?: Prisma.StringFilter<"Class"> | string;
    name?: Prisma.StringFilter<"Class"> | string;
    description?: Prisma.StringNullableFilter<"Class"> | string | null;
    classCode?: Prisma.StringFilter<"Class"> | string;
    defaultMeetUrl?: Prisma.StringNullableFilter<"Class"> | string | null;
    monthlyTuition?: Prisma.DecimalFilter<"Class"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFilter<"Class"> | $Enums.ClassStatus;
    createdById?: Prisma.StringFilter<"Class"> | string;
    teacherId?: Prisma.StringFilter<"Class"> | string;
    createdAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
    creator?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    teacher?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    members?: Prisma.EnrollmentListRelationFilter;
    sessions?: Prisma.ClassSessionListRelationFilter;
    materials?: Prisma.ClassMaterialListRelationFilter;
    assignments?: Prisma.AssignmentListRelationFilter;
};
export type ClassOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    classCode?: Prisma.SortOrder;
    defaultMeetUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    monthlyTuition?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creator?: Prisma.UserOrderByWithRelationInput;
    teacher?: Prisma.UserOrderByWithRelationInput;
    members?: Prisma.EnrollmentOrderByRelationAggregateInput;
    sessions?: Prisma.ClassSessionOrderByRelationAggregateInput;
    materials?: Prisma.ClassMaterialOrderByRelationAggregateInput;
    assignments?: Prisma.AssignmentOrderByRelationAggregateInput;
};
export type ClassWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    classCode?: string;
    AND?: Prisma.ClassWhereInput | Prisma.ClassWhereInput[];
    OR?: Prisma.ClassWhereInput[];
    NOT?: Prisma.ClassWhereInput | Prisma.ClassWhereInput[];
    name?: Prisma.StringFilter<"Class"> | string;
    description?: Prisma.StringNullableFilter<"Class"> | string | null;
    defaultMeetUrl?: Prisma.StringNullableFilter<"Class"> | string | null;
    monthlyTuition?: Prisma.DecimalFilter<"Class"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFilter<"Class"> | $Enums.ClassStatus;
    createdById?: Prisma.StringFilter<"Class"> | string;
    teacherId?: Prisma.StringFilter<"Class"> | string;
    createdAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
    creator?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    teacher?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    members?: Prisma.EnrollmentListRelationFilter;
    sessions?: Prisma.ClassSessionListRelationFilter;
    materials?: Prisma.ClassMaterialListRelationFilter;
    assignments?: Prisma.AssignmentListRelationFilter;
}, "id" | "classCode">;
export type ClassOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    classCode?: Prisma.SortOrder;
    defaultMeetUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    monthlyTuition?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ClassCountOrderByAggregateInput;
    _avg?: Prisma.ClassAvgOrderByAggregateInput;
    _max?: Prisma.ClassMaxOrderByAggregateInput;
    _min?: Prisma.ClassMinOrderByAggregateInput;
    _sum?: Prisma.ClassSumOrderByAggregateInput;
};
export type ClassScalarWhereWithAggregatesInput = {
    AND?: Prisma.ClassScalarWhereWithAggregatesInput | Prisma.ClassScalarWhereWithAggregatesInput[];
    OR?: Prisma.ClassScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ClassScalarWhereWithAggregatesInput | Prisma.ClassScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Class"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Class"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Class"> | string | null;
    classCode?: Prisma.StringWithAggregatesFilter<"Class"> | string;
    defaultMeetUrl?: Prisma.StringNullableWithAggregatesFilter<"Class"> | string | null;
    monthlyTuition?: Prisma.DecimalWithAggregatesFilter<"Class"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusWithAggregatesFilter<"Class"> | $Enums.ClassStatus;
    createdById?: Prisma.StringWithAggregatesFilter<"Class"> | string;
    teacherId?: Prisma.StringWithAggregatesFilter<"Class"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Class"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Class"> | Date | string;
};
export type ClassCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassCreateManyInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassListRelationFilter = {
    every?: Prisma.ClassWhereInput;
    some?: Prisma.ClassWhereInput;
    none?: Prisma.ClassWhereInput;
};
export type ClassOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ClassCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    classCode?: Prisma.SortOrder;
    defaultMeetUrl?: Prisma.SortOrder;
    monthlyTuition?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassAvgOrderByAggregateInput = {
    monthlyTuition?: Prisma.SortOrder;
};
export type ClassMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    classCode?: Prisma.SortOrder;
    defaultMeetUrl?: Prisma.SortOrder;
    monthlyTuition?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    classCode?: Prisma.SortOrder;
    defaultMeetUrl?: Prisma.SortOrder;
    monthlyTuition?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdById?: Prisma.SortOrder;
    teacherId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ClassSumOrderByAggregateInput = {
    monthlyTuition?: Prisma.SortOrder;
};
export type ClassScalarRelationFilter = {
    is?: Prisma.ClassWhereInput;
    isNot?: Prisma.ClassWhereInput;
};
export type ClassCreateNestedManyWithoutCreatorInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput> | Prisma.ClassCreateWithoutCreatorInput[] | Prisma.ClassUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutCreatorInput | Prisma.ClassCreateOrConnectWithoutCreatorInput[];
    createMany?: Prisma.ClassCreateManyCreatorInputEnvelope;
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
};
export type ClassCreateNestedManyWithoutTeacherInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput> | Prisma.ClassCreateWithoutTeacherInput[] | Prisma.ClassUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutTeacherInput | Prisma.ClassCreateOrConnectWithoutTeacherInput[];
    createMany?: Prisma.ClassCreateManyTeacherInputEnvelope;
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
};
export type ClassUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput> | Prisma.ClassCreateWithoutCreatorInput[] | Prisma.ClassUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutCreatorInput | Prisma.ClassCreateOrConnectWithoutCreatorInput[];
    createMany?: Prisma.ClassCreateManyCreatorInputEnvelope;
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
};
export type ClassUncheckedCreateNestedManyWithoutTeacherInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput> | Prisma.ClassCreateWithoutTeacherInput[] | Prisma.ClassUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutTeacherInput | Prisma.ClassCreateOrConnectWithoutTeacherInput[];
    createMany?: Prisma.ClassCreateManyTeacherInputEnvelope;
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
};
export type ClassUpdateManyWithoutCreatorNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput> | Prisma.ClassCreateWithoutCreatorInput[] | Prisma.ClassUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutCreatorInput | Prisma.ClassCreateOrConnectWithoutCreatorInput[];
    upsert?: Prisma.ClassUpsertWithWhereUniqueWithoutCreatorInput | Prisma.ClassUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: Prisma.ClassCreateManyCreatorInputEnvelope;
    set?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    disconnect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    delete?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    update?: Prisma.ClassUpdateWithWhereUniqueWithoutCreatorInput | Prisma.ClassUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?: Prisma.ClassUpdateManyWithWhereWithoutCreatorInput | Prisma.ClassUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
};
export type ClassUpdateManyWithoutTeacherNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput> | Prisma.ClassCreateWithoutTeacherInput[] | Prisma.ClassUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutTeacherInput | Prisma.ClassCreateOrConnectWithoutTeacherInput[];
    upsert?: Prisma.ClassUpsertWithWhereUniqueWithoutTeacherInput | Prisma.ClassUpsertWithWhereUniqueWithoutTeacherInput[];
    createMany?: Prisma.ClassCreateManyTeacherInputEnvelope;
    set?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    disconnect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    delete?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    update?: Prisma.ClassUpdateWithWhereUniqueWithoutTeacherInput | Prisma.ClassUpdateWithWhereUniqueWithoutTeacherInput[];
    updateMany?: Prisma.ClassUpdateManyWithWhereWithoutTeacherInput | Prisma.ClassUpdateManyWithWhereWithoutTeacherInput[];
    deleteMany?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
};
export type ClassUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput> | Prisma.ClassCreateWithoutCreatorInput[] | Prisma.ClassUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutCreatorInput | Prisma.ClassCreateOrConnectWithoutCreatorInput[];
    upsert?: Prisma.ClassUpsertWithWhereUniqueWithoutCreatorInput | Prisma.ClassUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: Prisma.ClassCreateManyCreatorInputEnvelope;
    set?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    disconnect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    delete?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    update?: Prisma.ClassUpdateWithWhereUniqueWithoutCreatorInput | Prisma.ClassUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?: Prisma.ClassUpdateManyWithWhereWithoutCreatorInput | Prisma.ClassUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
};
export type ClassUncheckedUpdateManyWithoutTeacherNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput> | Prisma.ClassCreateWithoutTeacherInput[] | Prisma.ClassUncheckedCreateWithoutTeacherInput[];
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutTeacherInput | Prisma.ClassCreateOrConnectWithoutTeacherInput[];
    upsert?: Prisma.ClassUpsertWithWhereUniqueWithoutTeacherInput | Prisma.ClassUpsertWithWhereUniqueWithoutTeacherInput[];
    createMany?: Prisma.ClassCreateManyTeacherInputEnvelope;
    set?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    disconnect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    delete?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    connect?: Prisma.ClassWhereUniqueInput | Prisma.ClassWhereUniqueInput[];
    update?: Prisma.ClassUpdateWithWhereUniqueWithoutTeacherInput | Prisma.ClassUpdateWithWhereUniqueWithoutTeacherInput[];
    updateMany?: Prisma.ClassUpdateManyWithWhereWithoutTeacherInput | Prisma.ClassUpdateManyWithWhereWithoutTeacherInput[];
    deleteMany?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumClassStatusFieldUpdateOperationsInput = {
    set?: $Enums.ClassStatus;
};
export type ClassCreateNestedOneWithoutMembersInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutMembersInput, Prisma.ClassUncheckedCreateWithoutMembersInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutMembersInput;
    connect?: Prisma.ClassWhereUniqueInput;
};
export type ClassUpdateOneRequiredWithoutMembersNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutMembersInput, Prisma.ClassUncheckedCreateWithoutMembersInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutMembersInput;
    upsert?: Prisma.ClassUpsertWithoutMembersInput;
    connect?: Prisma.ClassWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassUpdateToOneWithWhereWithoutMembersInput, Prisma.ClassUpdateWithoutMembersInput>, Prisma.ClassUncheckedUpdateWithoutMembersInput>;
};
export type ClassCreateNestedOneWithoutSessionsInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutSessionsInput, Prisma.ClassUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutSessionsInput;
    connect?: Prisma.ClassWhereUniqueInput;
};
export type ClassUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutSessionsInput, Prisma.ClassUncheckedCreateWithoutSessionsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutSessionsInput;
    upsert?: Prisma.ClassUpsertWithoutSessionsInput;
    connect?: Prisma.ClassWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassUpdateToOneWithWhereWithoutSessionsInput, Prisma.ClassUpdateWithoutSessionsInput>, Prisma.ClassUncheckedUpdateWithoutSessionsInput>;
};
export type ClassCreateNestedOneWithoutAssignmentsInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutAssignmentsInput, Prisma.ClassUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutAssignmentsInput;
    connect?: Prisma.ClassWhereUniqueInput;
};
export type ClassUpdateOneRequiredWithoutAssignmentsNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutAssignmentsInput, Prisma.ClassUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutAssignmentsInput;
    upsert?: Prisma.ClassUpsertWithoutAssignmentsInput;
    connect?: Prisma.ClassWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassUpdateToOneWithWhereWithoutAssignmentsInput, Prisma.ClassUpdateWithoutAssignmentsInput>, Prisma.ClassUncheckedUpdateWithoutAssignmentsInput>;
};
export type ClassCreateNestedOneWithoutMaterialsInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutMaterialsInput, Prisma.ClassUncheckedCreateWithoutMaterialsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutMaterialsInput;
    connect?: Prisma.ClassWhereUniqueInput;
};
export type ClassUpdateOneRequiredWithoutMaterialsNestedInput = {
    create?: Prisma.XOR<Prisma.ClassCreateWithoutMaterialsInput, Prisma.ClassUncheckedCreateWithoutMaterialsInput>;
    connectOrCreate?: Prisma.ClassCreateOrConnectWithoutMaterialsInput;
    upsert?: Prisma.ClassUpsertWithoutMaterialsInput;
    connect?: Prisma.ClassWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ClassUpdateToOneWithWhereWithoutMaterialsInput, Prisma.ClassUpdateWithoutMaterialsInput>, Prisma.ClassUncheckedUpdateWithoutMaterialsInput>;
};
export type ClassCreateWithoutCreatorInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutCreatorInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutCreatorInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput>;
};
export type ClassCreateManyCreatorInputEnvelope = {
    data: Prisma.ClassCreateManyCreatorInput | Prisma.ClassCreateManyCreatorInput[];
    skipDuplicates?: boolean;
};
export type ClassCreateWithoutTeacherInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutTeacherInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutTeacherInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput>;
};
export type ClassCreateManyTeacherInputEnvelope = {
    data: Prisma.ClassCreateManyTeacherInput | Prisma.ClassCreateManyTeacherInput[];
    skipDuplicates?: boolean;
};
export type ClassUpsertWithWhereUniqueWithoutCreatorInput = {
    where: Prisma.ClassWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassUpdateWithoutCreatorInput, Prisma.ClassUncheckedUpdateWithoutCreatorInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutCreatorInput, Prisma.ClassUncheckedCreateWithoutCreatorInput>;
};
export type ClassUpdateWithWhereUniqueWithoutCreatorInput = {
    where: Prisma.ClassWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutCreatorInput, Prisma.ClassUncheckedUpdateWithoutCreatorInput>;
};
export type ClassUpdateManyWithWhereWithoutCreatorInput = {
    where: Prisma.ClassScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateManyMutationInput, Prisma.ClassUncheckedUpdateManyWithoutCreatorInput>;
};
export type ClassScalarWhereInput = {
    AND?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
    OR?: Prisma.ClassScalarWhereInput[];
    NOT?: Prisma.ClassScalarWhereInput | Prisma.ClassScalarWhereInput[];
    id?: Prisma.StringFilter<"Class"> | string;
    name?: Prisma.StringFilter<"Class"> | string;
    description?: Prisma.StringNullableFilter<"Class"> | string | null;
    classCode?: Prisma.StringFilter<"Class"> | string;
    defaultMeetUrl?: Prisma.StringNullableFilter<"Class"> | string | null;
    monthlyTuition?: Prisma.DecimalFilter<"Class"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFilter<"Class"> | $Enums.ClassStatus;
    createdById?: Prisma.StringFilter<"Class"> | string;
    teacherId?: Prisma.StringFilter<"Class"> | string;
    createdAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Class"> | Date | string;
};
export type ClassUpsertWithWhereUniqueWithoutTeacherInput = {
    where: Prisma.ClassWhereUniqueInput;
    update: Prisma.XOR<Prisma.ClassUpdateWithoutTeacherInput, Prisma.ClassUncheckedUpdateWithoutTeacherInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutTeacherInput, Prisma.ClassUncheckedCreateWithoutTeacherInput>;
};
export type ClassUpdateWithWhereUniqueWithoutTeacherInput = {
    where: Prisma.ClassWhereUniqueInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutTeacherInput, Prisma.ClassUncheckedUpdateWithoutTeacherInput>;
};
export type ClassUpdateManyWithWhereWithoutTeacherInput = {
    where: Prisma.ClassScalarWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateManyMutationInput, Prisma.ClassUncheckedUpdateManyWithoutTeacherInput>;
};
export type ClassCreateWithoutMembersInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutMembersInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutMembersInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutMembersInput, Prisma.ClassUncheckedCreateWithoutMembersInput>;
};
export type ClassUpsertWithoutMembersInput = {
    update: Prisma.XOR<Prisma.ClassUpdateWithoutMembersInput, Prisma.ClassUncheckedUpdateWithoutMembersInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutMembersInput, Prisma.ClassUncheckedCreateWithoutMembersInput>;
    where?: Prisma.ClassWhereInput;
};
export type ClassUpdateToOneWithWhereWithoutMembersInput = {
    where?: Prisma.ClassWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutMembersInput, Prisma.ClassUncheckedUpdateWithoutMembersInput>;
};
export type ClassUpdateWithoutMembersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutMembersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassCreateWithoutSessionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutSessionsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutSessionsInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutSessionsInput, Prisma.ClassUncheckedCreateWithoutSessionsInput>;
};
export type ClassUpsertWithoutSessionsInput = {
    update: Prisma.XOR<Prisma.ClassUpdateWithoutSessionsInput, Prisma.ClassUncheckedUpdateWithoutSessionsInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutSessionsInput, Prisma.ClassUncheckedCreateWithoutSessionsInput>;
    where?: Prisma.ClassWhereInput;
};
export type ClassUpdateToOneWithWhereWithoutSessionsInput = {
    where?: Prisma.ClassWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutSessionsInput, Prisma.ClassUncheckedUpdateWithoutSessionsInput>;
};
export type ClassUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutAssignmentsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    materials?: Prisma.ClassMaterialUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutAssignmentsInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutAssignmentsInput, Prisma.ClassUncheckedCreateWithoutAssignmentsInput>;
};
export type ClassUpsertWithoutAssignmentsInput = {
    update: Prisma.XOR<Prisma.ClassUpdateWithoutAssignmentsInput, Prisma.ClassUncheckedUpdateWithoutAssignmentsInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutAssignmentsInput, Prisma.ClassUncheckedCreateWithoutAssignmentsInput>;
    where?: Prisma.ClassWhereInput;
};
export type ClassUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: Prisma.ClassWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutAssignmentsInput, Prisma.ClassUncheckedUpdateWithoutAssignmentsInput>;
};
export type ClassUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassCreateWithoutMaterialsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedClassesInput;
    teacher: Prisma.UserCreateNestedOneWithoutTeachingClassesInput;
    members?: Prisma.EnrollmentCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentCreateNestedManyWithoutClassInput;
};
export type ClassUncheckedCreateWithoutMaterialsInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    members?: Prisma.EnrollmentUncheckedCreateNestedManyWithoutClassInput;
    sessions?: Prisma.ClassSessionUncheckedCreateNestedManyWithoutClassInput;
    assignments?: Prisma.AssignmentUncheckedCreateNestedManyWithoutClassInput;
};
export type ClassCreateOrConnectWithoutMaterialsInput = {
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateWithoutMaterialsInput, Prisma.ClassUncheckedCreateWithoutMaterialsInput>;
};
export type ClassUpsertWithoutMaterialsInput = {
    update: Prisma.XOR<Prisma.ClassUpdateWithoutMaterialsInput, Prisma.ClassUncheckedUpdateWithoutMaterialsInput>;
    create: Prisma.XOR<Prisma.ClassCreateWithoutMaterialsInput, Prisma.ClassUncheckedCreateWithoutMaterialsInput>;
    where?: Prisma.ClassWhereInput;
};
export type ClassUpdateToOneWithWhereWithoutMaterialsInput = {
    where?: Prisma.ClassWhereInput;
    data: Prisma.XOR<Prisma.ClassUpdateWithoutMaterialsInput, Prisma.ClassUncheckedUpdateWithoutMaterialsInput>;
};
export type ClassUpdateWithoutMaterialsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutMaterialsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassCreateManyCreatorInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    teacherId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassCreateManyTeacherInput = {
    id?: string;
    name: string;
    description?: string | null;
    classCode?: string;
    defaultMeetUrl?: string | null;
    monthlyTuition?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.ClassStatus;
    createdById: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ClassUpdateWithoutCreatorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    teacher?: Prisma.UserUpdateOneRequiredWithoutTeachingClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutCreatorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateManyWithoutCreatorInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    teacherId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassUpdateWithoutTeacherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedClassesNestedInput;
    members?: Prisma.EnrollmentUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateWithoutTeacherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    members?: Prisma.EnrollmentUncheckedUpdateManyWithoutClassNestedInput;
    sessions?: Prisma.ClassSessionUncheckedUpdateManyWithoutClassNestedInput;
    materials?: Prisma.ClassMaterialUncheckedUpdateManyWithoutClassNestedInput;
    assignments?: Prisma.AssignmentUncheckedUpdateManyWithoutClassNestedInput;
};
export type ClassUncheckedUpdateManyWithoutTeacherInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    classCode?: Prisma.StringFieldUpdateOperationsInput | string;
    defaultMeetUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    monthlyTuition?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumClassStatusFieldUpdateOperationsInput | $Enums.ClassStatus;
    createdById?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ClassCountOutputType = {
    members: number;
    sessions: number;
    materials: number;
    assignments: number;
};
export type ClassCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    members?: boolean | ClassCountOutputTypeCountMembersArgs;
    sessions?: boolean | ClassCountOutputTypeCountSessionsArgs;
    materials?: boolean | ClassCountOutputTypeCountMaterialsArgs;
    assignments?: boolean | ClassCountOutputTypeCountAssignmentsArgs;
};
export type ClassCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassCountOutputTypeSelect<ExtArgs> | null;
};
export type ClassCountOutputTypeCountMembersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EnrollmentWhereInput;
};
export type ClassCountOutputTypeCountSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassSessionWhereInput;
};
export type ClassCountOutputTypeCountMaterialsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassMaterialWhereInput;
};
export type ClassCountOutputTypeCountAssignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AssignmentWhereInput;
};
export type ClassSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    classCode?: boolean;
    defaultMeetUrl?: boolean;
    monthlyTuition?: boolean;
    status?: boolean;
    createdById?: boolean;
    teacherId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    members?: boolean | Prisma.Class$membersArgs<ExtArgs>;
    sessions?: boolean | Prisma.Class$sessionsArgs<ExtArgs>;
    materials?: boolean | Prisma.Class$materialsArgs<ExtArgs>;
    assignments?: boolean | Prisma.Class$assignmentsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClassCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["class"]>;
export type ClassSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    classCode?: boolean;
    defaultMeetUrl?: boolean;
    monthlyTuition?: boolean;
    status?: boolean;
    createdById?: boolean;
    teacherId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["class"]>;
export type ClassSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    description?: boolean;
    classCode?: boolean;
    defaultMeetUrl?: boolean;
    monthlyTuition?: boolean;
    status?: boolean;
    createdById?: boolean;
    teacherId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["class"]>;
export type ClassSelectScalar = {
    id?: boolean;
    name?: boolean;
    description?: boolean;
    classCode?: boolean;
    defaultMeetUrl?: boolean;
    monthlyTuition?: boolean;
    status?: boolean;
    createdById?: boolean;
    teacherId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ClassOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "description" | "classCode" | "defaultMeetUrl" | "monthlyTuition" | "status" | "createdById" | "teacherId" | "createdAt" | "updatedAt", ExtArgs["result"]["class"]>;
export type ClassInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    members?: boolean | Prisma.Class$membersArgs<ExtArgs>;
    sessions?: boolean | Prisma.Class$sessionsArgs<ExtArgs>;
    materials?: boolean | Prisma.Class$materialsArgs<ExtArgs>;
    assignments?: boolean | Prisma.Class$assignmentsArgs<ExtArgs>;
    _count?: boolean | Prisma.ClassCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ClassIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ClassIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    teacher?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ClassPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Class";
    objects: {
        creator: Prisma.$UserPayload<ExtArgs>;
        teacher: Prisma.$UserPayload<ExtArgs>;
        members: Prisma.$EnrollmentPayload<ExtArgs>[];
        sessions: Prisma.$ClassSessionPayload<ExtArgs>[];
        materials: Prisma.$ClassMaterialPayload<ExtArgs>[];
        assignments: Prisma.$AssignmentPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        description: string | null;
        classCode: string;
        defaultMeetUrl: string | null;
        monthlyTuition: runtime.Decimal;
        status: $Enums.ClassStatus;
        createdById: string;
        teacherId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["class"]>;
    composites: {};
};
export type ClassGetPayload<S extends boolean | null | undefined | ClassDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ClassPayload, S>;
export type ClassCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ClassFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ClassCountAggregateInputType | true;
};
export interface ClassDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Class'];
        meta: {
            name: 'Class';
        };
    };
    findUnique<T extends ClassFindUniqueArgs>(args: Prisma.SelectSubset<T, ClassFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ClassFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ClassFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ClassFindFirstArgs>(args?: Prisma.SelectSubset<T, ClassFindFirstArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ClassFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ClassFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ClassFindManyArgs>(args?: Prisma.SelectSubset<T, ClassFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ClassCreateArgs>(args: Prisma.SelectSubset<T, ClassCreateArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ClassCreateManyArgs>(args?: Prisma.SelectSubset<T, ClassCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ClassCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ClassCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ClassDeleteArgs>(args: Prisma.SelectSubset<T, ClassDeleteArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ClassUpdateArgs>(args: Prisma.SelectSubset<T, ClassUpdateArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ClassDeleteManyArgs>(args?: Prisma.SelectSubset<T, ClassDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ClassUpdateManyArgs>(args: Prisma.SelectSubset<T, ClassUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ClassUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ClassUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ClassUpsertArgs>(args: Prisma.SelectSubset<T, ClassUpsertArgs<ExtArgs>>): Prisma.Prisma__ClassClient<runtime.Types.Result.GetResult<Prisma.$ClassPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ClassCountArgs>(args?: Prisma.Subset<T, ClassCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ClassCountAggregateOutputType> : number>;
    aggregate<T extends ClassAggregateArgs>(args: Prisma.Subset<T, ClassAggregateArgs>): Prisma.PrismaPromise<GetClassAggregateType<T>>;
    groupBy<T extends ClassGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ClassGroupByArgs['orderBy'];
    } : {
        orderBy?: ClassGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ClassGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ClassFieldRefs;
}
export interface Prisma__ClassClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    creator<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    teacher<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    members<T extends Prisma.Class$membersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Class$membersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EnrollmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    sessions<T extends Prisma.Class$sessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Class$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    materials<T extends Prisma.Class$materialsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Class$materialsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ClassMaterialPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    assignments<T extends Prisma.Class$assignmentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Class$assignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ClassFieldRefs {
    readonly id: Prisma.FieldRef<"Class", 'String'>;
    readonly name: Prisma.FieldRef<"Class", 'String'>;
    readonly description: Prisma.FieldRef<"Class", 'String'>;
    readonly classCode: Prisma.FieldRef<"Class", 'String'>;
    readonly defaultMeetUrl: Prisma.FieldRef<"Class", 'String'>;
    readonly monthlyTuition: Prisma.FieldRef<"Class", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Class", 'ClassStatus'>;
    readonly createdById: Prisma.FieldRef<"Class", 'String'>;
    readonly teacherId: Prisma.FieldRef<"Class", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Class", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Class", 'DateTime'>;
}
export type ClassFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where: Prisma.ClassWhereUniqueInput;
};
export type ClassFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where: Prisma.ClassWhereUniqueInput;
};
export type ClassFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput | Prisma.ClassOrderByWithRelationInput[];
    cursor?: Prisma.ClassWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassScalarFieldEnum | Prisma.ClassScalarFieldEnum[];
};
export type ClassFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput | Prisma.ClassOrderByWithRelationInput[];
    cursor?: Prisma.ClassWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassScalarFieldEnum | Prisma.ClassScalarFieldEnum[];
};
export type ClassFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where?: Prisma.ClassWhereInput;
    orderBy?: Prisma.ClassOrderByWithRelationInput | Prisma.ClassOrderByWithRelationInput[];
    cursor?: Prisma.ClassWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ClassScalarFieldEnum | Prisma.ClassScalarFieldEnum[];
};
export type ClassCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassCreateInput, Prisma.ClassUncheckedCreateInput>;
};
export type ClassCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ClassCreateManyInput | Prisma.ClassCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ClassCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    data: Prisma.ClassCreateManyInput | Prisma.ClassCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ClassIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ClassUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassUpdateInput, Prisma.ClassUncheckedUpdateInput>;
    where: Prisma.ClassWhereUniqueInput;
};
export type ClassUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ClassUpdateManyMutationInput, Prisma.ClassUncheckedUpdateManyInput>;
    where?: Prisma.ClassWhereInput;
    limit?: number;
};
export type ClassUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ClassUpdateManyMutationInput, Prisma.ClassUncheckedUpdateManyInput>;
    where?: Prisma.ClassWhereInput;
    limit?: number;
    include?: Prisma.ClassIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ClassUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where: Prisma.ClassWhereUniqueInput;
    create: Prisma.XOR<Prisma.ClassCreateInput, Prisma.ClassUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ClassUpdateInput, Prisma.ClassUncheckedUpdateInput>;
};
export type ClassDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
    where: Prisma.ClassWhereUniqueInput;
};
export type ClassDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ClassWhereInput;
    limit?: number;
};
export type Class$membersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Class$sessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Class$materialsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Class$assignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ClassDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ClassSelect<ExtArgs> | null;
    omit?: Prisma.ClassOmit<ExtArgs> | null;
    include?: Prisma.ClassInclude<ExtArgs> | null;
};
