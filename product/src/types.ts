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

export type Brand = {
  __typename?: 'Brand';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type BrandPaginationDataSession = {
  __typename?: 'BrandPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  totalProducts?: Maybe<Scalars['Int']['output']>;
};

export type BrandPaginationResponse = {
  __typename?: 'BrandPaginationResponse';
  brands: Array<BrandPaginationDataSession>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type BrandResponse = {
  __typename?: 'BrandResponse';
  brand: Brand;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type BrandResponseById = {
  __typename?: 'BrandResponseById';
  brand: Brand;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type Category = {
  __typename?: 'Category';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subCategories: Array<SubCategory>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type CategoryDataResponse = {
  __typename?: 'CategoryDataResponse';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type CategoryPaginationResponse = {
  __typename?: 'CategoryPaginationResponse';
  category: Array<Category>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  category: CategoryDataResponse;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type CategoryResponseById = {
  __typename?: 'CategoryResponseById';
  category: Category;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export enum CategoryType {
  Category = 'category',
  SubCategory = 'subCategory'
}

export type CreateBrandResponseOrError = BaseResponse | BrandResponse | ErrorResponse;

export type CreateCategoryResponseOrError = BaseResponse | CategoryResponse | ErrorResponse | SubCategoryResponse;

export type CreateRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type CreateShippingClassResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type CreateTagResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type CreateTaxClassResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

export type CreatedBy = {
  __typename?: 'CreatedBy';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roles: Array<Scalars['String']['output']>;
};

export type DeleteBrandResponseOrError = BaseResponse | ErrorResponse;

export type DeleteCategoryResponseOrError = BaseResponse | ErrorResponse;

export type DeleteShippingClassResponseOrError = BaseResponse | ErrorResponse;

export type DeleteTagResponseOrError = BaseResponse | ErrorResponse;

export type DeleteTaxClassResponseOrError = BaseResponse | ErrorResponse;

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

export type GetBrandByIdResponseOrError = BaseResponse | BrandResponseById | ErrorResponse;

export type GetBrandsResponseOrError = BaseResponse | BrandPaginationResponse | ErrorResponse;

export type GetCategoriesResponseOrError = BaseResponse | CategoryPaginationResponse | ErrorResponse;

export type GetCategoryByIdResponseOrError = BaseResponse | CategoryResponseById | ErrorResponse;

export type GetMediaByIdResponseOrError = BaseResponse | ErrorResponse | MediaResponse;

export type GetMediasResponseOrError = BaseResponse | ErrorResponse | MediasResponse;

export type GetPermissionsResponseOrError = BaseResponse | ErrorResponse | PersonalizedWithRolePermissionResponse;

export type GetPersonalizedPermissionsResponseOrError = BaseResponse | ErrorResponse | PermissionsResponse;

export type GetProfileResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetRoleByIdResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRolesResponseOrError = BaseResponse | ErrorResponse | RolesResponse;

export type GetShippingClassByIdResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type GetShippingClassesResponseOrError = BaseResponse | ErrorResponse | ShippingClassPaginationResponse;

export type GetSubCategoryByIdResponseOrError = BaseResponse | ErrorResponse | SubCategoryResponseById;

export type GetTagByIdResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type GetTagsResponseOrError = BaseResponse | ErrorResponse | TagPaginationResponse;

export type GetTaxClassByIdResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

export type GetTaxClassesResponseOrError = BaseResponse | ErrorResponse | TaxClassPaginationResponse;

export type GetUserByIdResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetUserLoginInfoResponseOrError = BaseResponse | ErrorResponse | UserLoginInfoResponse;

export type GetUsersResponseOrError = BaseResponse | ErrorResponse | UsersResponse;

export type LoginMeta = {
  __typename?: 'LoginMeta';
  city?: Maybe<Scalars['String']['output']>;
  cityGeonameId?: Maybe<Scalars['Int']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  countryGeonameId?: Maybe<Scalars['Int']['output']>;
  countryIso?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  fingerprint: Scalars['String']['output'];
  fraud: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  ip?: Maybe<Scalars['String']['output']>;
  isp?: Maybe<Scalars['String']['output']>;
  ispId?: Maybe<Scalars['Int']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  session: Scalars['String']['output'];
  subdivisionGeonameId?: Maybe<Scalars['Int']['output']>;
  subdivisionIso?: Maybe<Scalars['String']['output']>;
  timeZone?: Maybe<Scalars['String']['output']>;
  tor: Scalars['Boolean']['output'];
};

export type LoginMetaInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  cityGeonameId?: InputMaybe<Scalars['Int']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  countryGeonameId?: InputMaybe<Scalars['Int']['input']>;
  countryIso?: InputMaybe<Scalars['String']['input']>;
  fingerprint: Scalars['String']['input'];
  fraud: Scalars['Float']['input'];
  ip?: InputMaybe<Scalars['String']['input']>;
  isp?: InputMaybe<Scalars['String']['input']>;
  ispId?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  session: Scalars['String']['input'];
  subdivisionGeonameId?: InputMaybe<Scalars['Int']['input']>;
  subdivisionIso?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
  tor: Scalars['Boolean']['input'];
};

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
  createBrand: CreateBrandResponseOrError;
  createCategory: CreateCategoryResponseOrError;
  createProduct?: Maybe<Scalars['String']['output']>;
  createShippingClass: CreateShippingClassResponseOrError;
  createTag: CreateTagResponseOrError;
  createTaxClass: CreateTaxClassResponseOrError;
  createUserRole: CreateRoleResponseOrError;
  deleteBrand: DeleteBrandResponseOrError;
  deleteCategory?: Maybe<DeleteCategoryResponseOrError>;
  deleteLoginSession: BaseResponseOrError;
  deleteMediaFiles: BaseResponseOrError;
  deleteShippingClass: DeleteShippingClassResponseOrError;
  deleteTag: DeleteTagResponseOrError;
  deleteTaxClass: DeleteTaxClassResponseOrError;
  deleteUserRole: BaseResponseOrError;
  forgetPassword: BaseResponseOrError;
  login: UserLoginResponseOrError;
  logout: BaseResponseOrError;
  register: BaseResponseOrError;
  resetPassword: BaseResponseOrError;
  restoreBrands: RestoreBrandResponseOrError;
  restoreCategory?: Maybe<RestoreCategoryResponseOrError>;
  restoreMediaFiles: BaseResponseOrError;
  restoreShippingClasses: RestoreShippingClassResponseOrError;
  restoreTags: RestoreTagResponseOrError;
  restoreTaxClasses: RestoreTaxClassResponseOrError;
  restoreUserRole: BaseResponseOrError;
  updateBrand: UpdateBrandResponseOrError;
  updateCategory: UpdateCategoryResponseOrError;
  updateCategoryPosition: UpdateCategoryPositionResponseOrError;
  updateMediaFileInfo: UpdateMediaResponseOrError;
  updateProfile: UserProfileUpdateResponseOrError;
  updateShippingClass: UpdateShippingClassResponseOrError;
  updateTag: UpdateTagResponseOrError;
  updateTaxClass: UpdateTaxClassResponseOrError;
  updateUserPermission: BaseResponseOrError;
  updateUserRole: BaseResponseOrError;
  updateUserRoleInfo: UpdateRoleResponseOrError;
  uploadMediaFiles: UploadMediaResponseOrError;
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


export type MutationCreateBrandArgs = {
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateCategoryArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentSubCategoryId?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateShippingClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};


export type MutationCreateTagArgs = {
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationCreateTaxClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
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


export type MutationDeleteBrandArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteCategoryArgs = {
  categoryType: CategoryType;
  id: Scalars['ID']['input'];
  skipTrash?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteLoginSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationDeleteMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteShippingClassArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteTagArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteTaxClassArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
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
  meta: LoginMetaInput;
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


export type MutationRestoreBrandsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreCategoryArgs = {
  categoryType: CategoryType;
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreShippingClassesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreTagsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreTaxClassesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationUpdateBrandArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCategoryArgs = {
  categoryType: CategoryType;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCategoryPositionArgs = {
  categoryType: CategoryType;
  id: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
};


export type MutationUpdateMediaFileInfoArgs = {
  inputs: UpdateMediaInput;
};


export type MutationUpdateProfileArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['String']['input'];
};


export type MutationUpdateShippingClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTagArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTaxClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
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
  sessionId: Scalars['String']['input'];
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
  Tag = 'TAG',
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

export type Product = {
  __typename?: 'Product';
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  getAllBrands: GetBrandsResponseOrError;
  getAllCategories: GetCategoriesResponseOrError;
  getAllMedias: GetMediasResponseOrError;
  getAllPermissionsByUserId: GetPermissionsResponseOrError;
  getAllRoles: GetRolesResponseOrError;
  getAllShippingClass: GetShippingClassesResponseOrError;
  getAllTags: GetTagsResponseOrError;
  getAllTaxClass: GetTaxClassesResponseOrError;
  getAllUsers: GetUsersResponseOrError;
  getBrandById: GetBrandByIdResponseOrError;
  getCategoryById: GetCategoryByIdResponseOrError;
  getMediaById: GetMediaByIdResponseOrError;
  getOwnPersonalizedPermissions: GetPermissionsResponseOrError;
  getProduct?: Maybe<Scalars['String']['output']>;
  getProfile: GetProfileResponseOrError;
  getRoleById: GetRoleByIdResponseOrError;
  getShippingClassById: GetShippingClassByIdResponseOrError;
  getSubCategoryById: GetSubCategoryByIdResponseOrError;
  getTagById: GetTagByIdResponseOrError;
  getTaxClassById: GetTaxClassByIdResponseOrError;
  getUserById: GetUserByIdResponseOrError;
  getUserOwnLoginInfo: GetUserLoginInfoResponseOrError;
};


export type QueryGetAllBrandsArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllCategoriesArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
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


export type QueryGetAllShippingClassArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllTagsArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllTaxClassArgs = {
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


export type QueryGetBrandByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetCategoryByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetMediaByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetRoleByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetShippingClassByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetSubCategoryByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTagByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTaxClassByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String']['input'];
};

export type RestoreBrandResponseOrError = BaseResponse | ErrorResponse;

export type RestoreCategoryResponseOrError = BaseResponse | ErrorResponse;

export type RestoreShippingClassResponseOrError = BaseResponse | ErrorResponse;

export type RestoreTagResponseOrError = BaseResponse | ErrorResponse;

export type RestoreTaxClassResponseOrError = BaseResponse | ErrorResponse;

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

export type ShippingClass = {
  __typename?: 'ShippingClass';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type ShippingClassPaginationDataSession = {
  __typename?: 'ShippingClassPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  totalProducts?: Maybe<Scalars['Int']['output']>;
  value: Scalars['String']['output'];
};

export type ShippingClassPaginationResponse = {
  __typename?: 'ShippingClassPaginationResponse';
  message: Scalars['String']['output'];
  shippingClasses: Array<ShippingClassPaginationDataSession>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ShippingClassResponse = {
  __typename?: 'ShippingClassResponse';
  message: Scalars['String']['output'];
  shippingClass: ShippingClass;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type SinglePermissionInput = {
  canCreate?: InputMaybe<Scalars['Boolean']['input']>;
  canDelete?: InputMaybe<Scalars['Boolean']['input']>;
  canRead?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdate?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: PermissionName;
};

export type SubCategory = {
  __typename?: 'SubCategory';
  category: Category;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentSubCategory?: Maybe<SubCategoryDataResponse>;
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subCategories?: Maybe<Array<SubCategoryDataResponse>>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type SubCategoryDataResponse = {
  __typename?: 'SubCategoryDataResponse';
  category?: Maybe<Scalars['ID']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentSubCategory?: Maybe<Scalars['ID']['output']>;
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subCategories?: Maybe<Array<SubCategoryDataResponse>>;
  thumbnail?: Maybe<Scalars['String']['output']>;
};

export type SubCategoryResponse = {
  __typename?: 'SubCategoryResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  subcategory: SubCategoryDataResponse;
  success: Scalars['Boolean']['output'];
};

export type SubCategoryResponseById = {
  __typename?: 'SubCategoryResponseById';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  subcategory: SubCategoryDataResponse;
  success: Scalars['Boolean']['output'];
};

export type Tag = {
  __typename?: 'Tag';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type TagPaginationDataSession = {
  __typename?: 'TagPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  totalProducts?: Maybe<Scalars['Int']['output']>;
};

export type TagPaginationResponse = {
  __typename?: 'TagPaginationResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  tags: Array<TagPaginationDataSession>;
  total: Scalars['Int']['output'];
};

export type TagResponse = {
  __typename?: 'TagResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  tag: Tag;
};

export type TaxClass = {
  __typename?: 'TaxClass';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type TaxClassPaginationDataSession = {
  __typename?: 'TaxClassPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreatedBy>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  totalProducts?: Maybe<Scalars['Int']['output']>;
  value: Scalars['String']['output'];
};

export type TaxClassPaginationResponse = {
  __typename?: 'TaxClassPaginationResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  taxClasses: Array<TaxClassPaginationDataSession>;
  total: Scalars['Int']['output'];
};

export type TaxClassResponse = {
  __typename?: 'TaxClassResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  taxClass: TaxClass;
};

export type UpdateBrandResponseOrError = BaseResponse | BrandResponse | ErrorResponse;

export type UpdateCategoryPositionResponseOrError = BaseResponse | CategoryResponse | ErrorResponse | SubCategoryResponse;

export type UpdateCategoryResponseOrError = BaseResponse | CategoryResponse | ErrorResponse | SubCategoryResponse;

export type UpdateMediaInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  category: MediaCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  dimension?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  length?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMediaResponseOrError = BaseResponse | ErrorResponse | MediaResponse;

export type UpdateRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type UpdateShippingClassResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type UpdateTagResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type UpdateTaxClassResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

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

export type UploadMediaResponse = {
  __typename?: 'UploadMediaResponse';
  medias: Array<Maybe<Media>>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type UploadMediaResponseOrError = BaseResponse | ErrorResponse | UploadMediaResponse;

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

export type UserLoginInfoResponse = {
  __typename?: 'UserLoginInfoResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  userLoginInfo: Array<LoginMeta>;
};

export type UserLoginResponse = {
  __typename?: 'UserLoginResponse';
  message: Scalars['String']['output'];
  sessionId: Scalars['String']['output'];
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
  sessionId: Scalars['String']['output'];
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
  CreateBrandResponseOrError: ( BaseResponse ) | ( BrandResponse ) | ( ErrorResponse );
  CreateCategoryResponseOrError: ( BaseResponse ) | ( CategoryResponse ) | ( ErrorResponse ) | ( SubCategoryResponse );
  CreateRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  CreateShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  CreateTagResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  CreateTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  DeleteBrandResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteCategoryResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteTagResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  EmailVerificationResponseOrError: ( EmailVerificationResponse ) | ( ErrorResponse );
  GetBrandByIDResponseOrError: ( BaseResponse ) | ( BrandResponseById ) | ( ErrorResponse );
  GetBrandsResponseOrError: ( BaseResponse ) | ( BrandPaginationResponse ) | ( ErrorResponse );
  GetCategoriesResponseOrError: ( BaseResponse ) | ( CategoryPaginationResponse ) | ( ErrorResponse );
  GetCategoryByIDResponseOrError: ( BaseResponse ) | ( CategoryResponseById ) | ( ErrorResponse );
  GetMediaByIdResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediaResponse );
  GetMediasResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediasResponse );
  GetPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PersonalizedWithRolePermissionResponse );
  GetPersonalizedPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PermissionsResponse );
  GetProfileResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetRoleByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRolesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RolesResponse );
  GetShippingClassByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  GetShippingClassesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassPaginationResponse );
  GetSubCategoryByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( SubCategoryResponseById );
  GetTagByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  GetTagsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagPaginationResponse );
  GetTaxClassByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  GetTaxClassesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassPaginationResponse );
  GetUserByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetUserLoginInfoResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserLoginInfoResponse );
  GetUsersResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UsersResponse );
  RestoreBrandResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreCategoryResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreTagResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  UpdateBrandResponseOrError: ( BaseResponse ) | ( BrandResponse ) | ( ErrorResponse );
  UpdateCategoryPositionResponseOrError: ( BaseResponse ) | ( CategoryResponse ) | ( ErrorResponse ) | ( SubCategoryResponse );
  UpdateCategoryResponseOrError: ( BaseResponse ) | ( CategoryResponse ) | ( ErrorResponse ) | ( SubCategoryResponse );
  UpdateMediaResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediaResponse );
  UpdateRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  UpdateShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  UpdateTagResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  UpdateTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  UploadMediaResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UploadMediaResponse );
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
  Brand: ResolverTypeWrapper<Brand>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  BrandPaginationDataSession: ResolverTypeWrapper<BrandPaginationDataSession>;
  BrandPaginationResponse: ResolverTypeWrapper<BrandPaginationResponse>;
  BrandResponse: ResolverTypeWrapper<BrandResponse>;
  BrandResponseById: ResolverTypeWrapper<BrandResponseById>;
  Category: ResolverTypeWrapper<Category>;
  CategoryDataResponse: ResolverTypeWrapper<CategoryDataResponse>;
  CategoryPaginationResponse: ResolverTypeWrapper<CategoryPaginationResponse>;
  CategoryResponse: ResolverTypeWrapper<CategoryResponse>;
  CategoryResponseById: ResolverTypeWrapper<CategoryResponseById>;
  CategoryType: CategoryType;
  CreateBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateBrandResponseOrError']>;
  CreateCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateCategoryResponseOrError']>;
  CreateRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateRoleResponseOrError']>;
  CreateShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateShippingClassResponseOrError']>;
  CreateTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTagResponseOrError']>;
  CreateTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTaxClassResponseOrError']>;
  CreatedBy: ResolverTypeWrapper<CreatedBy>;
  DeleteBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteBrandResponseOrError']>;
  DeleteCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteCategoryResponseOrError']>;
  DeleteShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteShippingClassResponseOrError']>;
  DeleteTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTagResponseOrError']>;
  DeleteTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTaxClassResponseOrError']>;
  EmailVerificationResponse: ResolverTypeWrapper<EmailVerificationResponse>;
  EmailVerificationResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EmailVerificationResponseOrError']>;
  ErrorResponse: ResolverTypeWrapper<ErrorResponse>;
  FieldError: ResolverTypeWrapper<FieldError>;
  Gender: Gender;
  GetBrandByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetBrandByIDResponseOrError']>;
  GetBrandsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetBrandsResponseOrError']>;
  GetCategoriesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetCategoriesResponseOrError']>;
  GetCategoryByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetCategoryByIDResponseOrError']>;
  GetMediaByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediaByIdResponseOrError']>;
  GetMediasResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediasResponseOrError']>;
  GetPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPermissionsResponseOrError']>;
  GetPersonalizedPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPersonalizedPermissionsResponseOrError']>;
  GetProfileResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProfileResponseOrError']>;
  GetRoleByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleByIDResponseOrError']>;
  GetRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleResponseOrError']>;
  GetRolesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRolesResponseOrError']>;
  GetShippingClassByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingClassByIDResponseOrError']>;
  GetShippingClassesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingClassesResponseOrError']>;
  GetSubCategoryByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetSubCategoryByIDResponseOrError']>;
  GetTagByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTagByIDResponseOrError']>;
  GetTagsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTagsResponseOrError']>;
  GetTaxClassByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxClassByIDResponseOrError']>;
  GetTaxClassesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxClassesResponseOrError']>;
  GetUserByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserByIDResponseOrError']>;
  GetUserLoginInfoResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserLoginInfoResponseOrError']>;
  GetUsersResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUsersResponseOrError']>;
  LoginMeta: ResolverTypeWrapper<LoginMeta>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  LoginMetaInput: LoginMetaInput;
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
  Product: ResolverTypeWrapper<Product>;
  Query: ResolverTypeWrapper<{}>;
  RestoreBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreBrandResponseOrError']>;
  RestoreCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreCategoryResponseOrError']>;
  RestoreShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreShippingClassResponseOrError']>;
  RestoreTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreTagResponseOrError']>;
  RestoreTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreTaxClassResponseOrError']>;
  Role: ResolverTypeWrapper<Role>;
  RolePermissionInput: RolePermissionInput;
  RolePermissionSession: ResolverTypeWrapper<RolePermissionSession>;
  RoleResponse: ResolverTypeWrapper<RoleResponse>;
  RoleSession: ResolverTypeWrapper<RoleSession>;
  RolesResponse: ResolverTypeWrapper<RolesResponse>;
  ShippingClass: ResolverTypeWrapper<ShippingClass>;
  ShippingClassPaginationDataSession: ResolverTypeWrapper<ShippingClassPaginationDataSession>;
  ShippingClassPaginationResponse: ResolverTypeWrapper<ShippingClassPaginationResponse>;
  ShippingClassResponse: ResolverTypeWrapper<ShippingClassResponse>;
  SinglePermissionInput: SinglePermissionInput;
  SubCategory: ResolverTypeWrapper<SubCategory>;
  SubCategoryDataResponse: ResolverTypeWrapper<SubCategoryDataResponse>;
  SubCategoryResponse: ResolverTypeWrapper<SubCategoryResponse>;
  SubCategoryResponseById: ResolverTypeWrapper<SubCategoryResponseById>;
  Tag: ResolverTypeWrapper<Tag>;
  TagPaginationDataSession: ResolverTypeWrapper<TagPaginationDataSession>;
  TagPaginationResponse: ResolverTypeWrapper<TagPaginationResponse>;
  TagResponse: ResolverTypeWrapper<TagResponse>;
  TaxClass: ResolverTypeWrapper<TaxClass>;
  TaxClassPaginationDataSession: ResolverTypeWrapper<TaxClassPaginationDataSession>;
  TaxClassPaginationResponse: ResolverTypeWrapper<TaxClassPaginationResponse>;
  TaxClassResponse: ResolverTypeWrapper<TaxClassResponse>;
  UpdateBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateBrandResponseOrError']>;
  UpdateCategoryPositionResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateCategoryPositionResponseOrError']>;
  UpdateCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateCategoryResponseOrError']>;
  UpdateMediaInput: UpdateMediaInput;
  UpdateMediaResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateMediaResponseOrError']>;
  UpdateRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateRoleResponseOrError']>;
  UpdateShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateShippingClassResponseOrError']>;
  UpdateTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTagResponseOrError']>;
  UpdateTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTaxClassResponseOrError']>;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  UploadMediaResponse: ResolverTypeWrapper<UploadMediaResponse>;
  UploadMediaResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UploadMediaResponseOrError']>;
  User: ResolverTypeWrapper<User>;
  UserLoginInfoResponse: ResolverTypeWrapper<UserLoginInfoResponse>;
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
  Brand: Brand;
  ID: Scalars['ID']['output'];
  BrandPaginationDataSession: BrandPaginationDataSession;
  BrandPaginationResponse: BrandPaginationResponse;
  BrandResponse: BrandResponse;
  BrandResponseById: BrandResponseById;
  Category: Category;
  CategoryDataResponse: CategoryDataResponse;
  CategoryPaginationResponse: CategoryPaginationResponse;
  CategoryResponse: CategoryResponse;
  CategoryResponseById: CategoryResponseById;
  CreateBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateBrandResponseOrError'];
  CreateCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateCategoryResponseOrError'];
  CreateRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateRoleResponseOrError'];
  CreateShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateShippingClassResponseOrError'];
  CreateTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTagResponseOrError'];
  CreateTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTaxClassResponseOrError'];
  CreatedBy: CreatedBy;
  DeleteBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteBrandResponseOrError'];
  DeleteCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteCategoryResponseOrError'];
  DeleteShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteShippingClassResponseOrError'];
  DeleteTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTagResponseOrError'];
  DeleteTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTaxClassResponseOrError'];
  EmailVerificationResponse: EmailVerificationResponse;
  EmailVerificationResponseOrError: ResolversUnionTypes<ResolversParentTypes>['EmailVerificationResponseOrError'];
  ErrorResponse: ErrorResponse;
  FieldError: FieldError;
  GetBrandByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetBrandByIDResponseOrError'];
  GetBrandsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetBrandsResponseOrError'];
  GetCategoriesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetCategoriesResponseOrError'];
  GetCategoryByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetCategoryByIDResponseOrError'];
  GetMediaByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediaByIdResponseOrError'];
  GetMediasResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediasResponseOrError'];
  GetPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPermissionsResponseOrError'];
  GetPersonalizedPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPersonalizedPermissionsResponseOrError'];
  GetProfileResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProfileResponseOrError'];
  GetRoleByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleByIDResponseOrError'];
  GetRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleResponseOrError'];
  GetRolesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRolesResponseOrError'];
  GetShippingClassByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingClassByIDResponseOrError'];
  GetShippingClassesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingClassesResponseOrError'];
  GetSubCategoryByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetSubCategoryByIDResponseOrError'];
  GetTagByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTagByIDResponseOrError'];
  GetTagsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTagsResponseOrError'];
  GetTaxClassByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxClassByIDResponseOrError'];
  GetTaxClassesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxClassesResponseOrError'];
  GetUserByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserByIDResponseOrError'];
  GetUserLoginInfoResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserLoginInfoResponseOrError'];
  GetUsersResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUsersResponseOrError'];
  LoginMeta: LoginMeta;
  Float: Scalars['Float']['output'];
  LoginMetaInput: LoginMetaInput;
  Media: Media;
  MediaResponse: MediaResponse;
  MediasResponse: MediasResponse;
  Mutation: {};
  PermissionAgainstRoleInput: PermissionAgainstRoleInput;
  PermissionSession: PermissionSession;
  Permissions: Permissions;
  PermissionsResponse: PermissionsResponse;
  PersonalizedWithRolePermissionResponse: PersonalizedWithRolePermissionResponse;
  Product: Product;
  Query: {};
  RestoreBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreBrandResponseOrError'];
  RestoreCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreCategoryResponseOrError'];
  RestoreShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreShippingClassResponseOrError'];
  RestoreTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreTagResponseOrError'];
  RestoreTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreTaxClassResponseOrError'];
  Role: Role;
  RolePermissionInput: RolePermissionInput;
  RolePermissionSession: RolePermissionSession;
  RoleResponse: RoleResponse;
  RoleSession: RoleSession;
  RolesResponse: RolesResponse;
  ShippingClass: ShippingClass;
  ShippingClassPaginationDataSession: ShippingClassPaginationDataSession;
  ShippingClassPaginationResponse: ShippingClassPaginationResponse;
  ShippingClassResponse: ShippingClassResponse;
  SinglePermissionInput: SinglePermissionInput;
  SubCategory: SubCategory;
  SubCategoryDataResponse: SubCategoryDataResponse;
  SubCategoryResponse: SubCategoryResponse;
  SubCategoryResponseById: SubCategoryResponseById;
  Tag: Tag;
  TagPaginationDataSession: TagPaginationDataSession;
  TagPaginationResponse: TagPaginationResponse;
  TagResponse: TagResponse;
  TaxClass: TaxClass;
  TaxClassPaginationDataSession: TaxClassPaginationDataSession;
  TaxClassPaginationResponse: TaxClassPaginationResponse;
  TaxClassResponse: TaxClassResponse;
  UpdateBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateBrandResponseOrError'];
  UpdateCategoryPositionResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateCategoryPositionResponseOrError'];
  UpdateCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateCategoryResponseOrError'];
  UpdateMediaInput: UpdateMediaInput;
  UpdateMediaResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateMediaResponseOrError'];
  UpdateRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateRoleResponseOrError'];
  UpdateShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateShippingClassResponseOrError'];
  UpdateTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTagResponseOrError'];
  UpdateTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTaxClassResponseOrError'];
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  UploadMediaResponse: UploadMediaResponse;
  UploadMediaResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UploadMediaResponseOrError'];
  User: User;
  UserLoginInfoResponse: UserLoginInfoResponse;
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

export type BrandResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Brand'] = ResolversParentTypes['Brand']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BrandPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BrandPaginationDataSession'] = ResolversParentTypes['BrandPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalProducts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BrandPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BrandPaginationResponse'] = ResolversParentTypes['BrandPaginationResponse']> = {
  brands?: Resolver<Array<ResolversTypes['BrandPaginationDataSession']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BrandResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BrandResponse'] = ResolversParentTypes['BrandResponse']> = {
  brand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BrandResponseByIdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BrandResponseById'] = ResolversParentTypes['BrandResponseById']> = {
  brand?: Resolver<ResolversTypes['Brand'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subCategories?: Resolver<Array<ResolversTypes['SubCategory']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryDataResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryDataResponse'] = ResolversParentTypes['CategoryDataResponse']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryPaginationResponse'] = ResolversParentTypes['CategoryPaginationResponse']> = {
  category?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryResponse'] = ResolversParentTypes['CategoryResponse']> = {
  category?: Resolver<ResolversTypes['CategoryDataResponse'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResponseByIdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryResponseById'] = ResolversParentTypes['CategoryResponseById']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateBrandResponseOrError'] = ResolversParentTypes['CreateBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CreateCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateCategoryResponseOrError'] = ResolversParentTypes['CreateCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponse' | 'ErrorResponse' | 'SubCategoryResponse', ParentType, ContextType>;
};

export type CreateRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateRoleResponseOrError'] = ResolversParentTypes['CreateRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type CreateShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateShippingClassResponseOrError'] = ResolversParentTypes['CreateShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassResponse', ParentType, ContextType>;
};

export type CreateTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTagResponseOrError'] = ResolversParentTypes['CreateTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagResponse', ParentType, ContextType>;
};

export type CreateTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTaxClassResponseOrError'] = ResolversParentTypes['CreateTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassResponse', ParentType, ContextType>;
};

export type CreatedByResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatedBy'] = ResolversParentTypes['CreatedBy']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteBrandResponseOrError'] = ResolversParentTypes['DeleteBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteCategoryResponseOrError'] = ResolversParentTypes['DeleteCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteShippingClassResponseOrError'] = ResolversParentTypes['DeleteShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTagResponseOrError'] = ResolversParentTypes['DeleteTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTaxClassResponseOrError'] = ResolversParentTypes['DeleteTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
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

export type GetBrandByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetBrandByIDResponseOrError'] = ResolversParentTypes['GetBrandByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandResponseById' | 'ErrorResponse', ParentType, ContextType>;
};

export type GetBrandsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetBrandsResponseOrError'] = ResolversParentTypes['GetBrandsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandPaginationResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type GetCategoriesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetCategoriesResponseOrError'] = ResolversParentTypes['GetCategoriesResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryPaginationResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type GetCategoryByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetCategoryByIDResponseOrError'] = ResolversParentTypes['GetCategoryByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponseById' | 'ErrorResponse', ParentType, ContextType>;
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

export type GetShippingClassByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetShippingClassByIDResponseOrError'] = ResolversParentTypes['GetShippingClassByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassResponse', ParentType, ContextType>;
};

export type GetShippingClassesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetShippingClassesResponseOrError'] = ResolversParentTypes['GetShippingClassesResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassPaginationResponse', ParentType, ContextType>;
};

export type GetSubCategoryByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetSubCategoryByIDResponseOrError'] = ResolversParentTypes['GetSubCategoryByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'SubCategoryResponseById', ParentType, ContextType>;
};

export type GetTagByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTagByIDResponseOrError'] = ResolversParentTypes['GetTagByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagResponse', ParentType, ContextType>;
};

export type GetTagsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTagsResponseOrError'] = ResolversParentTypes['GetTagsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagPaginationResponse', ParentType, ContextType>;
};

export type GetTaxClassByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTaxClassByIDResponseOrError'] = ResolversParentTypes['GetTaxClassByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassResponse', ParentType, ContextType>;
};

export type GetTaxClassesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTaxClassesResponseOrError'] = ResolversParentTypes['GetTaxClassesResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassPaginationResponse', ParentType, ContextType>;
};

export type GetUserByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUserByIDResponseOrError'] = ResolversParentTypes['GetUserByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserResponse', ParentType, ContextType>;
};

export type GetUserLoginInfoResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUserLoginInfoResponseOrError'] = ResolversParentTypes['GetUserLoginInfoResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UserLoginInfoResponse', ParentType, ContextType>;
};

export type GetUsersResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetUsersResponseOrError'] = ResolversParentTypes['GetUsersResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UsersResponse', ParentType, ContextType>;
};

export type LoginMetaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LoginMeta'] = ResolversParentTypes['LoginMeta']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityGeonameId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  countryGeonameId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  countryIso?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fingerprint?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fraud?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  ip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ispId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  session?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subdivisionGeonameId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  subdivisionIso?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeZone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tor?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  createBrand?: Resolver<ResolversTypes['CreateBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateBrandArgs, 'name' | 'slug'>>;
  createCategory?: Resolver<ResolversTypes['CreateCategoryResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateCategoryArgs, 'name' | 'slug'>>;
  createProduct?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createShippingClass?: Resolver<ResolversTypes['CreateShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateShippingClassArgs, 'value'>>;
  createTag?: Resolver<ResolversTypes['CreateTagResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTagArgs, 'name' | 'slug'>>;
  createTaxClass?: Resolver<ResolversTypes['CreateTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTaxClassArgs, 'value'>>;
  createUserRole?: Resolver<ResolversTypes['CreateRoleResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateUserRoleArgs, 'name'>>;
  deleteBrand?: Resolver<ResolversTypes['DeleteBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteBrandArgs, 'ids' | 'skipTrash'>>;
  deleteCategory?: Resolver<Maybe<ResolversTypes['DeleteCategoryResponseOrError']>, ParentType, ContextType, RequireFields<MutationDeleteCategoryArgs, 'categoryType' | 'id'>>;
  deleteLoginSession?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteLoginSessionArgs, 'sessionId'>>;
  deleteMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteMediaFilesArgs, 'ids' | 'skipTrash'>>;
  deleteShippingClass?: Resolver<ResolversTypes['DeleteShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteShippingClassArgs, 'ids' | 'skipTrash'>>;
  deleteTag?: Resolver<ResolversTypes['DeleteTagResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteTagArgs, 'ids' | 'skipTrash'>>;
  deleteTaxClass?: Resolver<ResolversTypes['DeleteTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteTaxClassArgs, 'ids' | 'skipTrash'>>;
  deleteUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteUserRoleArgs, 'ids' | 'skipTrash'>>;
  forgetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationForgetPasswordArgs, 'email'>>;
  login?: Resolver<ResolversTypes['UserLoginResponseOrError'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'meta' | 'password'>>;
  logout?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType>;
  register?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password'>>;
  resetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'newPassword' | 'token'>>;
  restoreBrands?: Resolver<ResolversTypes['RestoreBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreBrandsArgs, 'ids'>>;
  restoreCategory?: Resolver<Maybe<ResolversTypes['RestoreCategoryResponseOrError']>, ParentType, ContextType, RequireFields<MutationRestoreCategoryArgs, 'categoryType' | 'ids'>>;
  restoreMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreMediaFilesArgs, 'ids'>>;
  restoreShippingClasses?: Resolver<ResolversTypes['RestoreShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreShippingClassesArgs, 'ids'>>;
  restoreTags?: Resolver<ResolversTypes['RestoreTagResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreTagsArgs, 'ids'>>;
  restoreTaxClasses?: Resolver<ResolversTypes['RestoreTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreTaxClassesArgs, 'ids'>>;
  restoreUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreUserRoleArgs, 'ids'>>;
  updateBrand?: Resolver<ResolversTypes['UpdateBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateBrandArgs, 'id'>>;
  updateCategory?: Resolver<ResolversTypes['UpdateCategoryResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateCategoryArgs, 'categoryType' | 'id'>>;
  updateCategoryPosition?: Resolver<ResolversTypes['UpdateCategoryPositionResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateCategoryPositionArgs, 'categoryType' | 'id' | 'position'>>;
  updateMediaFileInfo?: Resolver<ResolversTypes['UpdateMediaResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateMediaFileInfoArgs, 'inputs'>>;
  updateProfile?: Resolver<ResolversTypes['UserProfileUpdateResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'sessionId'>>;
  updateShippingClass?: Resolver<ResolversTypes['UpdateShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateShippingClassArgs, 'id'>>;
  updateTag?: Resolver<ResolversTypes['UpdateTagResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'id'>>;
  updateTaxClass?: Resolver<ResolversTypes['UpdateTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTaxClassArgs, 'id'>>;
  updateUserPermission?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserPermissionArgs, 'input'>>;
  updateUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'userId'>>;
  updateUserRoleInfo?: Resolver<ResolversTypes['UpdateRoleResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleInfoArgs, 'id'>>;
  uploadMediaFiles?: Resolver<ResolversTypes['UploadMediaResponseOrError'], ParentType, ContextType, RequireFields<MutationUploadMediaFilesArgs, 'inputs' | 'userId'>>;
  verifyEmail?: Resolver<ResolversTypes['EmailVerificationResponseOrError'], ParentType, ContextType, RequireFields<MutationVerifyEmailArgs, 'email' | 'sessionId' | 'userId'>>;
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

export type ProductResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getAllBrands?: Resolver<ResolversTypes['GetBrandsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllBrandsArgs, 'limit' | 'page'>>;
  getAllCategories?: Resolver<ResolversTypes['GetCategoriesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllCategoriesArgs, 'limit' | 'page'>>;
  getAllMedias?: Resolver<ResolversTypes['GetMediasResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllMediasArgs, 'limit' | 'page'>>;
  getAllPermissionsByUserId?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllPermissionsByUserIdArgs, 'id'>>;
  getAllRoles?: Resolver<ResolversTypes['GetRolesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllRolesArgs, 'limit' | 'page'>>;
  getAllShippingClass?: Resolver<ResolversTypes['GetShippingClassesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllShippingClassArgs, 'limit' | 'page'>>;
  getAllTags?: Resolver<ResolversTypes['GetTagsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllTagsArgs, 'limit' | 'page'>>;
  getAllTaxClass?: Resolver<ResolversTypes['GetTaxClassesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllTaxClassArgs, 'limit' | 'page'>>;
  getAllUsers?: Resolver<ResolversTypes['GetUsersResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllUsersArgs, 'limit' | 'page'>>;
  getBrandById?: Resolver<ResolversTypes['GetBrandByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetBrandByIdArgs, 'id'>>;
  getCategoryById?: Resolver<ResolversTypes['GetCategoryByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetCategoryByIdArgs, 'id'>>;
  getMediaById?: Resolver<ResolversTypes['GetMediaByIdResponseOrError'], ParentType, ContextType, RequireFields<QueryGetMediaByIdArgs, 'id'>>;
  getOwnPersonalizedPermissions?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType>;
  getProduct?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  getProfile?: Resolver<ResolversTypes['GetProfileResponseOrError'], ParentType, ContextType>;
  getRoleById?: Resolver<ResolversTypes['GetRoleByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetRoleByIdArgs, 'id'>>;
  getShippingClassById?: Resolver<ResolversTypes['GetShippingClassByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetShippingClassByIdArgs, 'id'>>;
  getSubCategoryById?: Resolver<ResolversTypes['GetSubCategoryByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetSubCategoryByIdArgs, 'id'>>;
  getTagById?: Resolver<ResolversTypes['GetTagByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTagByIdArgs, 'id'>>;
  getTaxClassById?: Resolver<ResolversTypes['GetTaxClassByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTaxClassByIdArgs, 'id'>>;
  getUserById?: Resolver<ResolversTypes['GetUserByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
  getUserOwnLoginInfo?: Resolver<ResolversTypes['GetUserLoginInfoResponseOrError'], ParentType, ContextType>;
};

export type RestoreBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreBrandResponseOrError'] = ResolversParentTypes['RestoreBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreCategoryResponseOrError'] = ResolversParentTypes['RestoreCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreShippingClassResponseOrError'] = ResolversParentTypes['RestoreShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreTagResponseOrError'] = ResolversParentTypes['RestoreTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreTaxClassResponseOrError'] = ResolversParentTypes['RestoreTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
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

export type ShippingClassResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingClass'] = ResolversParentTypes['ShippingClass']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingClassPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingClassPaginationDataSession'] = ResolversParentTypes['ShippingClassPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalProducts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingClassPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingClassPaginationResponse'] = ResolversParentTypes['ShippingClassPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shippingClasses?: Resolver<Array<ResolversTypes['ShippingClassPaginationDataSession']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingClassResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingClassResponse'] = ResolversParentTypes['ShippingClassResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shippingClass?: Resolver<ResolversTypes['ShippingClass'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubCategoryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubCategory'] = ResolversParentTypes['SubCategory']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentSubCategory?: Resolver<Maybe<ResolversTypes['SubCategoryDataResponse']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subCategories?: Resolver<Maybe<Array<ResolversTypes['SubCategoryDataResponse']>>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubCategoryDataResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubCategoryDataResponse'] = ResolversParentTypes['SubCategoryDataResponse']> = {
  category?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentSubCategory?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subCategories?: Resolver<Maybe<Array<ResolversTypes['SubCategoryDataResponse']>>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubCategoryResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubCategoryResponse'] = ResolversParentTypes['SubCategoryResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subcategory?: Resolver<ResolversTypes['SubCategoryDataResponse'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubCategoryResponseByIdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubCategoryResponseById'] = ResolversParentTypes['SubCategoryResponseById']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  subcategory?: Resolver<ResolversTypes['SubCategoryDataResponse'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagPaginationDataSession'] = ResolversParentTypes['TagPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalProducts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagPaginationResponse'] = ResolversParentTypes['TagPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['TagPaginationDataSession']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagResponse'] = ResolversParentTypes['TagResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxClassResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxClass'] = ResolversParentTypes['TaxClass']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxClassPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxClassPaginationDataSession'] = ResolversParentTypes['TaxClassPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalProducts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxClassPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxClassPaginationResponse'] = ResolversParentTypes['TaxClassPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxClasses?: Resolver<Array<ResolversTypes['TaxClassPaginationDataSession']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxClassResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxClassResponse'] = ResolversParentTypes['TaxClassResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxClass?: Resolver<ResolversTypes['TaxClass'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateBrandResponseOrError'] = ResolversParentTypes['UpdateBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type UpdateCategoryPositionResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateCategoryPositionResponseOrError'] = ResolversParentTypes['UpdateCategoryPositionResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponse' | 'ErrorResponse' | 'SubCategoryResponse', ParentType, ContextType>;
};

export type UpdateCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateCategoryResponseOrError'] = ResolversParentTypes['UpdateCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponse' | 'ErrorResponse' | 'SubCategoryResponse', ParentType, ContextType>;
};

export type UpdateMediaResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateMediaResponseOrError'] = ResolversParentTypes['UpdateMediaResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'MediaResponse', ParentType, ContextType>;
};

export type UpdateRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateRoleResponseOrError'] = ResolversParentTypes['UpdateRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type UpdateShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateShippingClassResponseOrError'] = ResolversParentTypes['UpdateShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassResponse', ParentType, ContextType>;
};

export type UpdateTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTagResponseOrError'] = ResolversParentTypes['UpdateTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagResponse', ParentType, ContextType>;
};

export type UpdateTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTaxClassResponseOrError'] = ResolversParentTypes['UpdateTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassResponse', ParentType, ContextType>;
};

export type UploadMediaResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UploadMediaResponse'] = ResolversParentTypes['UploadMediaResponse']> = {
  medias?: Resolver<Array<Maybe<ResolversTypes['Media']>>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadMediaResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UploadMediaResponseOrError'] = ResolversParentTypes['UploadMediaResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UploadMediaResponse', ParentType, ContextType>;
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

export type UserLoginInfoResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserLoginInfoResponse'] = ResolversParentTypes['UserLoginInfoResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userLoginInfo?: Resolver<Array<ResolversTypes['LoginMeta']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserLoginResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserLoginResponse'] = ResolversParentTypes['UserLoginResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sessionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  sessionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  Brand?: BrandResolvers<ContextType>;
  BrandPaginationDataSession?: BrandPaginationDataSessionResolvers<ContextType>;
  BrandPaginationResponse?: BrandPaginationResponseResolvers<ContextType>;
  BrandResponse?: BrandResponseResolvers<ContextType>;
  BrandResponseById?: BrandResponseByIdResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CategoryDataResponse?: CategoryDataResponseResolvers<ContextType>;
  CategoryPaginationResponse?: CategoryPaginationResponseResolvers<ContextType>;
  CategoryResponse?: CategoryResponseResolvers<ContextType>;
  CategoryResponseById?: CategoryResponseByIdResolvers<ContextType>;
  CreateBrandResponseOrError?: CreateBrandResponseOrErrorResolvers<ContextType>;
  CreateCategoryResponseOrError?: CreateCategoryResponseOrErrorResolvers<ContextType>;
  CreateRoleResponseOrError?: CreateRoleResponseOrErrorResolvers<ContextType>;
  CreateShippingClassResponseOrError?: CreateShippingClassResponseOrErrorResolvers<ContextType>;
  CreateTagResponseOrError?: CreateTagResponseOrErrorResolvers<ContextType>;
  CreateTaxClassResponseOrError?: CreateTaxClassResponseOrErrorResolvers<ContextType>;
  CreatedBy?: CreatedByResolvers<ContextType>;
  DeleteBrandResponseOrError?: DeleteBrandResponseOrErrorResolvers<ContextType>;
  DeleteCategoryResponseOrError?: DeleteCategoryResponseOrErrorResolvers<ContextType>;
  DeleteShippingClassResponseOrError?: DeleteShippingClassResponseOrErrorResolvers<ContextType>;
  DeleteTagResponseOrError?: DeleteTagResponseOrErrorResolvers<ContextType>;
  DeleteTaxClassResponseOrError?: DeleteTaxClassResponseOrErrorResolvers<ContextType>;
  EmailVerificationResponse?: EmailVerificationResponseResolvers<ContextType>;
  EmailVerificationResponseOrError?: EmailVerificationResponseOrErrorResolvers<ContextType>;
  ErrorResponse?: ErrorResponseResolvers<ContextType>;
  FieldError?: FieldErrorResolvers<ContextType>;
  GetBrandByIDResponseOrError?: GetBrandByIdResponseOrErrorResolvers<ContextType>;
  GetBrandsResponseOrError?: GetBrandsResponseOrErrorResolvers<ContextType>;
  GetCategoriesResponseOrError?: GetCategoriesResponseOrErrorResolvers<ContextType>;
  GetCategoryByIDResponseOrError?: GetCategoryByIdResponseOrErrorResolvers<ContextType>;
  GetMediaByIdResponseOrError?: GetMediaByIdResponseOrErrorResolvers<ContextType>;
  GetMediasResponseOrError?: GetMediasResponseOrErrorResolvers<ContextType>;
  GetPermissionsResponseOrError?: GetPermissionsResponseOrErrorResolvers<ContextType>;
  GetPersonalizedPermissionsResponseOrError?: GetPersonalizedPermissionsResponseOrErrorResolvers<ContextType>;
  GetProfileResponseOrError?: GetProfileResponseOrErrorResolvers<ContextType>;
  GetRoleByIDResponseOrError?: GetRoleByIdResponseOrErrorResolvers<ContextType>;
  GetRoleResponseOrError?: GetRoleResponseOrErrorResolvers<ContextType>;
  GetRolesResponseOrError?: GetRolesResponseOrErrorResolvers<ContextType>;
  GetShippingClassByIDResponseOrError?: GetShippingClassByIdResponseOrErrorResolvers<ContextType>;
  GetShippingClassesResponseOrError?: GetShippingClassesResponseOrErrorResolvers<ContextType>;
  GetSubCategoryByIDResponseOrError?: GetSubCategoryByIdResponseOrErrorResolvers<ContextType>;
  GetTagByIDResponseOrError?: GetTagByIdResponseOrErrorResolvers<ContextType>;
  GetTagsResponseOrError?: GetTagsResponseOrErrorResolvers<ContextType>;
  GetTaxClassByIDResponseOrError?: GetTaxClassByIdResponseOrErrorResolvers<ContextType>;
  GetTaxClassesResponseOrError?: GetTaxClassesResponseOrErrorResolvers<ContextType>;
  GetUserByIDResponseOrError?: GetUserByIdResponseOrErrorResolvers<ContextType>;
  GetUserLoginInfoResponseOrError?: GetUserLoginInfoResponseOrErrorResolvers<ContextType>;
  GetUsersResponseOrError?: GetUsersResponseOrErrorResolvers<ContextType>;
  LoginMeta?: LoginMetaResolvers<ContextType>;
  Media?: MediaResolvers<ContextType>;
  MediaResponse?: MediaResponseResolvers<ContextType>;
  MediasResponse?: MediasResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PermissionSession?: PermissionSessionResolvers<ContextType>;
  Permissions?: PermissionsResolvers<ContextType>;
  PermissionsResponse?: PermissionsResponseResolvers<ContextType>;
  PersonalizedWithRolePermissionResponse?: PersonalizedWithRolePermissionResponseResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RestoreBrandResponseOrError?: RestoreBrandResponseOrErrorResolvers<ContextType>;
  RestoreCategoryResponseOrError?: RestoreCategoryResponseOrErrorResolvers<ContextType>;
  RestoreShippingClassResponseOrError?: RestoreShippingClassResponseOrErrorResolvers<ContextType>;
  RestoreTagResponseOrError?: RestoreTagResponseOrErrorResolvers<ContextType>;
  RestoreTaxClassResponseOrError?: RestoreTaxClassResponseOrErrorResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RolePermissionSession?: RolePermissionSessionResolvers<ContextType>;
  RoleResponse?: RoleResponseResolvers<ContextType>;
  RoleSession?: RoleSessionResolvers<ContextType>;
  RolesResponse?: RolesResponseResolvers<ContextType>;
  ShippingClass?: ShippingClassResolvers<ContextType>;
  ShippingClassPaginationDataSession?: ShippingClassPaginationDataSessionResolvers<ContextType>;
  ShippingClassPaginationResponse?: ShippingClassPaginationResponseResolvers<ContextType>;
  ShippingClassResponse?: ShippingClassResponseResolvers<ContextType>;
  SubCategory?: SubCategoryResolvers<ContextType>;
  SubCategoryDataResponse?: SubCategoryDataResponseResolvers<ContextType>;
  SubCategoryResponse?: SubCategoryResponseResolvers<ContextType>;
  SubCategoryResponseById?: SubCategoryResponseByIdResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagPaginationDataSession?: TagPaginationDataSessionResolvers<ContextType>;
  TagPaginationResponse?: TagPaginationResponseResolvers<ContextType>;
  TagResponse?: TagResponseResolvers<ContextType>;
  TaxClass?: TaxClassResolvers<ContextType>;
  TaxClassPaginationDataSession?: TaxClassPaginationDataSessionResolvers<ContextType>;
  TaxClassPaginationResponse?: TaxClassPaginationResponseResolvers<ContextType>;
  TaxClassResponse?: TaxClassResponseResolvers<ContextType>;
  UpdateBrandResponseOrError?: UpdateBrandResponseOrErrorResolvers<ContextType>;
  UpdateCategoryPositionResponseOrError?: UpdateCategoryPositionResponseOrErrorResolvers<ContextType>;
  UpdateCategoryResponseOrError?: UpdateCategoryResponseOrErrorResolvers<ContextType>;
  UpdateMediaResponseOrError?: UpdateMediaResponseOrErrorResolvers<ContextType>;
  UpdateRoleResponseOrError?: UpdateRoleResponseOrErrorResolvers<ContextType>;
  UpdateShippingClassResponseOrError?: UpdateShippingClassResponseOrErrorResolvers<ContextType>;
  UpdateTagResponseOrError?: UpdateTagResponseOrErrorResolvers<ContextType>;
  UpdateTaxClassResponseOrError?: UpdateTaxClassResponseOrErrorResolvers<ContextType>;
  UploadMediaResponse?: UploadMediaResponseResolvers<ContextType>;
  UploadMediaResponseOrError?: UploadMediaResponseOrErrorResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserLoginInfoResponse?: UserLoginInfoResponseResolvers<ContextType>;
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
