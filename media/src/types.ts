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

export type CreatedBy = {
  __typename?: 'CreatedBy';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roles: Array<Scalars['String']['output']>;
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

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Others = 'Others',
  RatherNotToSay = 'Rather_not_to_say'
}

export type GetMediaByIdResponseOrError = BaseResponse | ErrorResponse | MediaResponse;

export type GetMediasResponseOrError = BaseResponse | ErrorResponse | MediasResponse;

export type GetPermissionsResponseOrError = BaseResponse | ErrorResponse | PersonalizedWithRolePermissionResponse;

export type GetPersonalizedPermissionsResponseOrError = BaseResponse | ErrorResponse | PermissionsResponse;

export type GetProfileResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetRoleByIdResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRolesResponseOrError = BaseResponse | ErrorResponse | RolesResponse;

export type GetUserByIdResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetUsersResponseOrError = BaseResponse | ErrorResponse | UsersResponse;

export type Media = {
  __typename?: 'Media';
  altText?: Maybe<Scalars['String']['output']>;
  bucketName?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dimension?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  length?: Maybe<Scalars['Int']['output']>;
  mediaType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum MediaCategory {
  Banner = 'Banner',
  Brand = 'Brand',
  Carousel = 'Carousel',
  Category = 'Category',
  Complain = 'Complain',
  Invoice = 'Invoice',
  Order = 'Order',
  Product = 'Product',
  ProductReturn = 'Product_Return',
  ProductReview = 'Product_Review',
  Profile = 'Profile',
  Promotion = 'Promotion',
  ShippingLabel = 'Shipping_Label',
  SiteFavicon = 'Site_Favicon',
  SiteLogo = 'Site_Logo',
  SiteSettings = 'Site_Settings',
  SubCategory = 'Sub_Category'
}

export enum MediaMimeType {
  ApplicationMsword = 'application_msword',
  ApplicationPdf = 'application_pdf',
  ApplicationRtf = 'application_rtf',
  ApplicationVndLotus_1_2_3 = 'application_vnd_lotus_1_2_3',
  ApplicationVndLotusApproach = 'application_vnd_lotus_approach',
  ApplicationVndLotusFreelance = 'application_vnd_lotus_freelance',
  ApplicationVndLotusOrganizer = 'application_vnd_lotus_organizer',
  ApplicationVndLotusScreencam = 'application_vnd_lotus_screencam',
  ApplicationVndLotusWordpro = 'application_vnd_lotus_wordpro',
  ApplicationVndMsExcel = 'application_vnd_ms_excel',
  ApplicationVndMsPowerpoint = 'application_vnd_ms_powerpoint',
  ApplicationVndOasisOpendocumentChart = 'application_vnd_oasis_opendocument_chart',
  ApplicationVndOasisOpendocumentFormula = 'application_vnd_oasis_opendocument_formula',
  ApplicationVndOasisOpendocumentGraphics = 'application_vnd_oasis_opendocument_graphics',
  ApplicationVndOasisOpendocumentImage = 'application_vnd_oasis_opendocument_image',
  ApplicationVndOasisOpendocumentPresentation = 'application_vnd_oasis_opendocument_presentation',
  ApplicationVndOasisOpendocumentSpreadsheet = 'application_vnd_oasis_opendocument_spreadsheet',
  ApplicationVndOasisOpendocumentText = 'application_vnd_oasis_opendocument_text',
  ApplicationVndOpenxmlformatsOfficedocumentPresentationmlPresentation = 'application_vnd_openxmlformats_officedocument_presentationml_presentation',
  ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet = 'application_vnd_openxmlformats_officedocument_spreadsheetml_sheet',
  ApplicationVndOpenxmlformatsOfficedocumentWordprocessingmlDocument = 'application_vnd_openxmlformats_officedocument_wordprocessingml_document',
  ApplicationVndVisio = 'application_vnd_visio',
  ApplicationXAbiword = 'application_x_abiword',
  ImageAvif = 'image_avif',
  ImageBmp = 'image_bmp',
  ImageGif = 'image_gif',
  ImageHeic = 'image_heic',
  ImageHeif = 'image_heif',
  ImageJp2 = 'image_jp2',
  ImageJpeg = 'image_jpeg',
  ImageJpm = 'image_jpm',
  ImageJpx = 'image_jpx',
  ImagePng = 'image_png',
  ImageSvgXml = 'image_svg_xml',
  ImageTiff = 'image_tiff',
  ImageWebp = 'image_webp',
  ImageXIcon = 'image_x_icon',
  ImageXPortableAnymap = 'image_x_portable_anymap',
  ImageXPortableBitmap = 'image_x_portable_bitmap',
  ImageXPortableGraymap = 'image_x_portable_graymap',
  ImageXPortablePixmap = 'image_x_portable_pixmap',
  ImageXRgb = 'image_x_rgb',
  ImageXXbitmap = 'image_x_xbitmap',
  ImageXXpixmap = 'image_x_xpixmap',
  ImageXXwindowdump = 'image_x_xwindowdump',
  Video_3gpp = 'video_3gpp',
  Video_3gpp2 = 'video_3gpp2',
  VideoH261 = 'video_h261',
  VideoH263 = 'video_h263',
  VideoH264 = 'video_h264',
  VideoJpeg = 'video_jpeg',
  VideoJpm = 'video_jpm',
  VideoMj2 = 'video_mj2',
  VideoMp2t = 'video_mp2t',
  VideoMp4 = 'video_mp4',
  VideoMpeg = 'video_mpeg',
  VideoOgg = 'video_ogg',
  VideoQuicktime = 'video_quicktime',
  VideoWebm = 'video_webm',
  VideoXF4v = 'video_x_f4v',
  VideoXFli = 'video_x_fli',
  VideoXFlv = 'video_x_flv',
  VideoXM4v = 'video_x_m4v',
  VideoXMatroska = 'video_x_matroska',
  VideoXMng = 'video_x_mng',
  VideoXMsAsf = 'video_x_ms_asf',
  VideoXMsWmv = 'video_x_ms_wmv',
  VideoXMsvideo = 'video_x_msvideo',
  VideoXSmv = 'video_x_smv'
}

export type MediaResponse = {
  __typename?: 'MediaResponse';
  media: Media;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type MediasResponse = {
  __typename?: 'MediasResponse';
  medias: Array<Media>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  accountActivation: ActiveAccountResponseOrError;
  changePassword: BaseResponseOrError;
  createUserRole: BaseResponseOrError;
  deleteMediaFiles: BaseResponseOrError;
  deleteUserRole: BaseResponseOrError;
  forgetPassword: BaseResponseOrError;
  login: UserLoginResponseOrError;
  logout: BaseResponseOrError;
  register: BaseResponseOrError;
  resetPassword: BaseResponseOrError;
  restoreMediaFiles: BaseResponseOrError;
  restoreUserRole: BaseResponseOrError;
  updateMediaFileInfo: BaseResponseOrError;
  updateProfile: UserProfileUpdateResponseOrError;
  updateUserPermission: BaseResponseOrError;
  updateUserRole: BaseResponseOrError;
  updateUserRoleInfo: BaseResponseOrError;
  uploadMediaFiles: BaseResponseOrError;
  verifyEmail: EmailVerificationResponseOrError;
};


export type MutationAccountActivationArgs = {
  email: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationCreateUserRoleArgs = {
  defaultPermissions?: InputMaybe<Array<RolePermissionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  systemDeleteProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemPermanentDeleteProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemPermanentUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  skipTrash: Scalars['Boolean']['input'];
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
  gender?: InputMaybe<Gender>;
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationRestoreMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationUpdateMediaFileInfoArgs = {
  inputs: UpdateMediaInput;
};


export type MutationUpdateProfileArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  lastName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserPermissionArgs = {
  input: UpdateUserPermissionInput;
};


export type MutationUpdateUserRoleArgs = {
  password?: InputMaybe<Scalars['String']['input']>;
  roleAddIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  roleRemoveIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  userId: Scalars['String']['input'];
};


export type MutationUpdateUserRoleInfoArgs = {
  defaultPermissions?: InputMaybe<Array<RolePermissionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  systemDeleteProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemPermanentDeleteProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemPermanentUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationUploadMediaFilesArgs = {
  inputs: Array<InputMaybe<UploadMediaInput>>;
  userId: Scalars['String']['input'];
};


export type MutationVerifyEmailArgs = {
  email: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type PermissionAgainstRoleInput = {
  canCreate: Scalars['Boolean']['input'];
  canDelete: Scalars['Boolean']['input'];
  canRead: Scalars['Boolean']['input'];
  canUpdate: Scalars['Boolean']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export enum PermissionName {
  Brand = 'BRAND',
  Category = 'CATEGORY',
  Coupon = 'COUPON',
  Faq = 'FAQ',
  Media = 'MEDIA',
  NewsLetter = 'NEWS_LETTER',
  Notification = 'NOTIFICATION',
  Order = 'ORDER',
  Permission = 'PERMISSION',
  PopUpBanner = 'POP_UP_BANNER',
  PrivacyPolicy = 'PRIVACY_POLICY',
  Product = 'PRODUCT',
  ProductReview = 'PRODUCT_REVIEW',
  Role = 'ROLE',
  ShippingClass = 'SHIPPING_CLASS',
  SubCategory = 'SUB_CATEGORY',
  TaxClass = 'TAX_CLASS',
  TaxStatus = 'TAX_STATUS',
  TermsConditions = 'TERMS_CONDITIONS',
  User = 'USER'
}

export type PermissionSession = {
  __typename?: 'PermissionSession';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Permissions = {
  __typename?: 'Permissions';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: PermissionName;
};

export type PermissionsResponse = {
  __typename?: 'PermissionsResponse';
  message: Scalars['String']['output'];
  permissions: Array<Permissions>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type PersonalizedWithRolePermissionResponse = {
  __typename?: 'PersonalizedWithRolePermissionResponse';
  message: Scalars['String']['output'];
  personalizedPermissions: Array<Permissions>;
  rolePermissions?: Maybe<Array<Role>>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllMedias: GetMediasResponseOrError;
  getAllPermissionsByUserId: GetPermissionsResponseOrError;
  getAllRoles: GetRolesResponseOrError;
  getAllUsers: GetUsersResponseOrError;
  getMediaById: GetMediaByIdResponseOrError;
  getOwnPersonalizedPermissions: GetPermissionsResponseOrError;
  getProfile: GetProfileResponseOrError;
  getRoleById: GetRoleByIdResponseOrError;
  getUserById: GetUserByIdResponseOrError;
};


export type QueryGetAllMediasArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllPermissionsByUserIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetAllRolesArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllUsersArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetMediaByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetRoleByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String']['input'];
};

export type Role = {
  __typename?: 'Role';
  assignedUserCount?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  defaultPermissions?: Maybe<Array<RolePermissionSession>>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  systemDeleteProtection?: Maybe<Scalars['Boolean']['output']>;
  systemPermanentDeleteProtection?: Maybe<Scalars['Boolean']['output']>;
  systemPermanentUpdateProtection?: Maybe<Scalars['Boolean']['output']>;
  systemUpdateProtection?: Maybe<Scalars['Boolean']['output']>;
};

export type RolePermissionInput = {
  canCreate: Scalars['Boolean']['input'];
  canDelete: Scalars['Boolean']['input'];
  canRead: Scalars['Boolean']['input'];
  canUpdate: Scalars['Boolean']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: PermissionName;
};

export type RolePermissionSession = {
  __typename?: 'RolePermissionSession';
  canCreate: Scalars['Boolean']['output'];
  canDelete: Scalars['Boolean']['output'];
  canRead: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type RoleResponse = {
  __typename?: 'RoleResponse';
  message: Scalars['String']['output'];
  role: Role;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type RoleSession = {
  __typename?: 'RoleSession';
  createdAt: Scalars['String']['output'];
  createdBy: CreatedBy;
  defaultPermissions: Array<RolePermissionSession>;
  deletedAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  systemDeleteProtection: Scalars['Boolean']['output'];
  systemPermanentDeleteProtection: Scalars['Boolean']['output'];
  systemPermanentUpdateProtection: Scalars['Boolean']['output'];
  systemUpdateProtection: Scalars['Boolean']['output'];
};

export type RolesResponse = {
  __typename?: 'RolesResponse';
  message: Scalars['String']['output'];
  roles: Array<Role>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type SinglePermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canRead?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: PermissionName;
};

export type UpdateMediaInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  category: MediaCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  dimension?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  length?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserPermissionInput = {
  accessAll?: InputMaybe<Scalars['Boolean']['input']>;
  deniedAll?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<SinglePermissionInput>>;
  userId: Scalars['ID']['input'];
};

export type UploadMediaInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  bucketName: Scalars['String']['input'];
  category: MediaCategory;
  createdBy: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dimension?: InputMaybe<Scalars['String']['input']>;
  fileName: Scalars['String']['input'];
  length?: InputMaybe<Scalars['Int']['input']>;
  mediaType: MediaMimeType;
  size: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  canUpdatePermissions?: Maybe<Scalars['Boolean']['output']>;
  canUpdateRole?: Maybe<Scalars['Boolean']['output']>;
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
  roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type UserLoginResponse = {
  __typename?: 'UserLoginResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type UserLoginResponseOrError = BaseResponse | ErrorResponse | UserLoginResponse;

export type UserProfileUpdateResponse = {
  __typename?: 'UserProfileUpdateResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type UserProfileUpdateResponseOrError = BaseResponse | ErrorResponse | UserProfileUpdateResponse;

export type UserResponse = {
  __typename?: 'UserResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  user: User;
};

export type UserSession = {
  __typename?: 'UserSession';
  avatar: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  roles: Array<Scalars['String']['output']>;
};

export type UserSessionByEmail = {
  __typename?: 'UserSessionByEmail';
  avatar: Scalars['String']['output'];
  canUpdatePermissions: Scalars['Boolean']['output'];
  canUpdateRole: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  deletedAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  password: Scalars['String']['output'];
  permissions: Array<PermissionSession>;
  roles: Array<Scalars['String']['output']>;
  tempEmailVerified: Scalars['Boolean']['output'];
  tempUpdatedEmail: Scalars['String']['output'];
};

export type UserSessionById = {
  __typename?: 'UserSessionById';
  avatar: Scalars['String']['output'];
  canUpdatePermissions: Scalars['Boolean']['output'];
  canUpdateRole: Scalars['Boolean']['output'];
  createdAt: Scalars['String']['output'];
  deletedAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  permissions: Array<PermissionSession>;
  roles: Array<Scalars['String']['output']>;
  tempEmailVerified: Scalars['Boolean']['output'];
  tempUpdatedEmail: Scalars['String']['output'];
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
  users: Array<User>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


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
  GetMediaByIdResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediaResponse );
  GetMediasResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediasResponse );
  GetPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PersonalizedWithRolePermissionResponse );
  GetPersonalizedPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PermissionsResponse );
  GetProfileResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetRoleByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRolesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RolesResponse );
  GetUserByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetUsersResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UsersResponse );
  UserLoginResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserLoginResponse );
  UserProfileUpdateResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserProfileUpdateResponse );
};


/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActiveAccountResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ActiveAccountResponseOrError']>;
  BaseResponse: ResolverTypeWrapper<BaseResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BaseResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BaseResponseOrError']>;
  CreatedBy: ResolverTypeWrapper<CreatedBy>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  EmailVerificationResponse: ResolverTypeWrapper<EmailVerificationResponse>;
  EmailVerificationResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EmailVerificationResponseOrError']>;
  ErrorResponse: ResolverTypeWrapper<ErrorResponse>;
  FieldError: ResolverTypeWrapper<FieldError>;
  Gender: Gender;
  GetMediaByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediaByIdResponseOrError']>;
  GetMediasResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediasResponseOrError']>;
  GetPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPermissionsResponseOrError']>;
  GetPersonalizedPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPersonalizedPermissionsResponseOrError']>;
  GetProfileResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProfileResponseOrError']>;
  GetRoleByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleByIDResponseOrError']>;
  GetRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleResponseOrError']>;
  GetRolesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRolesResponseOrError']>;
  GetUserByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserByIDResponseOrError']>;
  GetUsersResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUsersResponseOrError']>;
  Media: ResolverTypeWrapper<Media>;
  MediaCategory: MediaCategory;
  MediaMimeType: MediaMimeType;
  MediaResponse: ResolverTypeWrapper<MediaResponse>;
  MediasResponse: ResolverTypeWrapper<MediasResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  PermissionAgainstRoleInput: PermissionAgainstRoleInput;
  PermissionName: PermissionName;
  PermissionSession: ResolverTypeWrapper<PermissionSession>;
  Permissions: ResolverTypeWrapper<Permissions>;
  PermissionsResponse: ResolverTypeWrapper<PermissionsResponse>;
  PersonalizedWithRolePermissionResponse: ResolverTypeWrapper<PersonalizedWithRolePermissionResponse>;
  Query: ResolverTypeWrapper<{}>;
  Role: ResolverTypeWrapper<Role>;
  RolePermissionInput: RolePermissionInput;
  RolePermissionSession: ResolverTypeWrapper<RolePermissionSession>;
  RoleResponse: ResolverTypeWrapper<RoleResponse>;
  RoleSession: ResolverTypeWrapper<RoleSession>;
  RolesResponse: ResolverTypeWrapper<RolesResponse>;
  SinglePermissionInput: SinglePermissionInput;
  UpdateMediaInput: UpdateMediaInput;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  User: ResolverTypeWrapper<User>;
  UserLoginResponse: ResolverTypeWrapper<UserLoginResponse>;
  UserLoginResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserLoginResponseOrError']>;
  UserProfileUpdateResponse: ResolverTypeWrapper<UserProfileUpdateResponse>;
  UserProfileUpdateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserProfileUpdateResponseOrError']>;
  UserResponse: ResolverTypeWrapper<UserResponse>;
  UserSession: ResolverTypeWrapper<UserSession>;
  UserSessionByEmail: ResolverTypeWrapper<UserSessionByEmail>;
  UserSessionById: ResolverTypeWrapper<UserSessionById>;
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
  CreatedBy: CreatedBy;
  ID: Scalars['ID']['output'];
  EmailVerificationResponse: EmailVerificationResponse;
  EmailVerificationResponseOrError: ResolversUnionTypes<ResolversParentTypes>['EmailVerificationResponseOrError'];
  ErrorResponse: ErrorResponse;
  FieldError: FieldError;
  GetMediaByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediaByIdResponseOrError'];
  GetMediasResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediasResponseOrError'];
  GetPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPermissionsResponseOrError'];
  GetPersonalizedPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPersonalizedPermissionsResponseOrError'];
  GetProfileResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProfileResponseOrError'];
  GetRoleByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleByIDResponseOrError'];
  GetRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleResponseOrError'];
  GetRolesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRolesResponseOrError'];
  GetUserByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserByIDResponseOrError'];
  GetUsersResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUsersResponseOrError'];
  Media: Media;
  MediaResponse: MediaResponse;
  MediasResponse: MediasResponse;
  Mutation: {};
  PermissionAgainstRoleInput: PermissionAgainstRoleInput;
  PermissionSession: PermissionSession;
  Permissions: Permissions;
  PermissionsResponse: PermissionsResponse;
  PersonalizedWithRolePermissionResponse: PersonalizedWithRolePermissionResponse;
  Query: {};
  Role: Role;
  RolePermissionInput: RolePermissionInput;
  RolePermissionSession: RolePermissionSession;
  RoleResponse: RoleResponse;
  RoleSession: RoleSession;
  RolesResponse: RolesResponse;
  SinglePermissionInput: SinglePermissionInput;
  UpdateMediaInput: UpdateMediaInput;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  User: User;
  UserLoginResponse: UserLoginResponse;
  UserLoginResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserLoginResponseOrError'];
  UserProfileUpdateResponse: UserProfileUpdateResponse;
  UserProfileUpdateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserProfileUpdateResponseOrError'];
  UserResponse: UserResponse;
  UserSession: UserSession;
  UserSessionByEmail: UserSessionByEmail;
  UserSessionById: UserSessionById;
  UsersResponse: UsersResponse;
};

export type DeferDirectiveArgs = {
  if?: Scalars['Boolean']['input'];
  label?: Maybe<Scalars['String']['input']>;
};

export type DeferDirectiveResolver<Result, Parent, ContextType = Context, Args = DeferDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

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

export type CreatedByResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatedBy'] = ResolversParentTypes['CreatedBy']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
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

export type GetMediaByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetMediaByIdResponseOrError'] = ResolversParentTypes['GetMediaByIdResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'MediaResponse', ParentType, ContextType>;
};

export type GetMediasResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetMediasResponseOrError'] = ResolversParentTypes['GetMediasResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'MediasResponse', ParentType, ContextType>;
};

export type GetPermissionsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetPermissionsResponseOrError'] = ResolversParentTypes['GetPermissionsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'PersonalizedWithRolePermissionResponse', ParentType, ContextType>;
};

export type GetPersonalizedPermissionsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetPersonalizedPermissionsResponseOrError'] = ResolversParentTypes['GetPersonalizedPermissionsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'PermissionsResponse', ParentType, ContextType>;
};

export type GetProfileResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProfileResponseOrError'] = ResolversParentTypes['GetProfileResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserResponse', ParentType, ContextType>;
};

export type GetRoleByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRoleByIDResponseOrError'] = ResolversParentTypes['GetRoleByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type GetRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRoleResponseOrError'] = ResolversParentTypes['GetRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type GetRolesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetRolesResponseOrError'] = ResolversParentTypes['GetRolesResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RolesResponse', ParentType, ContextType>;
};

export type GetUserByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUserByIDResponseOrError'] = ResolversParentTypes['GetUserByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserResponse', ParentType, ContextType>;
};

export type GetUsersResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUsersResponseOrError'] = ResolversParentTypes['GetUsersResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UsersResponse', ParentType, ContextType>;
};

export type MediaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Media'] = ResolversParentTypes['Media']> = {
  altText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bucketName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dimension?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mediaType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MediaResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MediaResponse'] = ResolversParentTypes['MediaResponse']> = {
  media?: Resolver<ResolversTypes['Media'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MediasResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MediasResponse'] = ResolversParentTypes['MediasResponse']> = {
  medias?: Resolver<Array<ResolversTypes['Media']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  accountActivation?: Resolver<ResolversTypes['ActiveAccountResponseOrError'], ParentType, ContextType, RequireFields<MutationAccountActivationArgs, 'email' | 'userId'>>;
  changePassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'newPassword' | 'oldPassword'>>;
  createUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateUserRoleArgs, 'name'>>;
  deleteMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteMediaFilesArgs, 'ids' | 'skipTrash'>>;
  deleteUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteUserRoleArgs, 'ids' | 'skipTrash'>>;
  forgetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationForgetPasswordArgs, 'email'>>;
  login?: Resolver<ResolversTypes['UserLoginResponseOrError'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'password'>>;
  logout?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType>;
  register?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password'>>;
  resetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'newPassword' | 'token'>>;
  restoreMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreMediaFilesArgs, 'ids'>>;
  restoreUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreUserRoleArgs, 'ids'>>;
  updateMediaFileInfo?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateMediaFileInfoArgs, 'inputs'>>;
  updateProfile?: Resolver<ResolversTypes['UserProfileUpdateResponseOrError'], ParentType, ContextType, Partial<MutationUpdateProfileArgs>>;
  updateUserPermission?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserPermissionArgs, 'input'>>;
  updateUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'userId'>>;
  updateUserRoleInfo?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleInfoArgs, 'id'>>;
  uploadMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUploadMediaFilesArgs, 'inputs' | 'userId'>>;
  verifyEmail?: Resolver<ResolversTypes['EmailVerificationResponseOrError'], ParentType, ContextType, RequireFields<MutationVerifyEmailArgs, 'email' | 'userId'>>;
};

export type PermissionSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PermissionSession'] = ResolversParentTypes['PermissionSession']> = {
  canCreate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Permissions'] = ResolversParentTypes['Permissions']> = {
  canCreate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['PermissionName'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionsResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PermissionsResponse'] = ResolversParentTypes['PermissionsResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['Permissions']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonalizedWithRolePermissionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PersonalizedWithRolePermissionResponse'] = ResolversParentTypes['PersonalizedWithRolePermissionResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  personalizedPermissions?: Resolver<Array<ResolversTypes['Permissions']>, ParentType, ContextType>;
  rolePermissions?: Resolver<Maybe<Array<ResolversTypes['Role']>>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getAllMedias?: Resolver<ResolversTypes['GetMediasResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllMediasArgs, 'limit' | 'page'>>;
  getAllPermissionsByUserId?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllPermissionsByUserIdArgs, 'id'>>;
  getAllRoles?: Resolver<ResolversTypes['GetRolesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllRolesArgs, 'limit' | 'page'>>;
  getAllUsers?: Resolver<ResolversTypes['GetUsersResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllUsersArgs, 'limit' | 'page'>>;
  getMediaById?: Resolver<ResolversTypes['GetMediaByIdResponseOrError'], ParentType, ContextType, RequireFields<QueryGetMediaByIdArgs, 'id'>>;
  getOwnPersonalizedPermissions?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType>;
  getProfile?: Resolver<ResolversTypes['GetProfileResponseOrError'], ParentType, ContextType>;
  getRoleById?: Resolver<ResolversTypes['GetRoleByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetRoleByIdArgs, 'id'>>;
  getUserById?: Resolver<ResolversTypes['GetUserByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
};

export type RoleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  assignedUserCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  defaultPermissions?: Resolver<Maybe<Array<ResolversTypes['RolePermissionSession']>>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  systemDeleteProtection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  systemPermanentDeleteProtection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  systemPermanentUpdateProtection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  systemUpdateProtection?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RolePermissionSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RolePermissionSession'] = ResolversParentTypes['RolePermissionSession']> = {
  canCreate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canDelete?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RoleResponse'] = ResolversParentTypes['RoleResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RoleSession'] = ResolversParentTypes['RoleSession']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  defaultPermissions?: Resolver<Array<ResolversTypes['RolePermissionSession']>, ParentType, ContextType>;
  deletedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  systemDeleteProtection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  systemPermanentDeleteProtection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  systemPermanentUpdateProtection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  systemUpdateProtection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RolesResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RolesResponse'] = ResolversParentTypes['RolesResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  canUpdatePermissions?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canUpdateRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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
  roles?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserLoginResponse', ParentType, ContextType>;
};

export type UserProfileUpdateResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileUpdateResponse'] = ResolversParentTypes['UserProfileUpdateResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserProfileUpdateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserProfileUpdateResponseOrError'] = ResolversParentTypes['UserProfileUpdateResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserProfileUpdateResponse', ParentType, ContextType>;
};

export type UserResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserResponse'] = ResolversParentTypes['UserResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSession'] = ResolversParentTypes['UserSession']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionByEmailResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSessionByEmail'] = ResolversParentTypes['UserSessionByEmail']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canUpdatePermissions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdateRole?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['PermissionSession']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  tempEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tempUpdatedEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionByIdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSessionById'] = ResolversParentTypes['UserSessionById']> = {
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canUpdatePermissions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdateRole?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['PermissionSession']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  tempEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tempUpdatedEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UsersResponse'] = ResolversParentTypes['UsersResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  ActiveAccountResponseOrError?: ActiveAccountResponseOrErrorResolvers<ContextType>;
  BaseResponse?: BaseResponseResolvers<ContextType>;
  BaseResponseOrError?: BaseResponseOrErrorResolvers<ContextType>;
  CreatedBy?: CreatedByResolvers<ContextType>;
  EmailVerificationResponse?: EmailVerificationResponseResolvers<ContextType>;
  EmailVerificationResponseOrError?: EmailVerificationResponseOrErrorResolvers<ContextType>;
  ErrorResponse?: ErrorResponseResolvers<ContextType>;
  FieldError?: FieldErrorResolvers<ContextType>;
  GetMediaByIdResponseOrError?: GetMediaByIdResponseOrErrorResolvers<ContextType>;
  GetMediasResponseOrError?: GetMediasResponseOrErrorResolvers<ContextType>;
  GetPermissionsResponseOrError?: GetPermissionsResponseOrErrorResolvers<ContextType>;
  GetPersonalizedPermissionsResponseOrError?: GetPersonalizedPermissionsResponseOrErrorResolvers<ContextType>;
  GetProfileResponseOrError?: GetProfileResponseOrErrorResolvers<ContextType>;
  GetRoleByIDResponseOrError?: GetRoleByIdResponseOrErrorResolvers<ContextType>;
  GetRoleResponseOrError?: GetRoleResponseOrErrorResolvers<ContextType>;
  GetRolesResponseOrError?: GetRolesResponseOrErrorResolvers<ContextType>;
  GetUserByIDResponseOrError?: GetUserByIdResponseOrErrorResolvers<ContextType>;
  GetUsersResponseOrError?: GetUsersResponseOrErrorResolvers<ContextType>;
  Media?: MediaResolvers<ContextType>;
  MediaResponse?: MediaResponseResolvers<ContextType>;
  MediasResponse?: MediasResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PermissionSession?: PermissionSessionResolvers<ContextType>;
  Permissions?: PermissionsResolvers<ContextType>;
  PermissionsResponse?: PermissionsResponseResolvers<ContextType>;
  PersonalizedWithRolePermissionResponse?: PersonalizedWithRolePermissionResponseResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RolePermissionSession?: RolePermissionSessionResolvers<ContextType>;
  RoleResponse?: RoleResponseResolvers<ContextType>;
  RoleSession?: RoleSessionResolvers<ContextType>;
  RolesResponse?: RolesResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserLoginResponse?: UserLoginResponseResolvers<ContextType>;
  UserLoginResponseOrError?: UserLoginResponseOrErrorResolvers<ContextType>;
  UserProfileUpdateResponse?: UserProfileUpdateResponseResolvers<ContextType>;
  UserProfileUpdateResponseOrError?: UserProfileUpdateResponseOrErrorResolvers<ContextType>;
  UserResponse?: UserResponseResolvers<ContextType>;
  UserSession?: UserSessionResolvers<ContextType>;
  UserSessionByEmail?: UserSessionByEmailResolvers<ContextType>;
  UserSessionById?: UserSessionByIdResolvers<ContextType>;
  UsersResponse?: UsersResponseResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = Context> = {
  defer?: DeferDirectiveResolver<any, any, ContextType>;
};
