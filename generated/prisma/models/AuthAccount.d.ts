import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type AuthAccountModel = runtime.Types.Result.DefaultSelection<Prisma.$AuthAccountPayload>;
export type AggregateAuthAccount = {
    _count: AuthAccountCountAggregateOutputType | null;
    _min: AuthAccountMinAggregateOutputType | null;
    _max: AuthAccountMaxAggregateOutputType | null;
};
export type AuthAccountMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    provider: string | null;
    providerAccountId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AuthAccountMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    provider: string | null;
    providerAccountId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type AuthAccountCountAggregateOutputType = {
    id: number;
    userId: number;
    provider: number;
    providerAccountId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type AuthAccountMinAggregateInputType = {
    id?: true;
    userId?: true;
    provider?: true;
    providerAccountId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AuthAccountMaxAggregateInputType = {
    id?: true;
    userId?: true;
    provider?: true;
    providerAccountId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type AuthAccountCountAggregateInputType = {
    id?: true;
    userId?: true;
    provider?: true;
    providerAccountId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type AuthAccountAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthAccountWhereInput;
    orderBy?: Prisma.AuthAccountOrderByWithRelationInput | Prisma.AuthAccountOrderByWithRelationInput[];
    cursor?: Prisma.AuthAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | AuthAccountCountAggregateInputType;
    _min?: AuthAccountMinAggregateInputType;
    _max?: AuthAccountMaxAggregateInputType;
};
export type GetAuthAccountAggregateType<T extends AuthAccountAggregateArgs> = {
    [P in keyof T & keyof AggregateAuthAccount]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAuthAccount[P]> : Prisma.GetScalarType<T[P], AggregateAuthAccount[P]>;
};
export type AuthAccountGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthAccountWhereInput;
    orderBy?: Prisma.AuthAccountOrderByWithAggregationInput | Prisma.AuthAccountOrderByWithAggregationInput[];
    by: Prisma.AuthAccountScalarFieldEnum[] | Prisma.AuthAccountScalarFieldEnum;
    having?: Prisma.AuthAccountScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuthAccountCountAggregateInputType | true;
    _min?: AuthAccountMinAggregateInputType;
    _max?: AuthAccountMaxAggregateInputType;
};
export type AuthAccountGroupByOutputType = {
    id: string;
    userId: string;
    provider: string;
    providerAccountId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: AuthAccountCountAggregateOutputType | null;
    _min: AuthAccountMinAggregateOutputType | null;
    _max: AuthAccountMaxAggregateOutputType | null;
};
export type GetAuthAccountGroupByPayload<T extends AuthAccountGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AuthAccountGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AuthAccountGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AuthAccountGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AuthAccountGroupByOutputType[P]>;
}>>;
export type AuthAccountWhereInput = {
    AND?: Prisma.AuthAccountWhereInput | Prisma.AuthAccountWhereInput[];
    OR?: Prisma.AuthAccountWhereInput[];
    NOT?: Prisma.AuthAccountWhereInput | Prisma.AuthAccountWhereInput[];
    id?: Prisma.StringFilter<"AuthAccount"> | string;
    userId?: Prisma.StringFilter<"AuthAccount"> | string;
    provider?: Prisma.StringFilter<"AuthAccount"> | string;
    providerAccountId?: Prisma.StringFilter<"AuthAccount"> | string;
    createdAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type AuthAccountOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerAccountId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type AuthAccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    provider_providerAccountId?: Prisma.AuthAccountProviderProviderAccountIdCompoundUniqueInput;
    AND?: Prisma.AuthAccountWhereInput | Prisma.AuthAccountWhereInput[];
    OR?: Prisma.AuthAccountWhereInput[];
    NOT?: Prisma.AuthAccountWhereInput | Prisma.AuthAccountWhereInput[];
    userId?: Prisma.StringFilter<"AuthAccount"> | string;
    provider?: Prisma.StringFilter<"AuthAccount"> | string;
    providerAccountId?: Prisma.StringFilter<"AuthAccount"> | string;
    createdAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "provider_providerAccountId">;
export type AuthAccountOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerAccountId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.AuthAccountCountOrderByAggregateInput;
    _max?: Prisma.AuthAccountMaxOrderByAggregateInput;
    _min?: Prisma.AuthAccountMinOrderByAggregateInput;
};
export type AuthAccountScalarWhereWithAggregatesInput = {
    AND?: Prisma.AuthAccountScalarWhereWithAggregatesInput | Prisma.AuthAccountScalarWhereWithAggregatesInput[];
    OR?: Prisma.AuthAccountScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AuthAccountScalarWhereWithAggregatesInput | Prisma.AuthAccountScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"AuthAccount"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"AuthAccount"> | string;
    provider?: Prisma.StringWithAggregatesFilter<"AuthAccount"> | string;
    providerAccountId?: Prisma.StringWithAggregatesFilter<"AuthAccount"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AuthAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"AuthAccount"> | Date | string;
};
export type AuthAccountCreateInput = {
    id?: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutAuthAccountsInput;
};
export type AuthAccountUncheckedCreateInput = {
    id?: string;
    userId: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuthAccountUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutAuthAccountsNestedInput;
};
export type AuthAccountUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountCreateManyInput = {
    id?: string;
    userId: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuthAccountUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountListRelationFilter = {
    every?: Prisma.AuthAccountWhereInput;
    some?: Prisma.AuthAccountWhereInput;
    none?: Prisma.AuthAccountWhereInput;
};
export type AuthAccountOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AuthAccountProviderProviderAccountIdCompoundUniqueInput = {
    provider: string;
    providerAccountId: string;
};
export type AuthAccountCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerAccountId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuthAccountMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerAccountId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuthAccountMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerAccountId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type AuthAccountCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput> | Prisma.AuthAccountCreateWithoutUserInput[] | Prisma.AuthAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.AuthAccountCreateOrConnectWithoutUserInput | Prisma.AuthAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.AuthAccountCreateManyUserInputEnvelope;
    connect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
};
export type AuthAccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput> | Prisma.AuthAccountCreateWithoutUserInput[] | Prisma.AuthAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.AuthAccountCreateOrConnectWithoutUserInput | Prisma.AuthAccountCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.AuthAccountCreateManyUserInputEnvelope;
    connect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
};
export type AuthAccountUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput> | Prisma.AuthAccountCreateWithoutUserInput[] | Prisma.AuthAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.AuthAccountCreateOrConnectWithoutUserInput | Prisma.AuthAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.AuthAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.AuthAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.AuthAccountCreateManyUserInputEnvelope;
    set?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    disconnect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    delete?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    connect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    update?: Prisma.AuthAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.AuthAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.AuthAccountUpdateManyWithWhereWithoutUserInput | Prisma.AuthAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.AuthAccountScalarWhereInput | Prisma.AuthAccountScalarWhereInput[];
};
export type AuthAccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput> | Prisma.AuthAccountCreateWithoutUserInput[] | Prisma.AuthAccountUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.AuthAccountCreateOrConnectWithoutUserInput | Prisma.AuthAccountCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.AuthAccountUpsertWithWhereUniqueWithoutUserInput | Prisma.AuthAccountUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.AuthAccountCreateManyUserInputEnvelope;
    set?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    disconnect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    delete?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    connect?: Prisma.AuthAccountWhereUniqueInput | Prisma.AuthAccountWhereUniqueInput[];
    update?: Prisma.AuthAccountUpdateWithWhereUniqueWithoutUserInput | Prisma.AuthAccountUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.AuthAccountUpdateManyWithWhereWithoutUserInput | Prisma.AuthAccountUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.AuthAccountScalarWhereInput | Prisma.AuthAccountScalarWhereInput[];
};
export type AuthAccountCreateWithoutUserInput = {
    id?: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuthAccountUncheckedCreateWithoutUserInput = {
    id?: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuthAccountCreateOrConnectWithoutUserInput = {
    where: Prisma.AuthAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput>;
};
export type AuthAccountCreateManyUserInputEnvelope = {
    data: Prisma.AuthAccountCreateManyUserInput | Prisma.AuthAccountCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type AuthAccountUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.AuthAccountWhereUniqueInput;
    update: Prisma.XOR<Prisma.AuthAccountUpdateWithoutUserInput, Prisma.AuthAccountUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.AuthAccountCreateWithoutUserInput, Prisma.AuthAccountUncheckedCreateWithoutUserInput>;
};
export type AuthAccountUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.AuthAccountWhereUniqueInput;
    data: Prisma.XOR<Prisma.AuthAccountUpdateWithoutUserInput, Prisma.AuthAccountUncheckedUpdateWithoutUserInput>;
};
export type AuthAccountUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.AuthAccountScalarWhereInput;
    data: Prisma.XOR<Prisma.AuthAccountUpdateManyMutationInput, Prisma.AuthAccountUncheckedUpdateManyWithoutUserInput>;
};
export type AuthAccountScalarWhereInput = {
    AND?: Prisma.AuthAccountScalarWhereInput | Prisma.AuthAccountScalarWhereInput[];
    OR?: Prisma.AuthAccountScalarWhereInput[];
    NOT?: Prisma.AuthAccountScalarWhereInput | Prisma.AuthAccountScalarWhereInput[];
    id?: Prisma.StringFilter<"AuthAccount"> | string;
    userId?: Prisma.StringFilter<"AuthAccount"> | string;
    provider?: Prisma.StringFilter<"AuthAccount"> | string;
    providerAccountId?: Prisma.StringFilter<"AuthAccount"> | string;
    createdAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"AuthAccount"> | Date | string;
};
export type AuthAccountCreateManyUserInput = {
    id?: string;
    provider: string;
    providerAccountId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type AuthAccountUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    providerAccountId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AuthAccountSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    provider?: boolean;
    providerAccountId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["authAccount"]>;
export type AuthAccountSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    provider?: boolean;
    providerAccountId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["authAccount"]>;
export type AuthAccountSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    provider?: boolean;
    providerAccountId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["authAccount"]>;
export type AuthAccountSelectScalar = {
    id?: boolean;
    userId?: boolean;
    provider?: boolean;
    providerAccountId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type AuthAccountOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "provider" | "providerAccountId" | "createdAt" | "updatedAt", ExtArgs["result"]["authAccount"]>;
export type AuthAccountInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AuthAccountIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type AuthAccountIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $AuthAccountPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AuthAccount";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        provider: string;
        providerAccountId: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["authAccount"]>;
    composites: {};
};
export type AuthAccountGetPayload<S extends boolean | null | undefined | AuthAccountDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload, S>;
export type AuthAccountCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AuthAccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuthAccountCountAggregateInputType | true;
};
export interface AuthAccountDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AuthAccount'];
        meta: {
            name: 'AuthAccount';
        };
    };
    findUnique<T extends AuthAccountFindUniqueArgs>(args: Prisma.SelectSubset<T, AuthAccountFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends AuthAccountFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AuthAccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends AuthAccountFindFirstArgs>(args?: Prisma.SelectSubset<T, AuthAccountFindFirstArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends AuthAccountFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AuthAccountFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends AuthAccountFindManyArgs>(args?: Prisma.SelectSubset<T, AuthAccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends AuthAccountCreateArgs>(args: Prisma.SelectSubset<T, AuthAccountCreateArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends AuthAccountCreateManyArgs>(args?: Prisma.SelectSubset<T, AuthAccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends AuthAccountCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AuthAccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends AuthAccountDeleteArgs>(args: Prisma.SelectSubset<T, AuthAccountDeleteArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends AuthAccountUpdateArgs>(args: Prisma.SelectSubset<T, AuthAccountUpdateArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends AuthAccountDeleteManyArgs>(args?: Prisma.SelectSubset<T, AuthAccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends AuthAccountUpdateManyArgs>(args: Prisma.SelectSubset<T, AuthAccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends AuthAccountUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AuthAccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends AuthAccountUpsertArgs>(args: Prisma.SelectSubset<T, AuthAccountUpsertArgs<ExtArgs>>): Prisma.Prisma__AuthAccountClient<runtime.Types.Result.GetResult<Prisma.$AuthAccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends AuthAccountCountArgs>(args?: Prisma.Subset<T, AuthAccountCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AuthAccountCountAggregateOutputType> : number>;
    aggregate<T extends AuthAccountAggregateArgs>(args: Prisma.Subset<T, AuthAccountAggregateArgs>): Prisma.PrismaPromise<GetAuthAccountAggregateType<T>>;
    groupBy<T extends AuthAccountGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AuthAccountGroupByArgs['orderBy'];
    } : {
        orderBy?: AuthAccountGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AuthAccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: AuthAccountFieldRefs;
}
export interface Prisma__AuthAccountClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface AuthAccountFieldRefs {
    readonly id: Prisma.FieldRef<"AuthAccount", 'String'>;
    readonly userId: Prisma.FieldRef<"AuthAccount", 'String'>;
    readonly provider: Prisma.FieldRef<"AuthAccount", 'String'>;
    readonly providerAccountId: Prisma.FieldRef<"AuthAccount", 'String'>;
    readonly createdAt: Prisma.FieldRef<"AuthAccount", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"AuthAccount", 'DateTime'>;
}
export type AuthAccountFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where: Prisma.AuthAccountWhereUniqueInput;
};
export type AuthAccountFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where: Prisma.AuthAccountWhereUniqueInput;
};
export type AuthAccountFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where?: Prisma.AuthAccountWhereInput;
    orderBy?: Prisma.AuthAccountOrderByWithRelationInput | Prisma.AuthAccountOrderByWithRelationInput[];
    cursor?: Prisma.AuthAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuthAccountScalarFieldEnum | Prisma.AuthAccountScalarFieldEnum[];
};
export type AuthAccountFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where?: Prisma.AuthAccountWhereInput;
    orderBy?: Prisma.AuthAccountOrderByWithRelationInput | Prisma.AuthAccountOrderByWithRelationInput[];
    cursor?: Prisma.AuthAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuthAccountScalarFieldEnum | Prisma.AuthAccountScalarFieldEnum[];
};
export type AuthAccountFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where?: Prisma.AuthAccountWhereInput;
    orderBy?: Prisma.AuthAccountOrderByWithRelationInput | Prisma.AuthAccountOrderByWithRelationInput[];
    cursor?: Prisma.AuthAccountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuthAccountScalarFieldEnum | Prisma.AuthAccountScalarFieldEnum[];
};
export type AuthAccountCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuthAccountCreateInput, Prisma.AuthAccountUncheckedCreateInput>;
};
export type AuthAccountCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.AuthAccountCreateManyInput | Prisma.AuthAccountCreateManyInput[];
    skipDuplicates?: boolean;
};
export type AuthAccountCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    data: Prisma.AuthAccountCreateManyInput | Prisma.AuthAccountCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.AuthAccountIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type AuthAccountUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuthAccountUpdateInput, Prisma.AuthAccountUncheckedUpdateInput>;
    where: Prisma.AuthAccountWhereUniqueInput;
};
export type AuthAccountUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.AuthAccountUpdateManyMutationInput, Prisma.AuthAccountUncheckedUpdateManyInput>;
    where?: Prisma.AuthAccountWhereInput;
    limit?: number;
};
export type AuthAccountUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.AuthAccountUpdateManyMutationInput, Prisma.AuthAccountUncheckedUpdateManyInput>;
    where?: Prisma.AuthAccountWhereInput;
    limit?: number;
    include?: Prisma.AuthAccountIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type AuthAccountUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where: Prisma.AuthAccountWhereUniqueInput;
    create: Prisma.XOR<Prisma.AuthAccountCreateInput, Prisma.AuthAccountUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.AuthAccountUpdateInput, Prisma.AuthAccountUncheckedUpdateInput>;
};
export type AuthAccountDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
    where: Prisma.AuthAccountWhereUniqueInput;
};
export type AuthAccountDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthAccountWhereInput;
    limit?: number;
};
export type AuthAccountDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.AuthAccountSelect<ExtArgs> | null;
    omit?: Prisma.AuthAccountOmit<ExtArgs> | null;
    include?: Prisma.AuthAccountInclude<ExtArgs> | null;
};
