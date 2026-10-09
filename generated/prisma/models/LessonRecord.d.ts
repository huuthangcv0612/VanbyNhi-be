import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type LessonRecordModel = runtime.Types.Result.DefaultSelection<Prisma.$LessonRecordPayload>;
export type AggregateLessonRecord = {
    _count: LessonRecordCountAggregateOutputType | null;
    _min: LessonRecordMinAggregateOutputType | null;
    _max: LessonRecordMaxAggregateOutputType | null;
};
export type LessonRecordMinAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    content: string | null;
    homeworkSummary: string | null;
    teacherNotes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LessonRecordMaxAggregateOutputType = {
    id: string | null;
    sessionId: string | null;
    content: string | null;
    homeworkSummary: string | null;
    teacherNotes: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LessonRecordCountAggregateOutputType = {
    id: number;
    sessionId: number;
    content: number;
    homeworkSummary: number;
    teacherNotes: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type LessonRecordMinAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    homeworkSummary?: true;
    teacherNotes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LessonRecordMaxAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    homeworkSummary?: true;
    teacherNotes?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LessonRecordCountAggregateInputType = {
    id?: true;
    sessionId?: true;
    content?: true;
    homeworkSummary?: true;
    teacherNotes?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type LessonRecordAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LessonRecordWhereInput;
    orderBy?: Prisma.LessonRecordOrderByWithRelationInput | Prisma.LessonRecordOrderByWithRelationInput[];
    cursor?: Prisma.LessonRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | LessonRecordCountAggregateInputType;
    _min?: LessonRecordMinAggregateInputType;
    _max?: LessonRecordMaxAggregateInputType;
};
export type GetLessonRecordAggregateType<T extends LessonRecordAggregateArgs> = {
    [P in keyof T & keyof AggregateLessonRecord]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateLessonRecord[P]> : Prisma.GetScalarType<T[P], AggregateLessonRecord[P]>;
};
export type LessonRecordGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LessonRecordWhereInput;
    orderBy?: Prisma.LessonRecordOrderByWithAggregationInput | Prisma.LessonRecordOrderByWithAggregationInput[];
    by: Prisma.LessonRecordScalarFieldEnum[] | Prisma.LessonRecordScalarFieldEnum;
    having?: Prisma.LessonRecordScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LessonRecordCountAggregateInputType | true;
    _min?: LessonRecordMinAggregateInputType;
    _max?: LessonRecordMaxAggregateInputType;
};
export type LessonRecordGroupByOutputType = {
    id: string;
    sessionId: string;
    content: string;
    homeworkSummary: string | null;
    teacherNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: LessonRecordCountAggregateOutputType | null;
    _min: LessonRecordMinAggregateOutputType | null;
    _max: LessonRecordMaxAggregateOutputType | null;
};
export type GetLessonRecordGroupByPayload<T extends LessonRecordGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<LessonRecordGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof LessonRecordGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], LessonRecordGroupByOutputType[P]> : Prisma.GetScalarType<T[P], LessonRecordGroupByOutputType[P]>;
}>>;
export type LessonRecordWhereInput = {
    AND?: Prisma.LessonRecordWhereInput | Prisma.LessonRecordWhereInput[];
    OR?: Prisma.LessonRecordWhereInput[];
    NOT?: Prisma.LessonRecordWhereInput | Prisma.LessonRecordWhereInput[];
    id?: Prisma.StringFilter<"LessonRecord"> | string;
    sessionId?: Prisma.StringFilter<"LessonRecord"> | string;
    content?: Prisma.StringFilter<"LessonRecord"> | string;
    homeworkSummary?: Prisma.StringNullableFilter<"LessonRecord"> | string | null;
    teacherNotes?: Prisma.StringNullableFilter<"LessonRecord"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"LessonRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LessonRecord"> | Date | string;
    session?: Prisma.XOR<Prisma.ClassSessionScalarRelationFilter, Prisma.ClassSessionWhereInput>;
};
export type LessonRecordOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    homeworkSummary?: Prisma.SortOrderInput | Prisma.SortOrder;
    teacherNotes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    session?: Prisma.ClassSessionOrderByWithRelationInput;
};
export type LessonRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    sessionId?: string;
    AND?: Prisma.LessonRecordWhereInput | Prisma.LessonRecordWhereInput[];
    OR?: Prisma.LessonRecordWhereInput[];
    NOT?: Prisma.LessonRecordWhereInput | Prisma.LessonRecordWhereInput[];
    content?: Prisma.StringFilter<"LessonRecord"> | string;
    homeworkSummary?: Prisma.StringNullableFilter<"LessonRecord"> | string | null;
    teacherNotes?: Prisma.StringNullableFilter<"LessonRecord"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"LessonRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LessonRecord"> | Date | string;
    session?: Prisma.XOR<Prisma.ClassSessionScalarRelationFilter, Prisma.ClassSessionWhereInput>;
}, "id" | "sessionId">;
export type LessonRecordOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    homeworkSummary?: Prisma.SortOrderInput | Prisma.SortOrder;
    teacherNotes?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.LessonRecordCountOrderByAggregateInput;
    _max?: Prisma.LessonRecordMaxOrderByAggregateInput;
    _min?: Prisma.LessonRecordMinOrderByAggregateInput;
};
export type LessonRecordScalarWhereWithAggregatesInput = {
    AND?: Prisma.LessonRecordScalarWhereWithAggregatesInput | Prisma.LessonRecordScalarWhereWithAggregatesInput[];
    OR?: Prisma.LessonRecordScalarWhereWithAggregatesInput[];
    NOT?: Prisma.LessonRecordScalarWhereWithAggregatesInput | Prisma.LessonRecordScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"LessonRecord"> | string;
    sessionId?: Prisma.StringWithAggregatesFilter<"LessonRecord"> | string;
    content?: Prisma.StringWithAggregatesFilter<"LessonRecord"> | string;
    homeworkSummary?: Prisma.StringNullableWithAggregatesFilter<"LessonRecord"> | string | null;
    teacherNotes?: Prisma.StringNullableWithAggregatesFilter<"LessonRecord"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"LessonRecord"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"LessonRecord"> | Date | string;
};
export type LessonRecordCreateInput = {
    id?: string;
    content: string;
    homeworkSummary?: string | null;
    teacherNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    session: Prisma.ClassSessionCreateNestedOneWithoutLessonRecordInput;
};
export type LessonRecordUncheckedCreateInput = {
    id?: string;
    sessionId: string;
    content: string;
    homeworkSummary?: string | null;
    teacherNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LessonRecordUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    session?: Prisma.ClassSessionUpdateOneRequiredWithoutLessonRecordNestedInput;
};
export type LessonRecordUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LessonRecordCreateManyInput = {
    id?: string;
    sessionId: string;
    content: string;
    homeworkSummary?: string | null;
    teacherNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LessonRecordUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LessonRecordUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sessionId?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LessonRecordNullableScalarRelationFilter = {
    is?: Prisma.LessonRecordWhereInput | null;
    isNot?: Prisma.LessonRecordWhereInput | null;
};
export type LessonRecordCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    homeworkSummary?: Prisma.SortOrder;
    teacherNotes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LessonRecordMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    homeworkSummary?: Prisma.SortOrder;
    teacherNotes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LessonRecordMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    sessionId?: Prisma.SortOrder;
    content?: Prisma.SortOrder;
    homeworkSummary?: Prisma.SortOrder;
    teacherNotes?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LessonRecordCreateNestedOneWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.LessonRecordCreateOrConnectWithoutSessionInput;
    connect?: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordUncheckedCreateNestedOneWithoutSessionInput = {
    create?: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.LessonRecordCreateOrConnectWithoutSessionInput;
    connect?: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordUpdateOneWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.LessonRecordCreateOrConnectWithoutSessionInput;
    upsert?: Prisma.LessonRecordUpsertWithoutSessionInput;
    disconnect?: Prisma.LessonRecordWhereInput | boolean;
    delete?: Prisma.LessonRecordWhereInput | boolean;
    connect?: Prisma.LessonRecordWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.LessonRecordUpdateToOneWithWhereWithoutSessionInput, Prisma.LessonRecordUpdateWithoutSessionInput>, Prisma.LessonRecordUncheckedUpdateWithoutSessionInput>;
};
export type LessonRecordUncheckedUpdateOneWithoutSessionNestedInput = {
    create?: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
    connectOrCreate?: Prisma.LessonRecordCreateOrConnectWithoutSessionInput;
    upsert?: Prisma.LessonRecordUpsertWithoutSessionInput;
    disconnect?: Prisma.LessonRecordWhereInput | boolean;
    delete?: Prisma.LessonRecordWhereInput | boolean;
    connect?: Prisma.LessonRecordWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.LessonRecordUpdateToOneWithWhereWithoutSessionInput, Prisma.LessonRecordUpdateWithoutSessionInput>, Prisma.LessonRecordUncheckedUpdateWithoutSessionInput>;
};
export type LessonRecordCreateWithoutSessionInput = {
    id?: string;
    content: string;
    homeworkSummary?: string | null;
    teacherNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LessonRecordUncheckedCreateWithoutSessionInput = {
    id?: string;
    content: string;
    homeworkSummary?: string | null;
    teacherNotes?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LessonRecordCreateOrConnectWithoutSessionInput = {
    where: Prisma.LessonRecordWhereUniqueInput;
    create: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
};
export type LessonRecordUpsertWithoutSessionInput = {
    update: Prisma.XOR<Prisma.LessonRecordUpdateWithoutSessionInput, Prisma.LessonRecordUncheckedUpdateWithoutSessionInput>;
    create: Prisma.XOR<Prisma.LessonRecordCreateWithoutSessionInput, Prisma.LessonRecordUncheckedCreateWithoutSessionInput>;
    where?: Prisma.LessonRecordWhereInput;
};
export type LessonRecordUpdateToOneWithWhereWithoutSessionInput = {
    where?: Prisma.LessonRecordWhereInput;
    data: Prisma.XOR<Prisma.LessonRecordUpdateWithoutSessionInput, Prisma.LessonRecordUncheckedUpdateWithoutSessionInput>;
};
export type LessonRecordUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LessonRecordUncheckedUpdateWithoutSessionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    content?: Prisma.StringFieldUpdateOperationsInput | string;
    homeworkSummary?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    teacherNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LessonRecordSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    homeworkSummary?: boolean;
    teacherNotes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["lessonRecord"]>;
export type LessonRecordSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    homeworkSummary?: boolean;
    teacherNotes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["lessonRecord"]>;
export type LessonRecordSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    homeworkSummary?: boolean;
    teacherNotes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["lessonRecord"]>;
export type LessonRecordSelectScalar = {
    id?: boolean;
    sessionId?: boolean;
    content?: boolean;
    homeworkSummary?: boolean;
    teacherNotes?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type LessonRecordOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "sessionId" | "content" | "homeworkSummary" | "teacherNotes" | "createdAt" | "updatedAt", ExtArgs["result"]["lessonRecord"]>;
export type LessonRecordInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
};
export type LessonRecordIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
};
export type LessonRecordIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    session?: boolean | Prisma.ClassSessionDefaultArgs<ExtArgs>;
};
export type $LessonRecordPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "LessonRecord";
    objects: {
        session: Prisma.$ClassSessionPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        sessionId: string;
        content: string;
        homeworkSummary: string | null;
        teacherNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["lessonRecord"]>;
    composites: {};
};
export type LessonRecordGetPayload<S extends boolean | null | undefined | LessonRecordDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload, S>;
export type LessonRecordCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<LessonRecordFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: LessonRecordCountAggregateInputType | true;
};
export interface LessonRecordDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['LessonRecord'];
        meta: {
            name: 'LessonRecord';
        };
    };
    findUnique<T extends LessonRecordFindUniqueArgs>(args: Prisma.SelectSubset<T, LessonRecordFindUniqueArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends LessonRecordFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, LessonRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends LessonRecordFindFirstArgs>(args?: Prisma.SelectSubset<T, LessonRecordFindFirstArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends LessonRecordFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, LessonRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends LessonRecordFindManyArgs>(args?: Prisma.SelectSubset<T, LessonRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends LessonRecordCreateArgs>(args: Prisma.SelectSubset<T, LessonRecordCreateArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends LessonRecordCreateManyArgs>(args?: Prisma.SelectSubset<T, LessonRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends LessonRecordCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, LessonRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends LessonRecordDeleteArgs>(args: Prisma.SelectSubset<T, LessonRecordDeleteArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends LessonRecordUpdateArgs>(args: Prisma.SelectSubset<T, LessonRecordUpdateArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends LessonRecordDeleteManyArgs>(args?: Prisma.SelectSubset<T, LessonRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends LessonRecordUpdateManyArgs>(args: Prisma.SelectSubset<T, LessonRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends LessonRecordUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, LessonRecordUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends LessonRecordUpsertArgs>(args: Prisma.SelectSubset<T, LessonRecordUpsertArgs<ExtArgs>>): Prisma.Prisma__LessonRecordClient<runtime.Types.Result.GetResult<Prisma.$LessonRecordPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends LessonRecordCountArgs>(args?: Prisma.Subset<T, LessonRecordCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], LessonRecordCountAggregateOutputType> : number>;
    aggregate<T extends LessonRecordAggregateArgs>(args: Prisma.Subset<T, LessonRecordAggregateArgs>): Prisma.PrismaPromise<GetLessonRecordAggregateType<T>>;
    groupBy<T extends LessonRecordGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: LessonRecordGroupByArgs['orderBy'];
    } : {
        orderBy?: LessonRecordGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, LessonRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLessonRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: LessonRecordFieldRefs;
}
export interface Prisma__LessonRecordClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    session<T extends Prisma.ClassSessionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ClassSessionDefaultArgs<ExtArgs>>): Prisma.Prisma__ClassSessionClient<runtime.Types.Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface LessonRecordFieldRefs {
    readonly id: Prisma.FieldRef<"LessonRecord", 'String'>;
    readonly sessionId: Prisma.FieldRef<"LessonRecord", 'String'>;
    readonly content: Prisma.FieldRef<"LessonRecord", 'String'>;
    readonly homeworkSummary: Prisma.FieldRef<"LessonRecord", 'String'>;
    readonly teacherNotes: Prisma.FieldRef<"LessonRecord", 'String'>;
    readonly createdAt: Prisma.FieldRef<"LessonRecord", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"LessonRecord", 'DateTime'>;
}
export type LessonRecordFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where?: Prisma.LessonRecordWhereInput;
    orderBy?: Prisma.LessonRecordOrderByWithRelationInput | Prisma.LessonRecordOrderByWithRelationInput[];
    cursor?: Prisma.LessonRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LessonRecordScalarFieldEnum | Prisma.LessonRecordScalarFieldEnum[];
};
export type LessonRecordFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where?: Prisma.LessonRecordWhereInput;
    orderBy?: Prisma.LessonRecordOrderByWithRelationInput | Prisma.LessonRecordOrderByWithRelationInput[];
    cursor?: Prisma.LessonRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LessonRecordScalarFieldEnum | Prisma.LessonRecordScalarFieldEnum[];
};
export type LessonRecordFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where?: Prisma.LessonRecordWhereInput;
    orderBy?: Prisma.LessonRecordOrderByWithRelationInput | Prisma.LessonRecordOrderByWithRelationInput[];
    cursor?: Prisma.LessonRecordWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LessonRecordScalarFieldEnum | Prisma.LessonRecordScalarFieldEnum[];
};
export type LessonRecordCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LessonRecordCreateInput, Prisma.LessonRecordUncheckedCreateInput>;
};
export type LessonRecordCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.LessonRecordCreateManyInput | Prisma.LessonRecordCreateManyInput[];
    skipDuplicates?: boolean;
};
export type LessonRecordCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    data: Prisma.LessonRecordCreateManyInput | Prisma.LessonRecordCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.LessonRecordIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type LessonRecordUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LessonRecordUpdateInput, Prisma.LessonRecordUncheckedUpdateInput>;
    where: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.LessonRecordUpdateManyMutationInput, Prisma.LessonRecordUncheckedUpdateManyInput>;
    where?: Prisma.LessonRecordWhereInput;
    limit?: number;
};
export type LessonRecordUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.LessonRecordUpdateManyMutationInput, Prisma.LessonRecordUncheckedUpdateManyInput>;
    where?: Prisma.LessonRecordWhereInput;
    limit?: number;
    include?: Prisma.LessonRecordIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type LessonRecordUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where: Prisma.LessonRecordWhereUniqueInput;
    create: Prisma.XOR<Prisma.LessonRecordCreateInput, Prisma.LessonRecordUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.LessonRecordUpdateInput, Prisma.LessonRecordUncheckedUpdateInput>;
};
export type LessonRecordDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
    where: Prisma.LessonRecordWhereUniqueInput;
};
export type LessonRecordDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LessonRecordWhereInput;
    limit?: number;
};
export type LessonRecordDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LessonRecordSelect<ExtArgs> | null;
    omit?: Prisma.LessonRecordOmit<ExtArgs> | null;
    include?: Prisma.LessonRecordInclude<ExtArgs> | null;
};
