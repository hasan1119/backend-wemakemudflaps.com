import { GraphQLResolveInfo } from 'graphql';
import { Context } from './context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  _FieldSet: { input: any; output: any; }
};

export type ActiveAccountResponseOrError = BaseResponse | ErrorResponse;

export type BaseResponse = {
  __typename?: 'BaseResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type BaseResponseOrError = BaseResponse | ErrorResponse;

export type CachedRoleInputs = {
  __typename?: 'CachedRoleInputs';
  createdAt: Scalars['String']['output'];
  createdBy: CreatedBy;
  deletedAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CachedUserPermissionsInputs = {
  __typename?: 'CachedUserPermissionsInputs';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CachedUserSessionByEmailKeyInputs = {
  __typename?: 'CachedUserSessionByEmailKeyInputs';
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  password: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type CreatedBy = {
  __typename?: 'CreatedBy';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type EmailVerificationResponse = {
  __typename?: 'EmailVerificationResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type EmailVerificationResponseOrError = EmailVerificationResponse | ErrorResponse;

export type ErrorResponse = {
  __typename?: 'ErrorResponse';
  errors?: Maybe<Array<FieldError>>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type GetProfileResponseOrError = BaseResponse | UserResponse;

export type GetRoleByIdResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRoleResponseOrError = ErrorResponse | RoleResponse;

export type GetRolesResponseOrError = ErrorResponse | RolesResponse;

export type GetUserByIdResponseOrError = ErrorResponse | UserResponse;

export type GetUsersResponseOrError = ErrorResponse | UsersResponse;

export type Mutation = {
  __typename?: 'Mutation';
  accountActivation: ActiveAccountResponseOrError;
  changePassword: BaseResponseOrError;
  createUserRole: BaseResponseOrError;
  deleteUserRole: BaseResponseOrError;
  deleteUserRoleFromTrash: BaseResponseOrError;
  forgetPassword: BaseResponseOrError;
  login: UserLoginResponseOrError;
  register: BaseResponseOrError;
  resetPassword: BaseResponseOrError;
  restoreUserRole: BaseResponseOrError;
  updateProfile: UserProfileUpdateResponseOrError;
  updateUserPermission: BaseResponseOrError;
  updateUserRole: BaseResponseOrError;
  updateUserRoleInfo: BaseResponseOrError;
  verifyEmail: EmailVerificationResponseOrError;
};


export type MutationAccountActivationArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationCreateUserRoleArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationDeleteUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteUserRoleFromTrashArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationForgetPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationRestoreUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationUpdateProfileArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserPermissionArgs = {
  input: UpdateUserPermissionInput;
};


export type MutationUpdateUserRoleArgs = {
  roleId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateUserRoleInfoArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationVerifyEmailArgs = {
  userId: Scalars['ID']['input'];
};

export type Permissions = {
  __typename?: 'Permissions';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllUsers: GetUsersResponseOrError;
  getProfile: GetProfileResponseOrError;
  getRole: GetRoleByIdResponseOrError;
  getRoles: GetRolesResponseOrError;
};


export type QueryGetAllUsersArgs = {
  pageNo: Scalars['Int']['input'];
  searchKeyWord?: InputMaybe<Scalars['String']['input']>;
  showPerPage: Scalars['Int']['input'];
};


export type QueryGetRoleArgs = {
  id: Scalars['String']['input'];
};

export type Role = {
  __typename?: 'Role';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type RoleResponse = {
  __typename?: 'RoleResponse';
  message: Scalars['String']['output'];
  role?: Maybe<Role>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type RolesResponse = {
  __typename?: 'RolesResponse';
  message: Scalars['String']['output'];
  role: Array<Role>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type SinglePermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canRead?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateUserPermissionInput = {
  accessAll?: InputMaybe<Scalars['Boolean']['input']>;
  deniedAll?: InputMaybe<Scalars['Boolean']['input']>;
  permissions?: InputMaybe<Array<SinglePermissionInput>>;
  userId: Scalars['ID']['input'];
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAccountActivated?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Permissions>>;
  role?: Maybe<Scalars['String']['output']>;
};

export type UserLoginResponse = {
  __typename?: 'UserLoginResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type UserLoginResponseOrError = ErrorResponse | UserLoginResponse;

export type UserProfileUpdateResponse = {
  __typename?: 'UserProfileUpdateResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type UserProfileUpdateResponseOrError = ErrorResponse | UserProfileUpdateResponse;

export type UserResponse = {
  __typename?: 'UserResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  user: User;
};

export type UserSession = {
  __typename?: 'UserSession';
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  limit: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  page: Scalars['Int']['output'];
  search?: Maybe<Scalars['String']['output']>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  users: Array<User>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;

      type ScalarCheck<T, S> = S extends true ? T : NullableCheck<T, S>;
      type NullableCheck<T, S> = Maybe<T> extends T ? Maybe<ListCheck<NonNullable<T>, S>> : ListCheck<T, S>;
      type ListCheck<T, S> = T extends (infer U)[] ? NullableCheck<U, S>[] : GraphQLRecursivePick<T, S>;
      export type GraphQLRecursivePick<T, S> = { [K in keyof T & keyof S]: ScalarCheck<T[K], S[K]> };
    

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  ActiveAccountResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  BaseResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  EmailVerificationResponseOrError: ( EmailVerificationResponse ) | ( ErrorResponse );
  GetProfileResponseOrError: ( BaseResponse ) | ( UserResponse );
  GetRoleByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRoleResponseOrError: ( ErrorResponse ) | ( RoleResponse );
  GetRolesResponseOrError: ( ErrorResponse ) | ( RolesResponse );
  GetUserByIDResponseOrError: ( ErrorResponse ) | ( UserResponse );
  GetUsersResponseOrError: ( ErrorResponse ) | ( UsersResponse );
  UserLoginResponseOrError: ( ErrorResponse ) | ( UserLoginResponse );
  UserProfileUpdateResponseOrError: ( ErrorResponse ) | ( UserProfileUpdateResponse );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActiveAccountResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ActiveAccountResponseOrError']>;
  BaseResponse: ResolverTypeWrapper<BaseResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BaseResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BaseResponseOrError']>;
  CachedRoleInputs: ResolverTypeWrapper<CachedRoleInputs>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  CachedUserPermissionsInputs: ResolverTypeWrapper<CachedUserPermissionsInputs>;
  CachedUserSessionByEmailKeyInputs: ResolverTypeWrapper<CachedUserSessionByEmailKeyInputs>;
  CreatedBy: ResolverTypeWrapper<CreatedBy>;
  EmailVerificationResponse: ResolverTypeWrapper<EmailVerificationResponse>;
  EmailVerificationResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EmailVerificationResponseOrError']>;
  ErrorResponse: ResolverTypeWrapper<ErrorResponse>;
  FieldError: ResolverTypeWrapper<FieldError>;
  GetProfileResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProfileResponseOrError']>;
  GetRoleByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleByIDResponseOrError']>;
  GetRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleResponseOrError']>;
  GetRolesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRolesResponseOrError']>;
  GetUserByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserByIDResponseOrError']>;
  GetUsersResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUsersResponseOrError']>;
  Mutation: ResolverTypeWrapper<{}>;
  Permissions: ResolverTypeWrapper<Permissions>;
  Query: ResolverTypeWrapper<{}>;
  Role: ResolverTypeWrapper<Role>;
  RoleResponse: ResolverTypeWrapper<RoleResponse>;
  RolesResponse: ResolverTypeWrapper<RolesResponse>;
  SinglePermissionInput: SinglePermissionInput;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  User: ResolverTypeWrapper<User>;
  UserLoginResponse: ResolverTypeWrapper<UserLoginResponse>;
  UserLoginResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserLoginResponseOrError']>;
  UserProfileUpdateResponse: ResolverTypeWrapper<UserProfileUpdateResponse>;
  UserProfileUpdateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserProfileUpdateResponseOrError']>;
  UserResponse: ResolverTypeWrapper<UserResponse>;
  UserSession: ResolverTypeWrapper<UserSession>;
  UsersResponse: ResolverTypeWrapper<UsersResponse>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActiveAccountResponseOrError: ResolversUnionTypes<ResolversParentTypes>['ActiveAccountResponseOrError'];
  BaseResponse: BaseResponse;
  String: Scalars['String']['output'];
  Int: Scalars['Int']['output'];
  Boolean: Scalars['Boolean']['output'];
  BaseResponseOrError: ResolversUnionTypes<ResolversParentTypes>['BaseResponseOrError'];
  CachedRoleInputs: CachedRoleInputs;
  ID: Scalars['ID']['output'];
  CachedUserPermissionsInputs: CachedUserPermissionsInputs;
  CachedUserSessionByEmailKeyInputs: CachedUserSessionByEmailKeyInputs;
  CreatedBy: CreatedBy;
  EmailVerificationResponse: EmailVerificationResponse;
  EmailVerificationResponseOrError: ResolversUnionTypes<ResolversParentTypes>['EmailVerificationResponseOrError'];
  ErrorResponse: ErrorResponse;
  FieldError: FieldError;
  GetProfileResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProfileResponseOrError'];
  GetRoleByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleByIDResponseOrError'];
  GetRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleResponseOrError'];
  GetRolesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRolesResponseOrError'];
  GetUserByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserByIDResponseOrError'];
  GetUsersResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUsersResponseOrError'];
  Mutation: {};
  Permissions: Permissions;
  Query: {};
  Role: Role;
  RoleResponse: RoleResponse;
  RolesResponse: RolesResponse;
  SinglePermissionInput: SinglePermissionInput;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  User: User;
  UserLoginResponse: UserLoginResponse;
  UserLoginResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserLoginResponseOrError'];
  UserProfileUpdateResponse: UserProfileUpdateResponse;
  UserProfileUpdateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserProfileUpdateResponseOrError'];
  UserResponse: UserResponse;
  UserSession: UserSession;
  UsersResponse: UsersResponse;
};

export type ActiveAccountResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ActiveAccountResponseOrError'] = ResolversParentTypes['ActiveAccountResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type BaseResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BaseResponse'] = ResolversParentTypes['BaseResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BaseResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BaseResponseOrError'] = ResolversParentTypes['BaseResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CachedRoleInputsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CachedRoleInputs'] = ResolversParentTypes['CachedRoleInputs']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CachedUserPermissionsInputsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CachedUserPermissionsInputs'] = ResolversParentTypes['CachedUserPermissionsInputs']> = {
  canCreate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CachedUserSessionByEmailKeyInputsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CachedUserSessionByEmailKeyInputs'] = ResolversParentTypes['CachedUserSessionByEmailKeyInputs']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreatedByResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatedBy'] = ResolversParentTypes['CreatedBy']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailVerificationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EmailVerificationResponse'] = ResolversParentTypes['EmailVerificationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmailVerificationResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EmailVerificationResponseOrError'] = ResolversParentTypes['EmailVerificationResponseOrError']> = {
  __resolveType: TypeResolveFn<'EmailVerificationResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type ErrorResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ErrorResponse'] = ResolversParentTypes['ErrorResponse']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['FieldError']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FieldErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FieldError'] = ResolversParentTypes['FieldError']> = {
  field?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetProfileResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProfileResponseOrError'] = ResolversParentTypes['GetProfileResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'UserResponse', ParentType, ContextType>;
};

export type GetRoleByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRoleByIDResponseOrError'] = ResolversParentTypes['GetRoleByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type GetRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRoleResponseOrError'] = ResolversParentTypes['GetRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type GetRolesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRolesResponseOrError'] = ResolversParentTypes['GetRolesResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'RolesResponse', ParentType, ContextType>;
};

export type GetUserByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUserByIDResponseOrError'] = ResolversParentTypes['GetUserByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'UserResponse', ParentType, ContextType>;
};

export type GetUsersResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUsersResponseOrError'] = ResolversParentTypes['GetUsersResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'UsersResponse', ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  accountActivation?: Resolver<ResolversTypes['ActiveAccountResponseOrError'], ParentType, ContextType, RequireFields<MutationAccountActivationArgs, 'userId'>>;
  changePassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'newPassword' | 'oldPassword'>>;
  createUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateUserRoleArgs, 'name'>>;
  deleteUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteUserRoleArgs, 'ids' | 'skipTrash'>>;
  deleteUserRoleFromTrash?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteUserRoleFromTrashArgs, 'ids'>>;
  forgetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationForgetPasswordArgs, 'email'>>;
  login?: Resolver<ResolversTypes['UserLoginResponseOrError'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  register?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password'>>;
  resetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'newPassword' | 'token'>>;
  restoreUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreUserRoleArgs, 'ids'>>;
  updateProfile?: Resolver<ResolversTypes['UserProfileUpdateResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'id'>>;
  updateUserPermission?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserPermissionArgs, 'input'>>;
  updateUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'roleId' | 'userId'>>;
  updateUserRoleInfo?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleInfoArgs, 'id' | 'name'>>;
  verifyEmail?: Resolver<ResolversTypes['EmailVerificationResponseOrError'], ParentType, ContextType, RequireFields<MutationVerifyEmailArgs, 'userId'>>;
};

export type PermissionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Permissions'] = ResolversParentTypes['Permissions']> = {
  canCreate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getAllUsers?: Resolver<ResolversTypes['GetUsersResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllUsersArgs, 'pageNo' | 'showPerPage'>>;
  getProfile?: Resolver<ResolversTypes['GetProfileResponseOrError'], ParentType, ContextType>;
  getRole?: Resolver<ResolversTypes['GetRoleByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetRoleArgs, 'id'>>;
  getRoles?: Resolver<ResolversTypes['GetRolesResponseOrError'], ParentType, ContextType>;
};

export type RoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RoleResponse'] = ResolversParentTypes['RoleResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RolesResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RolesResponse'] = ResolversParentTypes['RolesResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<ParentType, {"id":true}>, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Maybe<Array<ResolversTypes['Permissions']>>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserLoginResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserLoginResponse'] = ResolversParentTypes['UserLoginResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserLoginResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserLoginResponseOrError'] = ResolversParentTypes['UserLoginResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'UserLoginResponse', ParentType, ContextType>;
};

export type UserProfileUpdateResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileUpdateResponse'] = ResolversParentTypes['UserProfileUpdateResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserProfileUpdateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileUpdateResponseOrError'] = ResolversParentTypes['UserProfileUpdateResponseOrError']> = {
  __resolveType: TypeResolveFn<'ErrorResponse' | 'UserProfileUpdateResponse', ParentType, ContextType>;
};

export type UserResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserResponse'] = ResolversParentTypes['UserResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSession'] = ResolversParentTypes['UserSession']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UsersResponse'] = ResolversParentTypes['UsersResponse']> = {
  limit?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  search?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  ActiveAccountResponseOrError?: ActiveAccountResponseOrErrorResolvers<ContextType>;
  BaseResponse?: BaseResponseResolvers<ContextType>;
  BaseResponseOrError?: BaseResponseOrErrorResolvers<ContextType>;
  CachedRoleInputs?: CachedRoleInputsResolvers<ContextType>;
  CachedUserPermissionsInputs?: CachedUserPermissionsInputsResolvers<ContextType>;
  CachedUserSessionByEmailKeyInputs?: CachedUserSessionByEmailKeyInputsResolvers<ContextType>;
  CreatedBy?: CreatedByResolvers<ContextType>;
  EmailVerificationResponse?: EmailVerificationResponseResolvers<ContextType>;
  EmailVerificationResponseOrError?: EmailVerificationResponseOrErrorResolvers<ContextType>;
  ErrorResponse?: ErrorResponseResolvers<ContextType>;
  FieldError?: FieldErrorResolvers<ContextType>;
  GetProfileResponseOrError?: GetProfileResponseOrErrorResolvers<ContextType>;
  GetRoleByIDResponseOrError?: GetRoleByIdResponseOrErrorResolvers<ContextType>;
  GetRoleResponseOrError?: GetRoleResponseOrErrorResolvers<ContextType>;
  GetRolesResponseOrError?: GetRolesResponseOrErrorResolvers<ContextType>;
  GetUserByIDResponseOrError?: GetUserByIdResponseOrErrorResolvers<ContextType>;
  GetUsersResponseOrError?: GetUsersResponseOrErrorResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Permissions?: PermissionsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RoleResponse?: RoleResponseResolvers<ContextType>;
  RolesResponse?: RolesResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserLoginResponse?: UserLoginResponseResolvers<ContextType>;
  UserLoginResponseOrError?: UserLoginResponseOrErrorResolvers<ContextType>;
  UserProfileUpdateResponse?: UserProfileUpdateResponseResolvers<ContextType>;
  UserProfileUpdateResponseOrError?: UserProfileUpdateResponseOrErrorResolvers<ContextType>;
  UserResponse?: UserResponseResolvers<ContextType>;
  UserSession?: UserSessionResolvers<ContextType>;
  UsersResponse?: UsersResponseResolvers<ContextType>;
};

