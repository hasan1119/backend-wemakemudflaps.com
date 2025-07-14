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

export type AddressBook = {
  __typename?: 'AddressBook';
  city: Scalars['String']['output'];
  company: Scalars['String']['output'];
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isDefault: Scalars['Boolean']['output'];
  state: Scalars['String']['output'];
  streetOne: Scalars['String']['output'];
  streetTwo: Scalars['String']['output'];
  type: AddressType;
  updatedAt: Scalars['String']['output'];
  zip: Scalars['String']['output'];
};

export type AddressResponseBook = {
  __typename?: 'AddressResponseBook';
  addressBook: AddressBook;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export enum AddressType {
  Billing = 'BILLING',
  Shipping = 'SHIPPING'
}

export type AddressesBookResponse = {
  __typename?: 'AddressesBookResponse';
  addressBook: Array<AddressBook>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export enum AllowBackOrders {
  Allow = 'ALLOW',
  AllowWithNotification = 'ALLOW_WITH_NOTIFICATION',
  DontAllow = 'DONT_ALLOW'
}

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
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Media>;
};

export type BrandPaginationDataSession = {
  __typename?: 'BrandPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Media>;
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

export type Category = ICategoryBase & {
  __typename?: 'Category';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentCategory?: Maybe<Category>;
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subCategories: Array<Category>;
  thumbnail?: Maybe<Media>;
};

export type CategoryPaginationDataSession = {
  __typename?: 'CategoryPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  parentCategory?: Maybe<Category>;
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subCategories: Array<Category>;
  thumbnail?: Maybe<Media>;
  totalProducts?: Maybe<Scalars['Int']['output']>;
};

export type CategoryPaginationResponse = {
  __typename?: 'CategoryPaginationResponse';
  categories: Array<CategoryPaginationDataSession>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  category: Category;
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

export type CreateAddressBookResponseOrError = AddressResponseBook | BaseResponse | ErrorResponse;

export type CreateBrandResponseOrError = BaseResponse | BrandResponse | ErrorResponse;

export type CreateCategoryResponseOrError = BaseResponse | CategoryResponse | ErrorResponse;

export type CreateProductResponseOrError = BaseResponse | ErrorResponse;

export type CreateProductReviewResponseOrError = BaseResponse | ErrorResponse | ProductReviewResponse;

export type CreateRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type CreateShippingClassResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type CreateShippingMethodResponseOrError = BaseResponse | ErrorResponse | ShippingMethodResponse;

export type CreateTagResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type CreateTaxClassResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

export type CreateTaxExemptionResponseOrError = BaseResponse | ErrorResponse | TaxExemptionResponse;

export type CreateTaxRateResponseOrError = BaseResponse | ErrorResponse | TaxRateResponse;

export type CreatedBy = {
  __typename?: 'CreatedBy';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roles: Array<UserRoleObject>;
};

export enum DefaultWarrantyPeriod {
  Day = 'DAY',
  Days = 'DAYS',
  Lifetime = 'LIFETIME',
  Month = 'MONTH',
  Months = 'MONTHS',
  Week = 'WEEK',
  Weeks = 'WEEKS',
  Year = 'YEAR',
  Years = 'YEARS'
}

export type DeleteAddressResponseBook = {
  __typename?: 'DeleteAddressResponseBook';
  message: Scalars['String']['output'];
  newDefaultAddressId?: Maybe<Scalars['String']['output']>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteAddressesBookResponseOrError = BaseResponse | DeleteAddressResponseBook | ErrorResponse;

export type DeleteBrandResponseOrError = BaseResponse | ErrorResponse;

export type DeleteCategoryResponseOrError = BaseResponse | ErrorResponse;

export type DeleteProductResponseOrError = BaseResponse | ErrorResponse;

export type DeleteProductReviewResponseOrError = BaseResponse | ErrorResponse;

export type DeleteShippingClassResponseOrError = BaseResponse | ErrorResponse;

export type DeleteShippingMethodResponseOrError = BaseResponse | ErrorResponse;

export type DeleteTagResponseOrError = BaseResponse | ErrorResponse;

export type DeleteTaxClassResponseOrError = BaseResponse | ErrorResponse;

export type DeleteTaxExemptionResponse = {
  __typename?: 'DeleteTaxExemptionResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type DeleteTaxExemptionResponseOrError = BaseResponse | DeleteTaxExemptionResponse | ErrorResponse;

export type DeleteTaxRateResponseOrError = BaseResponse | ErrorResponse;

export enum DimensionUnit {
  Centimeter = 'CENTIMETER',
  Foot = 'FOOT',
  Inch = 'INCH',
  Kilometer = 'KILOMETER',
  Meter = 'METER',
  Millimeter = 'MILLIMETER',
  Yard = 'YARD'
}

export type EmailVerificationResponse = {
  __typename?: 'EmailVerificationResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  token?: Maybe<Scalars['String']['output']>;
};

export type EmailVerificationResponseOrError = BaseResponse | EmailVerificationResponse | ErrorResponse;

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

export type FlatRate = {
  __typename?: 'FlatRate';
  cost: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
};

export type FreeShipping = {
  __typename?: 'FreeShipping';
  id: Scalars['ID']['output'];
};

export enum Gender {
  Female = 'Female',
  Male = 'Male',
  Others = 'Others',
  RatherNotToSay = 'Rather_not_to_say'
}

export type GetAddressBookByIdResponseOrError = AddressResponseBook | BaseResponse | ErrorResponse;

export type GetAddressesBookResponseOrError = AddressesBookResponse | BaseResponse | ErrorResponse;

export type GetBrandByIdResponseOrError = BaseResponse | BrandResponseById | ErrorResponse;

export type GetBrandsResponseOrError = BaseResponse | BrandPaginationResponse | ErrorResponse;

export type GetCategoriesResponseOrError = BaseResponse | CategoryPaginationResponse | ErrorResponse;

export type GetCategoryByIdResponseOrError = BaseResponse | CategoryResponseById | ErrorResponse;

export type GetMediaByIdResponseOrError = BaseResponse | ErrorResponse | MediaResponse;

export type GetMediasResponseOrError = BaseResponse | ErrorResponse | MediasResponse;

export type GetPermissionsResponseOrError = BaseResponse | ErrorResponse | PersonalizedWithRolePermissionResponse;

export type GetPersonalizedPermissionsResponseOrError = BaseResponse | ErrorResponse | PermissionsResponse;

export type GetProductByIdResponseOrError = BaseResponse | ErrorResponse | ProductResponse;

export type GetProductReviewByIdResponseOrError = BaseResponse | ErrorResponse | ProductReviewResponse;

export type GetProductReviewsResponseOrError = BaseResponse | ErrorResponse | ProductReviewPaginationResponse;

export type GetProductsResponseOrError = BaseResponse | ErrorResponse | ProductPaginationResponse;

export type GetProfileResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetRoleByIdResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type GetRolesResponseOrError = BaseResponse | ErrorResponse | RolesResponse;

export type GetShippingClassByIdResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type GetShippingClassesResponseOrError = BaseResponse | ErrorResponse | ShippingClassPaginationResponse;

export type GetShippingMethodByIdResponseOrError = BaseResponse | ErrorResponse | ShippingMethodResponse;

export type GetShippingMethodsResponseOrError = BaseResponse | ErrorResponse | ShippingMethodPaginationResponse;

export type GetTagByIdResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type GetTagsResponseOrError = BaseResponse | ErrorResponse | TagPaginationResponse;

export type GetTaxClassByIdResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

export type GetTaxClassesResponseOrError = BaseResponse | ErrorResponse | TaxClassPaginationResponse;

export type GetTaxExemptionsResponseOrError = BaseResponse | ErrorResponse | TaxExemptionResponse;

export type GetTaxRateByIdResponseOrError = BaseResponse | ErrorResponse | TaxRateResponse;

export type GetTaxRatesResponseOrError = BaseResponse | ErrorResponse | TaxRatePaginationResponse;

export type GetUserByIdResponseOrError = BaseResponse | ErrorResponse | UserResponse;

export type GetUserLoginInfoResponseOrError = BaseResponse | ErrorResponse | UserLoginInfoResponse;

export type GetUsersResponseOrError = BaseResponse | ErrorResponse | UsersResponse;

export type ICategoryBase = {
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  thumbnail?: Maybe<Media>;
};

export type LocalPickUp = {
  __typename?: 'LocalPickUp';
  id: Scalars['ID']['output'];
};

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
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dimension?: Maybe<MediaDimension>;
  fileName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  length?: Maybe<Scalars['Int']['output']>;
  mediaType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export enum MediaCategory {
  Avatar = 'Avatar',
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
  Promotion = 'Promotion',
  ShippingLabel = 'Shipping_Label',
  SiteFavicon = 'Site_Favicon',
  SiteLogo = 'Site_Logo',
  SiteSettings = 'Site_Settings',
  SubCategory = 'Sub_Category',
  TaxExemptionCertificate = 'Tax_Exemption_Certificate'
}

export type MediaDimension = {
  __typename?: 'MediaDimension';
  height: Scalars['Int']['output'];
  unit: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type MediaDimensionInput = {
  height: Scalars['Int']['input'];
  unit: Scalars['String']['input'];
  width: Scalars['Int']['input'];
};

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
  createAddressBookEntry: CreateAddressBookResponseOrError;
  createBrand: CreateBrandResponseOrError;
  createCategory: CreateCategoryResponseOrError;
  createProduct: CreateProductResponseOrError;
  createReview?: Maybe<Scalars['String']['output']>;
  createShippingClass: CreateShippingClassResponseOrError;
  createShippingMethod: CreateShippingMethodResponseOrError;
  createTag: CreateTagResponseOrError;
  createTaxClass: CreateTaxClassResponseOrError;
  createTaxExemptionEntry: CreateTaxExemptionResponseOrError;
  createTaxRate: CreateTaxRateResponseOrError;
  createUserRole: CreateRoleResponseOrError;
  deleteAddressBookEntry: DeleteAddressesBookResponseOrError;
  deleteBrand: DeleteBrandResponseOrError;
  deleteCategory?: Maybe<DeleteCategoryResponseOrError>;
  deleteLoginSession: BaseResponseOrError;
  deleteMediaFiles: BaseResponseOrError;
  deleteProduct: DeleteProductResponseOrError;
  deleteShippingClass: DeleteShippingClassResponseOrError;
  deleteShippingMethod: DeleteShippingMethodResponseOrError;
  deleteTag: DeleteTagResponseOrError;
  deleteTaxClass: DeleteTaxClassResponseOrError;
  deleteTaxRate: DeleteTaxRateResponseOrError;
  deleteUserRole: BaseResponseOrError;
  forgetPassword: BaseResponseOrError;
  login: UserLoginResponseOrError;
  logout: BaseResponseOrError;
  register: BaseResponseOrError;
  resetPassword: BaseResponseOrError;
  restoreBrands: RestoreBrandResponseOrError;
  restoreCategory?: Maybe<RestoreCategoryResponseOrError>;
  restoreMediaFiles: BaseResponseOrError;
  restoreProducts: RestoreProductResponseOrError;
  restoreShippingClasses: RestoreShippingClassResponseOrError;
  restoreShippingMethod: RestoreShippingMethodResponseOrError;
  restoreTags: RestoreTagResponseOrError;
  restoreTaxClasses: RestoreTaxClassResponseOrError;
  restoreTaxRates: RestoreTaxRateResponseOrError;
  restoreUserRole: BaseResponseOrError;
  updateAddressBookEntry: UpdateAddressBookResponseOrError;
  updateBrand: UpdateBrandResponseOrError;
  updateCategory: UpdateCategoryResponseOrError;
  updateCategoryPosition: UpdateCategoryResponseOrError;
  updateMediaFileInfo: UpdateMediaResponseOrError;
  updateProduct: UpdateProductResponseOrError;
  updateProfile: UserProfileUpdateResponseOrError;
  updateShippingClass: UpdateShippingClassResponseOrError;
  updateShippingMethod: UpdateShippingMethodResponseOrError;
  updateTag: UpdateTagResponseOrError;
  updateTaxClass: UpdateTaxClassResponseOrError;
  updateTaxExemptionEntry: UpdateTaxExemptionResponseOrError;
  updateTaxRate: UpdateTaxRateResponseOrError;
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


export type MutationCreateAddressBookEntryArgs = {
  city: Scalars['String']['input'];
  company: Scalars['String']['input'];
  country: Scalars['String']['input'];
  isDefault: Scalars['Boolean']['input'];
  state: Scalars['String']['input'];
  streetOne: Scalars['String']['input'];
  streetTwo: Scalars['String']['input'];
  type: AddressType;
  userId: Scalars['ID']['input'];
  zip: Scalars['String']['input'];
};


export type MutationCreateBrandArgs = {
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateCategoryArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentCategoryId?: InputMaybe<Scalars['ID']['input']>;
  slug: Scalars['String']['input'];
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateProductArgs = {
  allowBackOrders?: InputMaybe<AllowBackOrders>;
  attributes?: InputMaybe<Array<ProductAttributeInput>>;
  brandIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  crossSellIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  customBadge?: InputMaybe<Scalars['String']['input']>;
  defaultImage?: InputMaybe<Scalars['ID']['input']>;
  defaultMainDescription: Scalars['String']['input'];
  defaultQuantity?: InputMaybe<Scalars['Int']['input']>;
  defaultShortDescription?: InputMaybe<Scalars['String']['input']>;
  defaultTags?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultWarrantyPeriod?: InputMaybe<DefaultWarrantyPeriod>;
  dimensionUnit?: InputMaybe<DimensionUnit>;
  enableReviews?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  images?: InputMaybe<Array<Scalars['ID']['input']>>;
  initialNumberInStock?: InputMaybe<Scalars['String']['input']>;
  isCustomized: Scalars['Boolean']['input'];
  isPreview?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lowStockThresHold?: InputMaybe<Scalars['Int']['input']>;
  manageStock?: InputMaybe<Scalars['Boolean']['input']>;
  maxQuantity?: InputMaybe<Scalars['Int']['input']>;
  minQuantity?: InputMaybe<Scalars['Int']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  productConfigurationType: ProductConfigurationType;
  productDeliveryType?: InputMaybe<Array<ProductDeliveryType>>;
  purchaseNote?: InputMaybe<Scalars['String']['input']>;
  quantityStep?: InputMaybe<Scalars['Int']['input']>;
  regularPrice: Scalars['Float']['input'];
  salePrice?: InputMaybe<Scalars['Float']['input']>;
  salePriceEndAt?: InputMaybe<Scalars['String']['input']>;
  salePriceStartAt?: InputMaybe<Scalars['String']['input']>;
  saleQuantity?: InputMaybe<Scalars['Int']['input']>;
  saleQuantityUnit: Scalars['String']['input'];
  shippingClassId?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  soldIndividually?: InputMaybe<Scalars['Boolean']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
  stockStatus?: InputMaybe<StockStatus>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  taxClassId: Scalars['ID']['input'];
  taxStatus?: InputMaybe<TaxStatus>;
  tierPricingInfo?: InputMaybe<ProductPriceInput>;
  upsellIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  variations?: InputMaybe<Array<ProductVariationInput>>;
  videos?: InputMaybe<Array<Scalars['ID']['input']>>;
  warrantyDigit?: InputMaybe<Scalars['Int']['input']>;
  warrantyPolicy?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<WeightUnit>;
  width?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationCreateShippingClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};


export type MutationCreateShippingMethodArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreateTagArgs = {
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
};


export type MutationCreateTaxClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};


export type MutationCreateTaxExemptionEntryArgs = {
  assumptionReason: Scalars['String']['input'];
  expiryDate: Scalars['String']['input'];
  taxCertificate: Scalars['String']['input'];
  taxNumber: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreateTaxRateArgs = {
  appliesToShipping?: InputMaybe<Scalars['Boolean']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country: Scalars['String']['input'];
  isCompound?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  postcode?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  rate: Scalars['Float']['input'];
  state?: InputMaybe<Scalars['String']['input']>;
  taxClassId: Scalars['ID']['input'];
};


export type MutationCreateUserRoleArgs = {
  defaultPermissions?: InputMaybe<Array<RolePermissionInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  systemDeleteProtection?: InputMaybe<Scalars['Boolean']['input']>;
  systemUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteAddressBookEntryArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationDeleteBrandArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteCategoryArgs = {
  ids: Array<Scalars['ID']['input']>;
  skipTrash?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteLoginSessionArgs = {
  sessionIds: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationDeleteMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteProductArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteShippingClassArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteShippingMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTagArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteTaxClassArgs = {
  ids: Array<InputMaybe<Scalars['ID']['input']>>;
  skipTrash: Scalars['Boolean']['input'];
};


export type MutationDeleteTaxRateArgs = {
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
  company?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Gender>;
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationRestoreBrandsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreCategoryArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreMediaFilesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreProductsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreShippingClassesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreShippingMethodArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRestoreTagsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreTaxClassesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreTaxRatesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationRestoreUserRoleArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationUpdateAddressBookEntryArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  streetOne?: InputMaybe<Scalars['String']['input']>;
  streetTwo?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<AddressType>;
  userId: Scalars['ID']['input'];
  zip?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateBrandArgs = {
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCategoryArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  thumbnail?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCategoryPositionArgs = {
  id: Scalars['ID']['input'];
  position: Scalars['Int']['input'];
};


export type MutationUpdateMediaFileInfoArgs = {
  inputs: UpdateMediaInput;
};


export type MutationUpdateProductArgs = {
  allowBackOrders?: InputMaybe<AllowBackOrders>;
  attributes?: InputMaybe<Array<ProductAttributeInput>>;
  brandIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  crossSellIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  customBadge?: InputMaybe<Scalars['String']['input']>;
  defaultImage?: InputMaybe<Scalars['ID']['input']>;
  defaultMainDescription?: InputMaybe<Scalars['String']['input']>;
  defaultQuantity?: InputMaybe<Scalars['Int']['input']>;
  defaultShortDescription?: InputMaybe<Scalars['String']['input']>;
  defaultTags?: InputMaybe<Array<Scalars['String']['input']>>;
  defaultWarrantyPeriod?: InputMaybe<DefaultWarrantyPeriod>;
  dimensionUnit?: InputMaybe<DimensionUnit>;
  enableReviews?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['ID']['input']>>;
  initialNumberInStock?: InputMaybe<Scalars['String']['input']>;
  isCustomized?: InputMaybe<Scalars['Boolean']['input']>;
  isPreview?: InputMaybe<Scalars['Boolean']['input']>;
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
  length?: InputMaybe<Scalars['Float']['input']>;
  lowStockThresHold?: InputMaybe<Scalars['Int']['input']>;
  manageStock?: InputMaybe<Scalars['Boolean']['input']>;
  maxQuantity?: InputMaybe<Scalars['Int']['input']>;
  minQuantity?: InputMaybe<Scalars['Int']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  productConfigurationType?: InputMaybe<ProductConfigurationType>;
  productDeliveryType?: InputMaybe<Array<ProductDeliveryType>>;
  purchaseNote?: InputMaybe<Scalars['String']['input']>;
  quantityStep?: InputMaybe<Scalars['Int']['input']>;
  regularPrice?: InputMaybe<Scalars['Float']['input']>;
  salePrice?: InputMaybe<Scalars['Float']['input']>;
  salePriceEndAt?: InputMaybe<Scalars['String']['input']>;
  salePriceStartAt?: InputMaybe<Scalars['String']['input']>;
  saleQuantity?: InputMaybe<Scalars['Int']['input']>;
  saleQuantityUnit?: InputMaybe<Scalars['String']['input']>;
  shippingClassId?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  soldIndividually?: InputMaybe<Scalars['Boolean']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
  stockStatus?: InputMaybe<StockStatus>;
  tagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  taxClassId?: InputMaybe<Scalars['ID']['input']>;
  taxStatus?: InputMaybe<TaxStatus>;
  tierPricingInfo?: InputMaybe<ProductPriceInput>;
  upsellIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  variations?: InputMaybe<Array<ProductVariationInput>>;
  videos?: InputMaybe<Array<Scalars['ID']['input']>>;
  warrantyDigit?: InputMaybe<Scalars['Int']['input']>;
  warrantyPolicy?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<WeightUnit>;
  width?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationUpdateProfileArgs = {
  address?: InputMaybe<UserAddressInput>;
  avatar?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateShippingClassArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateShippingMethodArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
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


export type MutationUpdateTaxExemptionEntryArgs = {
  assumptionReason?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  status?: InputMaybe<TaxExemptionStatus>;
  taxCertificate?: InputMaybe<Scalars['String']['input']>;
  taxNumber?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationUpdateTaxRateArgs = {
  appliesToShipping?: InputMaybe<Scalars['Boolean']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isCompound?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  rate?: InputMaybe<Scalars['Float']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  taxClassId: Scalars['ID']['input'];
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
  systemUpdateProtection?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationUploadMediaFilesArgs = {
  inputs: Array<InputMaybe<UploadMediaInput>>;
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
  AddressBook = 'ADDRESS_BOOK',
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
  ShippingMethod = 'SHIPPING_METHOD',
  SubCategory = 'SUB_CATEGORY',
  Tag = 'TAG',
  TaxClass = 'TAX_CLASS',
  TaxExemption = 'TAX_EXEMPTION',
  TaxRate = 'TAX_RATE',
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

export enum PricingTypeEnum {
  Fixed = 'Fixed',
  Percentage = 'Percentage'
}

export type Product = {
  __typename?: 'Product';
  allowBackOrders?: Maybe<Scalars['String']['output']>;
  attributes?: Maybe<Array<Maybe<ProductAttribute>>>;
  brands?: Maybe<Array<Brand>>;
  categories?: Maybe<Array<Category>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  crossSells?: Maybe<Array<Product>>;
  customBadge?: Maybe<Scalars['String']['output']>;
  defaultImage?: Maybe<Media>;
  defaultMainDescription: Scalars['String']['output'];
  defaultQuantity?: Maybe<Scalars['Int']['output']>;
  defaultShortDescription?: Maybe<Scalars['String']['output']>;
  defaultTags?: Maybe<Array<Scalars['String']['output']>>;
  defaultWarrantyPeriod?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  dimensionUnit?: Maybe<Scalars['String']['output']>;
  enableReviews?: Maybe<Scalars['Boolean']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  images?: Maybe<Array<Media>>;
  initialNumberInStock?: Maybe<Scalars['String']['output']>;
  isCustomized: Scalars['Boolean']['output'];
  isPreview?: Maybe<Scalars['Boolean']['output']>;
  isVisible?: Maybe<Scalars['Boolean']['output']>;
  length?: Maybe<Scalars['Float']['output']>;
  lowStockThresHold?: Maybe<Scalars['Int']['output']>;
  manageStock?: Maybe<Scalars['Boolean']['output']>;
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  minQuantity?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  productConfigurationType?: Maybe<Scalars['String']['output']>;
  productDeliveryType: Array<Scalars['String']['output']>;
  purchaseNote?: Maybe<Scalars['String']['output']>;
  quantityStep?: Maybe<Scalars['Int']['output']>;
  regularPrice: Scalars['Float']['output'];
  reviews?: Maybe<Array<ProductReview>>;
  salePrice?: Maybe<Scalars['Float']['output']>;
  salePriceEndAt?: Maybe<Scalars['String']['output']>;
  salePriceStartAt?: Maybe<Scalars['String']['output']>;
  saleQuantity?: Maybe<Scalars['Int']['output']>;
  saleQuantityUnit?: Maybe<Scalars['String']['output']>;
  shippingClass?: Maybe<ShippingClass>;
  sku?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  soldIndividually?: Maybe<Scalars['Boolean']['output']>;
  stockQuantity?: Maybe<Scalars['Int']['output']>;
  stockStatus?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Tag>>;
  taxClass?: Maybe<TaxClass>;
  taxStatus?: Maybe<Scalars['String']['output']>;
  tierPricingInfo?: Maybe<ProductPrice>;
  upsells?: Maybe<Array<Product>>;
  variations?: Maybe<Array<Maybe<ProductVariation>>>;
  videos?: Maybe<Array<Media>>;
  warrantyDigit?: Maybe<Scalars['Int']['output']>;
  warrantyPolicy?: Maybe<Scalars['String']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
  weightUnit?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

export type ProductAttribute = {
  __typename?: 'ProductAttribute';
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isVisible: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  values: Array<ProductAttributeValue>;
};

export type ProductAttributeInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type ProductAttributeValue = {
  __typename?: 'ProductAttributeValue';
  attribute: ProductAttribute;
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type ProductAttributeValueInput = {
  attributeId: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  value: Scalars['String']['input'];
};

export enum ProductDeliveryType {
  DownloadableProduct = 'DOWNLOADABLE_PRODUCT',
  PhysicalProduct = 'PHYSICAL_PRODUCT',
  VirtualProduct = 'VIRTUAL_PRODUCT'
}

export type ProductPaginationResponse = {
  __typename?: 'ProductPaginationResponse';
  message: Scalars['String']['output'];
  products: Array<Product>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ProductPrice = {
  __typename?: 'ProductPrice';
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  pricingType: PricingTypeEnum;
  product?: Maybe<Product>;
  productVariation?: Maybe<ProductVariation>;
  tieredPrices: Array<ProductTieredPrice>;
};

export type ProductPriceInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  pricingType: PricingTypeEnum;
  productId?: InputMaybe<Scalars['ID']['input']>;
  productVariationId?: InputMaybe<Scalars['ID']['input']>;
  tieredPrices?: InputMaybe<Array<ProductTieredPriceInput>>;
};

export type ProductResponse = {
  __typename?: 'ProductResponse';
  message: Scalars['String']['output'];
  product: Product;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type ProductReview = {
  __typename?: 'ProductReview';
  comment: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isApproved: Scalars['Boolean']['output'];
  product: Product;
  rating: Scalars['Int']['output'];
  reviewedBy: Scalars['String']['output'];
};

export type ProductReviewInput = {
  comment: Scalars['String']['input'];
  deletedAt?: InputMaybe<Scalars['String']['input']>;
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  isApproved?: InputMaybe<Scalars['Boolean']['input']>;
  productId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  reviewedBy: Scalars['String']['input'];
};

export type ProductReviewPaginationResponse = {
  __typename?: 'ProductReviewPaginationResponse';
  message: Scalars['String']['output'];
  reviews: Array<ProductReview>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ProductReviewResponse = {
  __typename?: 'ProductReviewResponse';
  message: Scalars['String']['output'];
  reviews: ProductReview;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type ProductTieredPrice = {
  __typename?: 'ProductTieredPrice';
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  fixedPrice?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  maxQuantity: Scalars['Int']['output'];
  minQuantity: Scalars['Int']['output'];
  percentageDiscount?: Maybe<Scalars['Float']['output']>;
  productPrice?: Maybe<ProductPrice>;
  quantityUnit: Scalars['String']['output'];
};

export type ProductTieredPriceInput = {
  fixedPrice?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  maxQuantity: Scalars['Int']['input'];
  minQuantity: Scalars['Int']['input'];
  percentageDiscount?: InputMaybe<Scalars['Float']['input']>;
  productPriceId?: InputMaybe<Scalars['ID']['input']>;
};

export type ProductVariation = {
  __typename?: 'ProductVariation';
  attributeValues: Array<ProductVariationAttributeValue>;
  brands?: Maybe<Array<Brand>>;
  createdAt: Scalars['String']['output'];
  defaultQuantity?: Maybe<Scalars['Int']['output']>;
  defaultWarrantyPeriod?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dimensionUnit?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Media>>;
  length?: Maybe<Scalars['Float']['output']>;
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  minQuantity?: Maybe<Scalars['Int']['output']>;
  product: Product;
  productDeliveryType: Array<Scalars['String']['output']>;
  quantityStep: Scalars['Int']['output'];
  regularPrice: Scalars['Float']['output'];
  salePrice?: Maybe<Scalars['Float']['output']>;
  salePriceEndAt?: Maybe<Scalars['String']['output']>;
  salePriceStartAt?: Maybe<Scalars['String']['output']>;
  shippingClass?: Maybe<ShippingClass>;
  sku?: Maybe<Scalars['String']['output']>;
  stockStatus?: Maybe<Scalars['String']['output']>;
  taxClass?: Maybe<TaxClass>;
  taxStatus?: Maybe<Scalars['String']['output']>;
  tierPricingInfo?: Maybe<ProductPrice>;
  videos?: Maybe<Array<Media>>;
  warrantyDigit?: Maybe<Scalars['Int']['output']>;
  warrantyPolicy?: Maybe<Scalars['String']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
  weightUnit?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

export type ProductVariationAttribute = {
  __typename?: 'ProductVariationAttribute';
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  values: Array<ProductVariationAttributeValue>;
};

export type ProductVariationAttributeInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
};

export type ProductVariationAttributeValue = {
  __typename?: 'ProductVariationAttributeValue';
  attribute: ProductVariationAttribute;
  createdAt: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
  variation: ProductVariation;
};

export type ProductVariationAttributeValueInput = {
  attributeId: Scalars['ID']['input'];
  id?: InputMaybe<Scalars['ID']['input']>;
  value: Scalars['String']['input'];
  variationId: Scalars['ID']['input'];
};

export type ProductVariationInput = {
  attributeValues?: InputMaybe<Array<ProductVariationAttributeValueInput>>;
  brandIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  defaultQuantity?: InputMaybe<Scalars['Int']['input']>;
  defaultWarrantyPeriod?: InputMaybe<DefaultWarrantyPeriod>;
  description?: InputMaybe<Scalars['String']['input']>;
  dimensionUnit?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  images?: InputMaybe<Array<Scalars['ID']['input']>>;
  length?: InputMaybe<Scalars['Float']['input']>;
  maxQuantity?: InputMaybe<Scalars['Int']['input']>;
  minQuantity?: InputMaybe<Scalars['Int']['input']>;
  productDeliveryType?: InputMaybe<Array<ProductDeliveryType>>;
  productId: Scalars['ID']['input'];
  quantityStep?: InputMaybe<Scalars['Int']['input']>;
  regularPrice: Scalars['Float']['input'];
  salePrice?: InputMaybe<Scalars['Float']['input']>;
  salePriceEndAt?: InputMaybe<Scalars['String']['input']>;
  salePriceStartAt?: InputMaybe<Scalars['String']['input']>;
  shippingClassId?: InputMaybe<Scalars['ID']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stockStatus?: InputMaybe<Scalars['String']['input']>;
  taxClassId: Scalars['ID']['input'];
  taxStatus?: InputMaybe<TaxStatus>;
  tierPricingInfoId?: InputMaybe<Scalars['ID']['input']>;
  videos?: InputMaybe<Array<Scalars['ID']['input']>>;
  warrantyDigit?: InputMaybe<Scalars['Int']['input']>;
  warrantyPolicy?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<WeightUnit>;
  width?: InputMaybe<Scalars['Float']['input']>;
};

export type Query = {
  __typename?: 'Query';
  getAddressBookEntryById: GetAddressBookByIdResponseOrError;
  getAddressEntires: GetAddressesBookResponseOrError;
  getAllBrands: GetBrandsResponseOrError;
  getAllCategories: GetCategoriesResponseOrError;
  getAllMedias: GetMediasResponseOrError;
  getAllPermissionsByUserId: GetPermissionsResponseOrError;
  getAllProducts: GetProductsResponseOrError;
  getAllRoles: GetRolesResponseOrError;
  getAllShippingClass: GetShippingClassesResponseOrError;
  getAllShippingMethods: GetShippingMethodsResponseOrError;
  getAllTags: GetTagsResponseOrError;
  getAllTaxClass: GetTaxClassesResponseOrError;
  getAllTaxRates: GetTaxRatesResponseOrError;
  getAllUsers: GetUsersResponseOrError;
  getBrandById: GetBrandByIdResponseOrError;
  getCategoryById: GetCategoryByIdResponseOrError;
  getMediaById: GetMediaByIdResponseOrError;
  getOwnPersonalizedPermissions: GetPermissionsResponseOrError;
  getProduct: GetProductByIdResponseOrError;
  getProfile: GetProfileResponseOrError;
  getReview?: Maybe<Scalars['String']['output']>;
  getRoleById: GetRoleByIdResponseOrError;
  getShippingClassById: GetShippingClassByIdResponseOrError;
  getShippingMethodById: GetShippingMethodByIdResponseOrError;
  getTagById: GetTagByIdResponseOrError;
  getTaxClassById: GetTaxClassByIdResponseOrError;
  getTaxExemptionEntryByUserId: GetTaxExemptionsResponseOrError;
  getTaxRateById: GetTaxRateByIdResponseOrError;
  getUserById: GetUserByIdResponseOrError;
  getUserOwnLoginInfo: GetUserLoginInfoResponseOrError;
};


export type QueryGetAddressBookEntryByIdArgs = {
  id: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryGetAddressEntiresArgs = {
  type: AddressType;
  userId: Scalars['ID']['input'];
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


export type QueryGetAllProductsArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
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


export type QueryGetAllShippingMethodsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
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


export type QueryGetAllTaxRatesArgs = {
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  taxClassId: Scalars['ID']['input'];
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


export type QueryGetProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetRoleByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetShippingClassByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetShippingMethodByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTagByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTaxClassByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetTaxExemptionEntryByUserIdArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryGetTaxRateByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['String']['input'];
};

export type RestoreBrandResponseOrError = BaseResponse | ErrorResponse;

export type RestoreCategoryResponseOrError = BaseResponse | ErrorResponse;

export type RestoreProductResponseOrError = BaseResponse | ErrorResponse;

export type RestoreProductReviewResponseOrError = BaseResponse | ErrorResponse;

export type RestoreShippingClassResponseOrError = BaseResponse | ErrorResponse;

export type RestoreShippingMethodResponseOrError = BaseResponse | ErrorResponse;

export type RestoreTagResponseOrError = BaseResponse | ErrorResponse;

export type RestoreTaxClassResponseOrError = BaseResponse | ErrorResponse;

export type RestoreTaxRateResponseOrError = BaseResponse | ErrorResponse;

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
  role?: Maybe<Role>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type RoleSession = {
  __typename?: 'RoleSession';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<CreatedBy>;
  defaultPermissions: Array<RolePermissionSession>;
  deletedAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  systemDeleteProtection: Scalars['Boolean']['output'];
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
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type ShippingClassPaginationDataSession = {
  __typename?: 'ShippingClassPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
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

export type ShippingMethod = {
  __typename?: 'ShippingMethod';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  flatRate?: Maybe<FlatRate>;
  freeShipping?: Maybe<FreeShipping>;
  id: Scalars['ID']['output'];
  localPickUp?: Maybe<LocalPickUp>;
  status: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  ups?: Maybe<Ups>;
};

export type ShippingMethodPaginationResponse = {
  __typename?: 'ShippingMethodPaginationResponse';
  message: Scalars['String']['output'];
  shippingMethods: Array<ShippingMethod>;
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
};

export type ShippingMethodResponse = {
  __typename?: 'ShippingMethodResponse';
  message: Scalars['String']['output'];
  shippingMethod: ShippingMethod;
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

export enum StockStatus {
  InStock = 'IN_STOCK',
  OnBackorder = 'ON_BACKORDER',
  OutOfStock = 'OUT_OF_STOCK'
}

export type Tag = {
  __typename?: 'Tag';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type TagPaginationDataSession = {
  __typename?: 'TagPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
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
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  value: Scalars['String']['output'];
};

export type TaxClassPaginationDataSession = {
  __typename?: 'TaxClassPaginationDataSession';
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
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

export type TaxExemption = {
  __typename?: 'TaxExemption';
  assumptionReason: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  expiryDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: TaxExemptionStatus;
  taxCertificate?: Maybe<Media>;
  taxNumber: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type TaxExemptionResponse = {
  __typename?: 'TaxExemptionResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  taxExemption: TaxExemption;
};

export enum TaxExemptionStatus {
  Approved = 'Approved',
  Expired = 'Expired',
  Pending = 'Pending',
  Rejected = 'Rejected'
}

export type TaxRate = {
  __typename?: 'TaxRate';
  appliesToShipping: Scalars['Boolean']['output'];
  city?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCompound: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  postcode?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  rate: Scalars['Float']['output'];
  state?: Maybe<Scalars['String']['output']>;
};

export type TaxRatePaginationResponse = {
  __typename?: 'TaxRatePaginationResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  taxRates: Array<TaxRate>;
  total: Scalars['Int']['output'];
};

export type TaxRateResponse = {
  __typename?: 'TaxRateResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  taxRate: TaxRateSession;
};

export type TaxRateSession = {
  __typename?: 'TaxRateSession';
  appliesToShipping: Scalars['Boolean']['output'];
  city?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy: CreatedBy;
  deletedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isCompound: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  postcode?: Maybe<Scalars['String']['output']>;
  priority: Scalars['Int']['output'];
  rate: Scalars['Float']['output'];
  state?: Maybe<Scalars['String']['output']>;
  taxClassId: Scalars['ID']['output'];
};

export enum TaxStatus {
  None = 'NONE',
  ProductOnly = 'PRODUCT_ONLY',
  ShippingOnly = 'SHIPPING_ONLY',
  Taxable = 'TAXABLE'
}

export type UpdateAddressBookResponseOrError = AddressResponseBook | BaseResponse | ErrorResponse;

export type UpdateBrandResponseOrError = BaseResponse | BrandResponse | ErrorResponse;

export type UpdateCategoryResponseOrError = BaseResponse | CategoryResponse | ErrorResponse;

export type UpdateMediaInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  category: MediaCategory;
  description?: InputMaybe<Scalars['String']['input']>;
  dimension?: InputMaybe<MediaDimensionInput>;
  id: Scalars['ID']['input'];
  length?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMediaResponseOrError = BaseResponse | ErrorResponse | MediaResponse;

export type UpdateProductResponseOrError = BaseResponse | ErrorResponse;

export type UpdateProductReviewResponseOrError = BaseResponse | ErrorResponse | ProductReviewResponse;

export type UpdateRoleResponseOrError = BaseResponse | ErrorResponse | RoleResponse;

export type UpdateShippingClassResponseOrError = BaseResponse | ErrorResponse | ShippingClassResponse;

export type UpdateShippingMethodResponseOrError = BaseResponse | ErrorResponse | ShippingMethodResponse;

export type UpdateTagResponseOrError = BaseResponse | ErrorResponse | TagResponse;

export type UpdateTaxClassResponseOrError = BaseResponse | ErrorResponse | TaxClassResponse;

export type UpdateTaxExemptionResponseOrError = BaseResponse | ErrorResponse | TaxExemptionResponse;

export type UpdateTaxRateResponseOrError = BaseResponse | ErrorResponse | TaxRateResponse;

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
  category?: InputMaybe<MediaCategory>;
  description?: InputMaybe<Scalars['String']['input']>;
  dimension?: InputMaybe<MediaDimensionInput>;
  fileName: Scalars['String']['input'];
  length?: InputMaybe<Scalars['Int']['input']>;
  mediaType: MediaMimeType;
  originalFileName: Scalars['String']['input'];
  size: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type UploadMediaResponse = {
  __typename?: 'UploadMediaResponse';
  medias: Array<Media>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type UploadMediaResponseOrError = BaseResponse | ErrorResponse | UploadMediaResponse;

export type Ups = {
  __typename?: 'Ups';
  id: Scalars['ID']['output'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<UserAddress>;
  avatar?: Maybe<Media>;
  bio?: Maybe<Scalars['String']['output']>;
  canUpdatePermissions?: Maybe<Scalars['Boolean']['output']>;
  canUpdateRole?: Maybe<Scalars['Boolean']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAccountActivated?: Maybe<Scalars['Boolean']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  permissions: Array<PermissionSession>;
  phone?: Maybe<Scalars['String']['output']>;
  roles: Array<UserRoleObject>;
  tempUpdatedEmail?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type UserAddress = {
  __typename?: 'UserAddress';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

export type UserAddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
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
  token?: Maybe<Scalars['String']['output']>;
};

export type UserProfileUpdateResponseOrError = BaseResponse | ErrorResponse | UserProfileUpdateResponse;

export type UserResponse = {
  __typename?: 'UserResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  user: User;
};

export type UserRoleObject = {
  __typename?: 'UserRoleObject';
  defaultPermissions: Array<RolePermissionSession>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UserSession = {
  __typename?: 'UserSession';
  avatar?: Maybe<Scalars['ID']['output']>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAccountActivated: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  roles: Array<UserSessionRoleObject>;
  sessionId: Scalars['String']['output'];
};

export type UserSessionByEmail = {
  __typename?: 'UserSessionByEmail';
  address?: Maybe<UserAddress>;
  avatar?: Maybe<Scalars['ID']['output']>;
  bio: Scalars['String']['output'];
  canUpdatePermissions: Scalars['Boolean']['output'];
  canUpdateRole: Scalars['Boolean']['output'];
  company: Scalars['String']['output'];
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
  phone: Scalars['String']['output'];
  roles: Array<UserRoleObject>;
  tempEmailVerified: Scalars['Boolean']['output'];
  tempUpdatedEmail: Scalars['String']['output'];
  username: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type UserSessionById = {
  __typename?: 'UserSessionById';
  address?: Maybe<UserAddress>;
  avatar?: Maybe<Scalars['ID']['output']>;
  bio: Scalars['String']['output'];
  canUpdatePermissions: Scalars['Boolean']['output'];
  canUpdateRole: Scalars['Boolean']['output'];
  company: Scalars['String']['output'];
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
  phone: Scalars['String']['output'];
  roles: Array<UserRoleObject>;
  tempEmailVerified: Scalars['Boolean']['output'];
  tempUpdatedEmail: Scalars['String']['output'];
  username: Scalars['String']['output'];
  website: Scalars['String']['output'];
};

export type UserSessionRoleObject = {
  __typename?: 'UserSessionRoleObject';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type UsersResponse = {
  __typename?: 'UsersResponse';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
  users: Array<User>;
};

export enum WeightUnit {
  Carat = 'CARAT',
  Grain = 'GRAIN',
  Gram = 'GRAM',
  Kilogram = 'KILOGRAM',
  MetricTon = 'METRIC_TON',
  Milligram = 'MILLIGRAM',
  Ounce = 'OUNCE',
  Pound = 'POUND',
  Quintal = 'QUINTAL',
  Stone = 'STONE',
  Ton = 'TON'
}

export enum ProductConfigurationType {
  SimpleProduct = 'SIMPLE_PRODUCT',
  VariableProduct = 'VARIABLE_PRODUCT'
}



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
  CreateAddressBookResponseOrError: ( AddressResponseBook ) | ( BaseResponse ) | ( ErrorResponse );
  CreateBrandResponseOrError: ( BaseResponse ) | ( BrandResponse ) | ( ErrorResponse );
  CreateCategoryResponseOrError: ( BaseResponse ) | ( CategoryResponse ) | ( ErrorResponse );
  CreateProductResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  CreateProductReviewResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductReviewResponse );
  CreateRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  CreateShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  CreateShippingMethodResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingMethodResponse );
  CreateTagResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  CreateTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  CreateTaxExemptionResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxExemptionResponse );
  CreateTaxRateResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxRateResponse );
  DeleteAddressesBookResponseOrError: ( BaseResponse ) | ( DeleteAddressResponseBook ) | ( ErrorResponse );
  DeleteBrandResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteCategoryResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteProductResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteProductReviewResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteShippingMethodResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteTagResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  DeleteTaxExemptionResponseOrError: ( BaseResponse ) | ( DeleteTaxExemptionResponse ) | ( ErrorResponse );
  DeleteTaxRateResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  EmailVerificationResponseOrError: ( BaseResponse ) | ( EmailVerificationResponse ) | ( ErrorResponse );
  GetAddressBookByIdResponseOrError: ( AddressResponseBook ) | ( BaseResponse ) | ( ErrorResponse );
  GetAddressesBookResponseOrError: ( AddressesBookResponse ) | ( BaseResponse ) | ( ErrorResponse );
  GetBrandByIDResponseOrError: ( BaseResponse ) | ( BrandResponseById ) | ( ErrorResponse );
  GetBrandsResponseOrError: ( BaseResponse ) | ( BrandPaginationResponse ) | ( ErrorResponse );
  GetCategoriesResponseOrError: ( BaseResponse ) | ( CategoryPaginationResponse ) | ( ErrorResponse );
  GetCategoryByIDResponseOrError: ( BaseResponse ) | ( CategoryResponseById ) | ( ErrorResponse );
  GetMediaByIdResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediaResponse );
  GetMediasResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediasResponse );
  GetPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PersonalizedWithRolePermissionResponse );
  GetPersonalizedPermissionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( PermissionsResponse );
  GetProductByIdResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductResponse );
  GetProductReviewByIdResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductReviewResponse );
  GetProductReviewsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductReviewPaginationResponse );
  GetProductsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductPaginationResponse );
  GetProfileResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetRoleByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  GetRolesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RolesResponse );
  GetShippingClassByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  GetShippingClassesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassPaginationResponse );
  GetShippingMethodByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingMethodResponse );
  GetShippingMethodsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingMethodPaginationResponse );
  GetTagByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  GetTagsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagPaginationResponse );
  GetTaxClassByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  GetTaxClassesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassPaginationResponse );
  GetTaxExemptionsResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxExemptionResponse );
  GetTaxRateByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxRateResponse );
  GetTaxRatesResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxRatePaginationResponse );
  GetUserByIDResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserResponse );
  GetUserLoginInfoResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserLoginInfoResponse );
  GetUsersResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UsersResponse );
  RestoreBrandResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreCategoryResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreProductResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreProductReviewResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreShippingMethodResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreTagResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  RestoreTaxRateResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  UpdateAddressBookResponseOrError: ( AddressResponseBook ) | ( BaseResponse ) | ( ErrorResponse );
  UpdateBrandResponseOrError: ( BaseResponse ) | ( BrandResponse ) | ( ErrorResponse );
  UpdateCategoryResponseOrError: ( BaseResponse ) | ( CategoryResponse ) | ( ErrorResponse );
  UpdateMediaResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( MediaResponse );
  UpdateProductResponseOrError: ( BaseResponse ) | ( ErrorResponse );
  UpdateProductReviewResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ProductReviewResponse );
  UpdateRoleResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( RoleResponse );
  UpdateShippingClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingClassResponse );
  UpdateShippingMethodResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( ShippingMethodResponse );
  UpdateTagResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TagResponse );
  UpdateTaxClassResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxClassResponse );
  UpdateTaxExemptionResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxExemptionResponse );
  UpdateTaxRateResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( TaxRateResponse );
  UploadMediaResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UploadMediaResponse );
  UserLoginResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserLoginResponse );
  UserProfileUpdateResponseOrError: ( BaseResponse ) | ( ErrorResponse ) | ( UserProfileUpdateResponse );
};

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  ICategoryBase: ( Category );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ActiveAccountResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ActiveAccountResponseOrError']>;
  AddressBook: ResolverTypeWrapper<AddressBook>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  AddressResponseBook: ResolverTypeWrapper<AddressResponseBook>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  AddressType: AddressType;
  AddressesBookResponse: ResolverTypeWrapper<AddressesBookResponse>;
  AllowBackOrders: AllowBackOrders;
  BaseResponse: ResolverTypeWrapper<BaseResponse>;
  BaseResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['BaseResponseOrError']>;
  Brand: ResolverTypeWrapper<Brand>;
  BrandPaginationDataSession: ResolverTypeWrapper<BrandPaginationDataSession>;
  BrandPaginationResponse: ResolverTypeWrapper<BrandPaginationResponse>;
  BrandResponse: ResolverTypeWrapper<BrandResponse>;
  BrandResponseById: ResolverTypeWrapper<BrandResponseById>;
  Category: ResolverTypeWrapper<Category>;
  CategoryPaginationDataSession: ResolverTypeWrapper<CategoryPaginationDataSession>;
  CategoryPaginationResponse: ResolverTypeWrapper<CategoryPaginationResponse>;
  CategoryResponse: ResolverTypeWrapper<CategoryResponse>;
  CategoryResponseById: ResolverTypeWrapper<CategoryResponseById>;
  CreateAddressBookResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateAddressBookResponseOrError']>;
  CreateBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateBrandResponseOrError']>;
  CreateCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateCategoryResponseOrError']>;
  CreateProductResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateProductResponseOrError']>;
  CreateProductReviewResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateProductReviewResponseOrError']>;
  CreateRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateRoleResponseOrError']>;
  CreateShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateShippingClassResponseOrError']>;
  CreateShippingMethodResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateShippingMethodResponseOrError']>;
  CreateTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTagResponseOrError']>;
  CreateTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTaxClassResponseOrError']>;
  CreateTaxExemptionResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTaxExemptionResponseOrError']>;
  CreateTaxRateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CreateTaxRateResponseOrError']>;
  CreatedBy: ResolverTypeWrapper<CreatedBy>;
  DefaultWarrantyPeriod: DefaultWarrantyPeriod;
  DeleteAddressResponseBook: ResolverTypeWrapper<DeleteAddressResponseBook>;
  DeleteAddressesBookResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteAddressesBookResponseOrError']>;
  DeleteBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteBrandResponseOrError']>;
  DeleteCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteCategoryResponseOrError']>;
  DeleteProductResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteProductResponseOrError']>;
  DeleteProductReviewResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteProductReviewResponseOrError']>;
  DeleteShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteShippingClassResponseOrError']>;
  DeleteShippingMethodResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteShippingMethodResponseOrError']>;
  DeleteTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTagResponseOrError']>;
  DeleteTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTaxClassResponseOrError']>;
  DeleteTaxExemptionResponse: ResolverTypeWrapper<DeleteTaxExemptionResponse>;
  DeleteTaxExemptionResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTaxExemptionResponseOrError']>;
  DeleteTaxRateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['DeleteTaxRateResponseOrError']>;
  DimensionUnit: DimensionUnit;
  EmailVerificationResponse: ResolverTypeWrapper<EmailVerificationResponse>;
  EmailVerificationResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['EmailVerificationResponseOrError']>;
  ErrorResponse: ResolverTypeWrapper<ErrorResponse>;
  FieldError: ResolverTypeWrapper<FieldError>;
  FlatRate: ResolverTypeWrapper<FlatRate>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FreeShipping: ResolverTypeWrapper<FreeShipping>;
  Gender: Gender;
  GetAddressBookByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetAddressBookByIdResponseOrError']>;
  GetAddressesBookResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetAddressesBookResponseOrError']>;
  GetBrandByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetBrandByIDResponseOrError']>;
  GetBrandsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetBrandsResponseOrError']>;
  GetCategoriesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetCategoriesResponseOrError']>;
  GetCategoryByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetCategoryByIDResponseOrError']>;
  GetMediaByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediaByIdResponseOrError']>;
  GetMediasResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetMediasResponseOrError']>;
  GetPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPermissionsResponseOrError']>;
  GetPersonalizedPermissionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetPersonalizedPermissionsResponseOrError']>;
  GetProductByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProductByIdResponseOrError']>;
  GetProductReviewByIdResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProductReviewByIdResponseOrError']>;
  GetProductReviewsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProductReviewsResponseOrError']>;
  GetProductsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProductsResponseOrError']>;
  GetProfileResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetProfileResponseOrError']>;
  GetRoleByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleByIDResponseOrError']>;
  GetRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRoleResponseOrError']>;
  GetRolesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetRolesResponseOrError']>;
  GetShippingClassByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingClassByIDResponseOrError']>;
  GetShippingClassesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingClassesResponseOrError']>;
  GetShippingMethodByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingMethodByIDResponseOrError']>;
  GetShippingMethodsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetShippingMethodsResponseOrError']>;
  GetTagByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTagByIDResponseOrError']>;
  GetTagsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTagsResponseOrError']>;
  GetTaxClassByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxClassByIDResponseOrError']>;
  GetTaxClassesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxClassesResponseOrError']>;
  GetTaxExemptionsResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxExemptionsResponseOrError']>;
  GetTaxRateByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxRateByIDResponseOrError']>;
  GetTaxRatesResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetTaxRatesResponseOrError']>;
  GetUserByIDResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserByIDResponseOrError']>;
  GetUserLoginInfoResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUserLoginInfoResponseOrError']>;
  GetUsersResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['GetUsersResponseOrError']>;
  ICategoryBase: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['ICategoryBase']>;
  LocalPickUp: ResolverTypeWrapper<LocalPickUp>;
  LoginMeta: ResolverTypeWrapper<LoginMeta>;
  LoginMetaInput: LoginMetaInput;
  Media: ResolverTypeWrapper<Media>;
  MediaCategory: MediaCategory;
  MediaDimension: ResolverTypeWrapper<MediaDimension>;
  MediaDimensionInput: MediaDimensionInput;
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
  PricingTypeEnum: PricingTypeEnum;
  Product: ResolverTypeWrapper<Product>;
  ProductAttribute: ResolverTypeWrapper<ProductAttribute>;
  ProductAttributeInput: ProductAttributeInput;
  ProductAttributeValue: ResolverTypeWrapper<ProductAttributeValue>;
  ProductAttributeValueInput: ProductAttributeValueInput;
  ProductDeliveryType: ProductDeliveryType;
  ProductPaginationResponse: ResolverTypeWrapper<ProductPaginationResponse>;
  ProductPrice: ResolverTypeWrapper<ProductPrice>;
  ProductPriceInput: ProductPriceInput;
  ProductResponse: ResolverTypeWrapper<ProductResponse>;
  ProductReview: ResolverTypeWrapper<ProductReview>;
  ProductReviewInput: ProductReviewInput;
  ProductReviewPaginationResponse: ResolverTypeWrapper<ProductReviewPaginationResponse>;
  ProductReviewResponse: ResolverTypeWrapper<ProductReviewResponse>;
  ProductTieredPrice: ResolverTypeWrapper<ProductTieredPrice>;
  ProductTieredPriceInput: ProductTieredPriceInput;
  ProductVariation: ResolverTypeWrapper<ProductVariation>;
  ProductVariationAttribute: ResolverTypeWrapper<ProductVariationAttribute>;
  ProductVariationAttributeInput: ProductVariationAttributeInput;
  ProductVariationAttributeValue: ResolverTypeWrapper<ProductVariationAttributeValue>;
  ProductVariationAttributeValueInput: ProductVariationAttributeValueInput;
  ProductVariationInput: ProductVariationInput;
  Query: ResolverTypeWrapper<{}>;
  RestoreBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreBrandResponseOrError']>;
  RestoreCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreCategoryResponseOrError']>;
  RestoreProductResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreProductResponseOrError']>;
  RestoreProductReviewResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreProductReviewResponseOrError']>;
  RestoreShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreShippingClassResponseOrError']>;
  RestoreShippingMethodResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreShippingMethodResponseOrError']>;
  RestoreTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreTagResponseOrError']>;
  RestoreTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreTaxClassResponseOrError']>;
  RestoreTaxRateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['RestoreTaxRateResponseOrError']>;
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
  ShippingMethod: ResolverTypeWrapper<ShippingMethod>;
  ShippingMethodPaginationResponse: ResolverTypeWrapper<ShippingMethodPaginationResponse>;
  ShippingMethodResponse: ResolverTypeWrapper<ShippingMethodResponse>;
  SinglePermissionInput: SinglePermissionInput;
  StockStatus: StockStatus;
  Tag: ResolverTypeWrapper<Tag>;
  TagPaginationDataSession: ResolverTypeWrapper<TagPaginationDataSession>;
  TagPaginationResponse: ResolverTypeWrapper<TagPaginationResponse>;
  TagResponse: ResolverTypeWrapper<TagResponse>;
  TaxClass: ResolverTypeWrapper<TaxClass>;
  TaxClassPaginationDataSession: ResolverTypeWrapper<TaxClassPaginationDataSession>;
  TaxClassPaginationResponse: ResolverTypeWrapper<TaxClassPaginationResponse>;
  TaxClassResponse: ResolverTypeWrapper<TaxClassResponse>;
  TaxExemption: ResolverTypeWrapper<TaxExemption>;
  TaxExemptionResponse: ResolverTypeWrapper<TaxExemptionResponse>;
  TaxExemptionStatus: TaxExemptionStatus;
  TaxRate: ResolverTypeWrapper<TaxRate>;
  TaxRatePaginationResponse: ResolverTypeWrapper<TaxRatePaginationResponse>;
  TaxRateResponse: ResolverTypeWrapper<TaxRateResponse>;
  TaxRateSession: ResolverTypeWrapper<TaxRateSession>;
  TaxStatus: TaxStatus;
  UpdateAddressBookResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateAddressBookResponseOrError']>;
  UpdateBrandResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateBrandResponseOrError']>;
  UpdateCategoryResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateCategoryResponseOrError']>;
  UpdateMediaInput: UpdateMediaInput;
  UpdateMediaResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateMediaResponseOrError']>;
  UpdateProductResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateProductResponseOrError']>;
  UpdateProductReviewResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateProductReviewResponseOrError']>;
  UpdateRoleResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateRoleResponseOrError']>;
  UpdateShippingClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateShippingClassResponseOrError']>;
  UpdateShippingMethodResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateShippingMethodResponseOrError']>;
  UpdateTagResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTagResponseOrError']>;
  UpdateTaxClassResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTaxClassResponseOrError']>;
  UpdateTaxExemptionResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTaxExemptionResponseOrError']>;
  UpdateTaxRateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UpdateTaxRateResponseOrError']>;
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  UploadMediaResponse: ResolverTypeWrapper<UploadMediaResponse>;
  UploadMediaResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UploadMediaResponseOrError']>;
  Ups: ResolverTypeWrapper<Ups>;
  User: ResolverTypeWrapper<User>;
  UserAddress: ResolverTypeWrapper<UserAddress>;
  UserAddressInput: UserAddressInput;
  UserLoginInfoResponse: ResolverTypeWrapper<UserLoginInfoResponse>;
  UserLoginResponse: ResolverTypeWrapper<UserLoginResponse>;
  UserLoginResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserLoginResponseOrError']>;
  UserProfileUpdateResponse: ResolverTypeWrapper<UserProfileUpdateResponse>;
  UserProfileUpdateResponseOrError: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserProfileUpdateResponseOrError']>;
  UserResponse: ResolverTypeWrapper<UserResponse>;
  UserRoleObject: ResolverTypeWrapper<UserRoleObject>;
  UserSession: ResolverTypeWrapper<UserSession>;
  UserSessionByEmail: ResolverTypeWrapper<UserSessionByEmail>;
  UserSessionById: ResolverTypeWrapper<UserSessionById>;
  UserSessionRoleObject: ResolverTypeWrapper<UserSessionRoleObject>;
  UsersResponse: ResolverTypeWrapper<UsersResponse>;
  WeightUnit: WeightUnit;
  productConfigurationType: ProductConfigurationType;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ActiveAccountResponseOrError: ResolversUnionTypes<ResolversParentTypes>['ActiveAccountResponseOrError'];
  AddressBook: AddressBook;
  String: Scalars['String']['output'];
  ID: Scalars['ID']['output'];
  Boolean: Scalars['Boolean']['output'];
  AddressResponseBook: AddressResponseBook;
  Int: Scalars['Int']['output'];
  AddressesBookResponse: AddressesBookResponse;
  BaseResponse: BaseResponse;
  BaseResponseOrError: ResolversUnionTypes<ResolversParentTypes>['BaseResponseOrError'];
  Brand: Brand;
  BrandPaginationDataSession: BrandPaginationDataSession;
  BrandPaginationResponse: BrandPaginationResponse;
  BrandResponse: BrandResponse;
  BrandResponseById: BrandResponseById;
  Category: Category;
  CategoryPaginationDataSession: CategoryPaginationDataSession;
  CategoryPaginationResponse: CategoryPaginationResponse;
  CategoryResponse: CategoryResponse;
  CategoryResponseById: CategoryResponseById;
  CreateAddressBookResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateAddressBookResponseOrError'];
  CreateBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateBrandResponseOrError'];
  CreateCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateCategoryResponseOrError'];
  CreateProductResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateProductResponseOrError'];
  CreateProductReviewResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateProductReviewResponseOrError'];
  CreateRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateRoleResponseOrError'];
  CreateShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateShippingClassResponseOrError'];
  CreateShippingMethodResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateShippingMethodResponseOrError'];
  CreateTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTagResponseOrError'];
  CreateTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTaxClassResponseOrError'];
  CreateTaxExemptionResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTaxExemptionResponseOrError'];
  CreateTaxRateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['CreateTaxRateResponseOrError'];
  CreatedBy: CreatedBy;
  DeleteAddressResponseBook: DeleteAddressResponseBook;
  DeleteAddressesBookResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteAddressesBookResponseOrError'];
  DeleteBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteBrandResponseOrError'];
  DeleteCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteCategoryResponseOrError'];
  DeleteProductResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteProductResponseOrError'];
  DeleteProductReviewResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteProductReviewResponseOrError'];
  DeleteShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteShippingClassResponseOrError'];
  DeleteShippingMethodResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteShippingMethodResponseOrError'];
  DeleteTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTagResponseOrError'];
  DeleteTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTaxClassResponseOrError'];
  DeleteTaxExemptionResponse: DeleteTaxExemptionResponse;
  DeleteTaxExemptionResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTaxExemptionResponseOrError'];
  DeleteTaxRateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['DeleteTaxRateResponseOrError'];
  EmailVerificationResponse: EmailVerificationResponse;
  EmailVerificationResponseOrError: ResolversUnionTypes<ResolversParentTypes>['EmailVerificationResponseOrError'];
  ErrorResponse: ErrorResponse;
  FieldError: FieldError;
  FlatRate: FlatRate;
  Float: Scalars['Float']['output'];
  FreeShipping: FreeShipping;
  GetAddressBookByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetAddressBookByIdResponseOrError'];
  GetAddressesBookResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetAddressesBookResponseOrError'];
  GetBrandByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetBrandByIDResponseOrError'];
  GetBrandsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetBrandsResponseOrError'];
  GetCategoriesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetCategoriesResponseOrError'];
  GetCategoryByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetCategoryByIDResponseOrError'];
  GetMediaByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediaByIdResponseOrError'];
  GetMediasResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetMediasResponseOrError'];
  GetPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPermissionsResponseOrError'];
  GetPersonalizedPermissionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetPersonalizedPermissionsResponseOrError'];
  GetProductByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProductByIdResponseOrError'];
  GetProductReviewByIdResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProductReviewByIdResponseOrError'];
  GetProductReviewsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProductReviewsResponseOrError'];
  GetProductsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProductsResponseOrError'];
  GetProfileResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetProfileResponseOrError'];
  GetRoleByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleByIDResponseOrError'];
  GetRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRoleResponseOrError'];
  GetRolesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetRolesResponseOrError'];
  GetShippingClassByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingClassByIDResponseOrError'];
  GetShippingClassesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingClassesResponseOrError'];
  GetShippingMethodByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingMethodByIDResponseOrError'];
  GetShippingMethodsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetShippingMethodsResponseOrError'];
  GetTagByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTagByIDResponseOrError'];
  GetTagsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTagsResponseOrError'];
  GetTaxClassByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxClassByIDResponseOrError'];
  GetTaxClassesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxClassesResponseOrError'];
  GetTaxExemptionsResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxExemptionsResponseOrError'];
  GetTaxRateByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxRateByIDResponseOrError'];
  GetTaxRatesResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetTaxRatesResponseOrError'];
  GetUserByIDResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserByIDResponseOrError'];
  GetUserLoginInfoResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUserLoginInfoResponseOrError'];
  GetUsersResponseOrError: ResolversUnionTypes<ResolversParentTypes>['GetUsersResponseOrError'];
  ICategoryBase: ResolversInterfaceTypes<ResolversParentTypes>['ICategoryBase'];
  LocalPickUp: LocalPickUp;
  LoginMeta: LoginMeta;
  LoginMetaInput: LoginMetaInput;
  Media: Media;
  MediaDimension: MediaDimension;
  MediaDimensionInput: MediaDimensionInput;
  MediaResponse: MediaResponse;
  MediasResponse: MediasResponse;
  Mutation: {};
  PermissionAgainstRoleInput: PermissionAgainstRoleInput;
  PermissionSession: PermissionSession;
  Permissions: Permissions;
  PermissionsResponse: PermissionsResponse;
  PersonalizedWithRolePermissionResponse: PersonalizedWithRolePermissionResponse;
  Product: Product;
  ProductAttribute: ProductAttribute;
  ProductAttributeInput: ProductAttributeInput;
  ProductAttributeValue: ProductAttributeValue;
  ProductAttributeValueInput: ProductAttributeValueInput;
  ProductPaginationResponse: ProductPaginationResponse;
  ProductPrice: ProductPrice;
  ProductPriceInput: ProductPriceInput;
  ProductResponse: ProductResponse;
  ProductReview: ProductReview;
  ProductReviewInput: ProductReviewInput;
  ProductReviewPaginationResponse: ProductReviewPaginationResponse;
  ProductReviewResponse: ProductReviewResponse;
  ProductTieredPrice: ProductTieredPrice;
  ProductTieredPriceInput: ProductTieredPriceInput;
  ProductVariation: ProductVariation;
  ProductVariationAttribute: ProductVariationAttribute;
  ProductVariationAttributeInput: ProductVariationAttributeInput;
  ProductVariationAttributeValue: ProductVariationAttributeValue;
  ProductVariationAttributeValueInput: ProductVariationAttributeValueInput;
  ProductVariationInput: ProductVariationInput;
  Query: {};
  RestoreBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreBrandResponseOrError'];
  RestoreCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreCategoryResponseOrError'];
  RestoreProductResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreProductResponseOrError'];
  RestoreProductReviewResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreProductReviewResponseOrError'];
  RestoreShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreShippingClassResponseOrError'];
  RestoreShippingMethodResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreShippingMethodResponseOrError'];
  RestoreTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreTagResponseOrError'];
  RestoreTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreTaxClassResponseOrError'];
  RestoreTaxRateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['RestoreTaxRateResponseOrError'];
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
  ShippingMethod: ShippingMethod;
  ShippingMethodPaginationResponse: ShippingMethodPaginationResponse;
  ShippingMethodResponse: ShippingMethodResponse;
  SinglePermissionInput: SinglePermissionInput;
  Tag: Tag;
  TagPaginationDataSession: TagPaginationDataSession;
  TagPaginationResponse: TagPaginationResponse;
  TagResponse: TagResponse;
  TaxClass: TaxClass;
  TaxClassPaginationDataSession: TaxClassPaginationDataSession;
  TaxClassPaginationResponse: TaxClassPaginationResponse;
  TaxClassResponse: TaxClassResponse;
  TaxExemption: TaxExemption;
  TaxExemptionResponse: TaxExemptionResponse;
  TaxRate: TaxRate;
  TaxRatePaginationResponse: TaxRatePaginationResponse;
  TaxRateResponse: TaxRateResponse;
  TaxRateSession: TaxRateSession;
  UpdateAddressBookResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateAddressBookResponseOrError'];
  UpdateBrandResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateBrandResponseOrError'];
  UpdateCategoryResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateCategoryResponseOrError'];
  UpdateMediaInput: UpdateMediaInput;
  UpdateMediaResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateMediaResponseOrError'];
  UpdateProductResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateProductResponseOrError'];
  UpdateProductReviewResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateProductReviewResponseOrError'];
  UpdateRoleResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateRoleResponseOrError'];
  UpdateShippingClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateShippingClassResponseOrError'];
  UpdateShippingMethodResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateShippingMethodResponseOrError'];
  UpdateTagResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTagResponseOrError'];
  UpdateTaxClassResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTaxClassResponseOrError'];
  UpdateTaxExemptionResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTaxExemptionResponseOrError'];
  UpdateTaxRateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UpdateTaxRateResponseOrError'];
  UpdateUserPermissionInput: UpdateUserPermissionInput;
  UploadMediaInput: UploadMediaInput;
  UploadMediaResponse: UploadMediaResponse;
  UploadMediaResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UploadMediaResponseOrError'];
  Ups: Ups;
  User: User;
  UserAddress: UserAddress;
  UserAddressInput: UserAddressInput;
  UserLoginInfoResponse: UserLoginInfoResponse;
  UserLoginResponse: UserLoginResponse;
  UserLoginResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserLoginResponseOrError'];
  UserProfileUpdateResponse: UserProfileUpdateResponse;
  UserProfileUpdateResponseOrError: ResolversUnionTypes<ResolversParentTypes>['UserProfileUpdateResponseOrError'];
  UserResponse: UserResponse;
  UserRoleObject: UserRoleObject;
  UserSession: UserSession;
  UserSessionByEmail: UserSessionByEmail;
  UserSessionById: UserSessionById;
  UserSessionRoleObject: UserSessionRoleObject;
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

export type AddressBookResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressBook'] = ResolversParentTypes['AddressBook']> = {
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  company?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isDefault?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetOne?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  streetTwo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['AddressType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressResponseBookResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressResponseBook'] = ResolversParentTypes['AddressResponseBook']> = {
  addressBook?: Resolver<ResolversTypes['AddressBook'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddressesBookResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AddressesBookResponse'] = ResolversParentTypes['AddressesBookResponse']> = {
  addressBook?: Resolver<Array<ResolversTypes['AddressBook']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BrandPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BrandPaginationDataSession'] = ResolversParentTypes['BrandPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentCategory?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subCategories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryPaginationDataSession'] = ResolversParentTypes['CategoryPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentCategory?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subCategories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  totalProducts?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryPaginationResponse'] = ResolversParentTypes['CategoryPaginationResponse']> = {
  categories?: Resolver<Array<ResolversTypes['CategoryPaginationDataSession']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CategoryResponse'] = ResolversParentTypes['CategoryResponse']> = {
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType>;
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

export type CreateAddressBookResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateAddressBookResponseOrError'] = ResolversParentTypes['CreateAddressBookResponseOrError']> = {
  __resolveType: TypeResolveFn<'AddressResponseBook' | 'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CreateBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateBrandResponseOrError'] = ResolversParentTypes['CreateBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CreateCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateCategoryResponseOrError'] = ResolversParentTypes['CreateCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CreateProductResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateProductResponseOrError'] = ResolversParentTypes['CreateProductResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type CreateProductReviewResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateProductReviewResponseOrError'] = ResolversParentTypes['CreateProductReviewResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductReviewResponse', ParentType, ContextType>;
};

export type CreateRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateRoleResponseOrError'] = ResolversParentTypes['CreateRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type CreateShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateShippingClassResponseOrError'] = ResolversParentTypes['CreateShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassResponse', ParentType, ContextType>;
};

export type CreateShippingMethodResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateShippingMethodResponseOrError'] = ResolversParentTypes['CreateShippingMethodResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingMethodResponse', ParentType, ContextType>;
};

export type CreateTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTagResponseOrError'] = ResolversParentTypes['CreateTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagResponse', ParentType, ContextType>;
};

export type CreateTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTaxClassResponseOrError'] = ResolversParentTypes['CreateTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassResponse', ParentType, ContextType>;
};

export type CreateTaxExemptionResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTaxExemptionResponseOrError'] = ResolversParentTypes['CreateTaxExemptionResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxExemptionResponse', ParentType, ContextType>;
};

export type CreateTaxRateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreateTaxRateResponseOrError'] = ResolversParentTypes['CreateTaxRateResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxRateResponse', ParentType, ContextType>;
};

export type CreatedByResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CreatedBy'] = ResolversParentTypes['CreatedBy']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserRoleObject']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteAddressResponseBookResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteAddressResponseBook'] = ResolversParentTypes['DeleteAddressResponseBook']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  newDefaultAddressId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteAddressesBookResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteAddressesBookResponseOrError'] = ResolversParentTypes['DeleteAddressesBookResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'DeleteAddressResponseBook' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteBrandResponseOrError'] = ResolversParentTypes['DeleteBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteCategoryResponseOrError'] = ResolversParentTypes['DeleteCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteProductResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteProductResponseOrError'] = ResolversParentTypes['DeleteProductResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteProductReviewResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteProductReviewResponseOrError'] = ResolversParentTypes['DeleteProductReviewResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteShippingClassResponseOrError'] = ResolversParentTypes['DeleteShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteShippingMethodResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteShippingMethodResponseOrError'] = ResolversParentTypes['DeleteShippingMethodResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTagResponseOrError'] = ResolversParentTypes['DeleteTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTaxClassResponseOrError'] = ResolversParentTypes['DeleteTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTaxExemptionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTaxExemptionResponse'] = ResolversParentTypes['DeleteTaxExemptionResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteTaxExemptionResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTaxExemptionResponseOrError'] = ResolversParentTypes['DeleteTaxExemptionResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'DeleteTaxExemptionResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type DeleteTaxRateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DeleteTaxRateResponseOrError'] = ResolversParentTypes['DeleteTaxRateResponseOrError']> = {
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
  __resolveType: TypeResolveFn<'BaseResponse' | 'EmailVerificationResponse' | 'ErrorResponse', ParentType, ContextType>;
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

export type FlatRateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FlatRate'] = ResolversParentTypes['FlatRate']> = {
  cost?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FreeShippingResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FreeShipping'] = ResolversParentTypes['FreeShipping']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetAddressBookByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetAddressBookByIdResponseOrError'] = ResolversParentTypes['GetAddressBookByIdResponseOrError']> = {
  __resolveType: TypeResolveFn<'AddressResponseBook' | 'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type GetAddressesBookResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetAddressesBookResponseOrError'] = ResolversParentTypes['GetAddressesBookResponseOrError']> = {
  __resolveType: TypeResolveFn<'AddressesBookResponse' | 'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
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

export type GetProductByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProductByIdResponseOrError'] = ResolversParentTypes['GetProductByIdResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductResponse', ParentType, ContextType>;
};

export type GetProductReviewByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProductReviewByIdResponseOrError'] = ResolversParentTypes['GetProductReviewByIdResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductReviewResponse', ParentType, ContextType>;
};

export type GetProductReviewsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProductReviewsResponseOrError'] = ResolversParentTypes['GetProductReviewsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductReviewPaginationResponse', ParentType, ContextType>;
};

export type GetProductsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetProductsResponseOrError'] = ResolversParentTypes['GetProductsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductPaginationResponse', ParentType, ContextType>;
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

export type GetShippingMethodByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetShippingMethodByIDResponseOrError'] = ResolversParentTypes['GetShippingMethodByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingMethodResponse', ParentType, ContextType>;
};

export type GetShippingMethodsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetShippingMethodsResponseOrError'] = ResolversParentTypes['GetShippingMethodsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingMethodPaginationResponse', ParentType, ContextType>;
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

export type GetTaxExemptionsResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTaxExemptionsResponseOrError'] = ResolversParentTypes['GetTaxExemptionsResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxExemptionResponse', ParentType, ContextType>;
};

export type GetTaxRateByIdResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTaxRateByIDResponseOrError'] = ResolversParentTypes['GetTaxRateByIDResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxRateResponse', ParentType, ContextType>;
};

export type GetTaxRatesResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GetTaxRatesResponseOrError'] = ResolversParentTypes['GetTaxRatesResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxRatePaginationResponse', ParentType, ContextType>;
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

export type ICategoryBaseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ICategoryBase'] = ResolversParentTypes['ICategoryBase']> = {
  __resolveType: TypeResolveFn<'Category', ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
};

export type LocalPickUpResolvers<ContextType = Context, ParentType extends ResolversParentTypes['LocalPickUp'] = ResolversParentTypes['LocalPickUp']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dimension?: Resolver<Maybe<ResolversTypes['MediaDimension']>, ParentType, ContextType>;
  fileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mediaType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MediaDimensionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MediaDimension'] = ResolversParentTypes['MediaDimension']> = {
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  createAddressBookEntry?: Resolver<ResolversTypes['CreateAddressBookResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateAddressBookEntryArgs, 'city' | 'company' | 'country' | 'isDefault' | 'state' | 'streetOne' | 'streetTwo' | 'type' | 'userId' | 'zip'>>;
  createBrand?: Resolver<ResolversTypes['CreateBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateBrandArgs, 'name' | 'slug'>>;
  createCategory?: Resolver<ResolversTypes['CreateCategoryResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateCategoryArgs, 'name' | 'slug'>>;
  createProduct?: Resolver<ResolversTypes['CreateProductResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateProductArgs, 'defaultMainDescription' | 'isCustomized' | 'name' | 'productConfigurationType' | 'regularPrice' | 'saleQuantityUnit' | 'slug' | 'taxClassId'>>;
  createReview?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createShippingClass?: Resolver<ResolversTypes['CreateShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateShippingClassArgs, 'value'>>;
  createShippingMethod?: Resolver<ResolversTypes['CreateShippingMethodResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateShippingMethodArgs, 'title'>>;
  createTag?: Resolver<ResolversTypes['CreateTagResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTagArgs, 'name' | 'slug'>>;
  createTaxClass?: Resolver<ResolversTypes['CreateTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTaxClassArgs, 'value'>>;
  createTaxExemptionEntry?: Resolver<ResolversTypes['CreateTaxExemptionResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTaxExemptionEntryArgs, 'assumptionReason' | 'expiryDate' | 'taxCertificate' | 'taxNumber' | 'userId'>>;
  createTaxRate?: Resolver<ResolversTypes['CreateTaxRateResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateTaxRateArgs, 'country' | 'label' | 'rate' | 'taxClassId'>>;
  createUserRole?: Resolver<ResolversTypes['CreateRoleResponseOrError'], ParentType, ContextType, RequireFields<MutationCreateUserRoleArgs, 'name'>>;
  deleteAddressBookEntry?: Resolver<ResolversTypes['DeleteAddressesBookResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteAddressBookEntryArgs, 'id' | 'userId'>>;
  deleteBrand?: Resolver<ResolversTypes['DeleteBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteBrandArgs, 'ids' | 'skipTrash'>>;
  deleteCategory?: Resolver<Maybe<ResolversTypes['DeleteCategoryResponseOrError']>, ParentType, ContextType, RequireFields<MutationDeleteCategoryArgs, 'ids'>>;
  deleteLoginSession?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteLoginSessionArgs, 'sessionIds'>>;
  deleteMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteMediaFilesArgs, 'ids' | 'skipTrash'>>;
  deleteProduct?: Resolver<ResolversTypes['DeleteProductResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteProductArgs, 'ids' | 'skipTrash'>>;
  deleteShippingClass?: Resolver<ResolversTypes['DeleteShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteShippingClassArgs, 'ids' | 'skipTrash'>>;
  deleteShippingMethod?: Resolver<ResolversTypes['DeleteShippingMethodResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteShippingMethodArgs, 'id'>>;
  deleteTag?: Resolver<ResolversTypes['DeleteTagResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteTagArgs, 'ids' | 'skipTrash'>>;
  deleteTaxClass?: Resolver<ResolversTypes['DeleteTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteTaxClassArgs, 'ids' | 'skipTrash'>>;
  deleteTaxRate?: Resolver<ResolversTypes['DeleteTaxRateResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteTaxRateArgs, 'ids' | 'skipTrash'>>;
  deleteUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationDeleteUserRoleArgs, 'ids' | 'skipTrash'>>;
  forgetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationForgetPasswordArgs, 'email'>>;
  login?: Resolver<ResolversTypes['UserLoginResponseOrError'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'email' | 'meta' | 'password'>>;
  logout?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType>;
  register?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'email' | 'firstName' | 'lastName' | 'password' | 'username'>>;
  resetPassword?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'newPassword' | 'token'>>;
  restoreBrands?: Resolver<ResolversTypes['RestoreBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreBrandsArgs, 'ids'>>;
  restoreCategory?: Resolver<Maybe<ResolversTypes['RestoreCategoryResponseOrError']>, ParentType, ContextType, RequireFields<MutationRestoreCategoryArgs, 'ids'>>;
  restoreMediaFiles?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreMediaFilesArgs, 'ids'>>;
  restoreProducts?: Resolver<ResolversTypes['RestoreProductResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreProductsArgs, 'ids'>>;
  restoreShippingClasses?: Resolver<ResolversTypes['RestoreShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreShippingClassesArgs, 'ids'>>;
  restoreShippingMethod?: Resolver<ResolversTypes['RestoreShippingMethodResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreShippingMethodArgs, 'id'>>;
  restoreTags?: Resolver<ResolversTypes['RestoreTagResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreTagsArgs, 'ids'>>;
  restoreTaxClasses?: Resolver<ResolversTypes['RestoreTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreTaxClassesArgs, 'ids'>>;
  restoreTaxRates?: Resolver<ResolversTypes['RestoreTaxRateResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreTaxRatesArgs, 'ids'>>;
  restoreUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationRestoreUserRoleArgs, 'ids'>>;
  updateAddressBookEntry?: Resolver<ResolversTypes['UpdateAddressBookResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateAddressBookEntryArgs, 'id' | 'userId'>>;
  updateBrand?: Resolver<ResolversTypes['UpdateBrandResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateBrandArgs, 'id'>>;
  updateCategory?: Resolver<ResolversTypes['UpdateCategoryResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateCategoryArgs, 'id'>>;
  updateCategoryPosition?: Resolver<ResolversTypes['UpdateCategoryResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateCategoryPositionArgs, 'id' | 'position'>>;
  updateMediaFileInfo?: Resolver<ResolversTypes['UpdateMediaResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateMediaFileInfoArgs, 'inputs'>>;
  updateProduct?: Resolver<ResolversTypes['UpdateProductResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateProductArgs, 'id'>>;
  updateProfile?: Resolver<ResolversTypes['UserProfileUpdateResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'userId'>>;
  updateShippingClass?: Resolver<ResolversTypes['UpdateShippingClassResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateShippingClassArgs, 'id'>>;
  updateShippingMethod?: Resolver<ResolversTypes['UpdateShippingMethodResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateShippingMethodArgs, 'id'>>;
  updateTag?: Resolver<ResolversTypes['UpdateTagResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'id'>>;
  updateTaxClass?: Resolver<ResolversTypes['UpdateTaxClassResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTaxClassArgs, 'id'>>;
  updateTaxExemptionEntry?: Resolver<ResolversTypes['UpdateTaxExemptionResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTaxExemptionEntryArgs, 'id' | 'userId'>>;
  updateTaxRate?: Resolver<ResolversTypes['UpdateTaxRateResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateTaxRateArgs, 'id' | 'taxClassId'>>;
  updateUserPermission?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserPermissionArgs, 'input'>>;
  updateUserRole?: Resolver<ResolversTypes['BaseResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleArgs, 'userId'>>;
  updateUserRoleInfo?: Resolver<ResolversTypes['UpdateRoleResponseOrError'], ParentType, ContextType, RequireFields<MutationUpdateUserRoleInfoArgs, 'id'>>;
  uploadMediaFiles?: Resolver<ResolversTypes['UploadMediaResponseOrError'], ParentType, ContextType, RequireFields<MutationUploadMediaFilesArgs, 'inputs'>>;
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
  allowBackOrders?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attributes?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProductAttribute']>>>, ParentType, ContextType>;
  brands?: Resolver<Maybe<Array<ResolversTypes['Brand']>>, ParentType, ContextType>;
  categories?: Resolver<Maybe<Array<ResolversTypes['Category']>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  crossSells?: Resolver<Maybe<Array<ResolversTypes['Product']>>, ParentType, ContextType>;
  customBadge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultImage?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  defaultMainDescription?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  defaultShortDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultTags?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  defaultWarrantyPeriod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dimensionUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enableReviews?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  images?: Resolver<Maybe<Array<ResolversTypes['Media']>>, ParentType, ContextType>;
  initialNumberInStock?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isCustomized?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPreview?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isVisible?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lowStockThresHold?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  manageStock?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  model?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productConfigurationType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  productDeliveryType?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  purchaseNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantityStep?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  regularPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  reviews?: Resolver<Maybe<Array<ResolversTypes['ProductReview']>>, ParentType, ContextType>;
  salePrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  salePriceEndAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  salePriceStartAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  saleQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  saleQuantityUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shippingClass?: Resolver<Maybe<ResolversTypes['ShippingClass']>, ParentType, ContextType>;
  sku?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  soldIndividually?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  stockQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stockStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['Tag']>>, ParentType, ContextType>;
  taxClass?: Resolver<Maybe<ResolversTypes['TaxClass']>, ParentType, ContextType>;
  taxStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tierPricingInfo?: Resolver<Maybe<ResolversTypes['ProductPrice']>, ParentType, ContextType>;
  upsells?: Resolver<Maybe<Array<ResolversTypes['Product']>>, ParentType, ContextType>;
  variations?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProductVariation']>>>, ParentType, ContextType>;
  videos?: Resolver<Maybe<Array<ResolversTypes['Media']>>, ParentType, ContextType>;
  warrantyDigit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  warrantyPolicy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductAttributeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductAttribute'] = ResolversParentTypes['ProductAttribute']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isVisible?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['ProductAttributeValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductAttributeValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductAttributeValue'] = ResolversParentTypes['ProductAttributeValue']> = {
  attribute?: Resolver<ResolversTypes['ProductAttribute'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductPaginationResponse'] = ResolversParentTypes['ProductPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductPriceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductPrice'] = ResolversParentTypes['ProductPrice']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pricingType?: Resolver<ResolversTypes['PricingTypeEnum'], ParentType, ContextType>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType>;
  productVariation?: Resolver<Maybe<ResolversTypes['ProductVariation']>, ParentType, ContextType>;
  tieredPrices?: Resolver<Array<ResolversTypes['ProductTieredPrice']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductResponse'] = ResolversParentTypes['ProductResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductReviewResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductReview'] = ResolversParentTypes['ProductReview']> = {
  comment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guestEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  guestName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isApproved?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  rating?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reviewedBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductReviewPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductReviewPaginationResponse'] = ResolversParentTypes['ProductReviewPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reviews?: Resolver<Array<ResolversTypes['ProductReview']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductReviewResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductReviewResponse'] = ResolversParentTypes['ProductReviewResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  reviews?: Resolver<ResolversTypes['ProductReview'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductTieredPriceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductTieredPrice'] = ResolversParentTypes['ProductTieredPrice']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fixedPrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  maxQuantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  minQuantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  percentageDiscount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  productPrice?: Resolver<Maybe<ResolversTypes['ProductPrice']>, ParentType, ContextType>;
  quantityUnit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductVariationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductVariation'] = ResolversParentTypes['ProductVariation']> = {
  attributeValues?: Resolver<Array<ResolversTypes['ProductVariationAttributeValue']>, ParentType, ContextType>;
  brands?: Resolver<Maybe<Array<ResolversTypes['Brand']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  defaultWarrantyPeriod?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dimensionUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<ResolversTypes['Media']>>, ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  maxQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minQuantity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  productDeliveryType?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  quantityStep?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  regularPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  salePrice?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  salePriceEndAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  salePriceStartAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shippingClass?: Resolver<Maybe<ResolversTypes['ShippingClass']>, ParentType, ContextType>;
  sku?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stockStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taxClass?: Resolver<Maybe<ResolversTypes['TaxClass']>, ParentType, ContextType>;
  taxStatus?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tierPricingInfo?: Resolver<Maybe<ResolversTypes['ProductPrice']>, ParentType, ContextType>;
  videos?: Resolver<Maybe<Array<ResolversTypes['Media']>>, ParentType, ContextType>;
  warrantyDigit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  warrantyPolicy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightUnit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductVariationAttributeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductVariationAttribute'] = ResolversParentTypes['ProductVariationAttribute']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  values?: Resolver<Array<ResolversTypes['ProductVariationAttributeValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductVariationAttributeValueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ProductVariationAttributeValue'] = ResolversParentTypes['ProductVariationAttributeValue']> = {
  attribute?: Resolver<ResolversTypes['ProductVariationAttribute'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  variation?: Resolver<ResolversTypes['ProductVariation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getAddressBookEntryById?: Resolver<ResolversTypes['GetAddressBookByIdResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAddressBookEntryByIdArgs, 'id' | 'userId'>>;
  getAddressEntires?: Resolver<ResolversTypes['GetAddressesBookResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAddressEntiresArgs, 'type' | 'userId'>>;
  getAllBrands?: Resolver<ResolversTypes['GetBrandsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllBrandsArgs, 'limit' | 'page'>>;
  getAllCategories?: Resolver<ResolversTypes['GetCategoriesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllCategoriesArgs, 'limit' | 'page'>>;
  getAllMedias?: Resolver<ResolversTypes['GetMediasResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllMediasArgs, 'limit' | 'page'>>;
  getAllPermissionsByUserId?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllPermissionsByUserIdArgs, 'id'>>;
  getAllProducts?: Resolver<ResolversTypes['GetProductsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllProductsArgs, 'limit' | 'page'>>;
  getAllRoles?: Resolver<ResolversTypes['GetRolesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllRolesArgs, 'limit' | 'page'>>;
  getAllShippingClass?: Resolver<ResolversTypes['GetShippingClassesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllShippingClassArgs, 'limit' | 'page'>>;
  getAllShippingMethods?: Resolver<ResolversTypes['GetShippingMethodsResponseOrError'], ParentType, ContextType, Partial<QueryGetAllShippingMethodsArgs>>;
  getAllTags?: Resolver<ResolversTypes['GetTagsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllTagsArgs, 'limit' | 'page'>>;
  getAllTaxClass?: Resolver<ResolversTypes['GetTaxClassesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllTaxClassArgs, 'limit' | 'page'>>;
  getAllTaxRates?: Resolver<ResolversTypes['GetTaxRatesResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllTaxRatesArgs, 'limit' | 'page' | 'taxClassId'>>;
  getAllUsers?: Resolver<ResolversTypes['GetUsersResponseOrError'], ParentType, ContextType, RequireFields<QueryGetAllUsersArgs, 'limit' | 'page'>>;
  getBrandById?: Resolver<ResolversTypes['GetBrandByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetBrandByIdArgs, 'id'>>;
  getCategoryById?: Resolver<ResolversTypes['GetCategoryByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetCategoryByIdArgs, 'id'>>;
  getMediaById?: Resolver<ResolversTypes['GetMediaByIdResponseOrError'], ParentType, ContextType, RequireFields<QueryGetMediaByIdArgs, 'id'>>;
  getOwnPersonalizedPermissions?: Resolver<ResolversTypes['GetPermissionsResponseOrError'], ParentType, ContextType>;
  getProduct?: Resolver<ResolversTypes['GetProductByIdResponseOrError'], ParentType, ContextType, RequireFields<QueryGetProductArgs, 'id'>>;
  getProfile?: Resolver<ResolversTypes['GetProfileResponseOrError'], ParentType, ContextType>;
  getReview?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  getRoleById?: Resolver<ResolversTypes['GetRoleByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetRoleByIdArgs, 'id'>>;
  getShippingClassById?: Resolver<ResolversTypes['GetShippingClassByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetShippingClassByIdArgs, 'id'>>;
  getShippingMethodById?: Resolver<ResolversTypes['GetShippingMethodByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetShippingMethodByIdArgs, 'id'>>;
  getTagById?: Resolver<ResolversTypes['GetTagByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTagByIdArgs, 'id'>>;
  getTaxClassById?: Resolver<ResolversTypes['GetTaxClassByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTaxClassByIdArgs, 'id'>>;
  getTaxExemptionEntryByUserId?: Resolver<ResolversTypes['GetTaxExemptionsResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTaxExemptionEntryByUserIdArgs, 'userId'>>;
  getTaxRateById?: Resolver<ResolversTypes['GetTaxRateByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetTaxRateByIdArgs, 'id'>>;
  getUserById?: Resolver<ResolversTypes['GetUserByIDResponseOrError'], ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
  getUserOwnLoginInfo?: Resolver<ResolversTypes['GetUserLoginInfoResponseOrError'], ParentType, ContextType>;
};

export type RestoreBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreBrandResponseOrError'] = ResolversParentTypes['RestoreBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreCategoryResponseOrError'] = ResolversParentTypes['RestoreCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreProductResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreProductResponseOrError'] = ResolversParentTypes['RestoreProductResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreProductReviewResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreProductReviewResponseOrError'] = ResolversParentTypes['RestoreProductReviewResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreShippingClassResponseOrError'] = ResolversParentTypes['RestoreShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreShippingMethodResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreShippingMethodResponseOrError'] = ResolversParentTypes['RestoreShippingMethodResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreTagResponseOrError'] = ResolversParentTypes['RestoreTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreTaxClassResponseOrError'] = ResolversParentTypes['RestoreTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type RestoreTaxRateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RestoreTaxRateResponseOrError'] = ResolversParentTypes['RestoreTaxRateResponseOrError']> = {
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
  role?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RoleSession'] = ResolversParentTypes['RoleSession']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['CreatedBy']>, ParentType, ContextType>;
  defaultPermissions?: Resolver<Array<ResolversTypes['RolePermissionSession']>, ParentType, ContextType>;
  deletedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  systemDeleteProtection?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingClassPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingClassPaginationDataSession'] = ResolversParentTypes['ShippingClassPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
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

export type ShippingMethodResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingMethod'] = ResolversParentTypes['ShippingMethod']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  flatRate?: Resolver<Maybe<ResolversTypes['FlatRate']>, ParentType, ContextType>;
  freeShipping?: Resolver<Maybe<ResolversTypes['FreeShipping']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  localPickUp?: Resolver<Maybe<ResolversTypes['LocalPickUp']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ups?: Resolver<Maybe<ResolversTypes['Ups']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingMethodPaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingMethodPaginationResponse'] = ResolversParentTypes['ShippingMethodPaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shippingMethods?: Resolver<Array<ResolversTypes['ShippingMethod']>, ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShippingMethodResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ShippingMethodResponse'] = ResolversParentTypes['ShippingMethodResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  shippingMethod?: Resolver<ResolversTypes['ShippingMethod'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagPaginationDataSession'] = ResolversParentTypes['TagPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
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
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxClassPaginationDataSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxClassPaginationDataSession'] = ResolversParentTypes['TaxClassPaginationDataSession']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
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

export type TaxExemptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxExemption'] = ResolversParentTypes['TaxExemption']> = {
  assumptionReason?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiryDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TaxExemptionStatus'], ParentType, ContextType>;
  taxCertificate?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  taxNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxExemptionResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxExemptionResponse'] = ResolversParentTypes['TaxExemptionResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxExemption?: Resolver<ResolversTypes['TaxExemption'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxRateResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxRate'] = ResolversParentTypes['TaxRate']> = {
  appliesToShipping?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompound?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  postcode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxRatePaginationResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxRatePaginationResponse'] = ResolversParentTypes['TaxRatePaginationResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxRates?: Resolver<Array<ResolversTypes['TaxRate']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxRateResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxRateResponse'] = ResolversParentTypes['TaxRateResponse']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxRate?: Resolver<ResolversTypes['TaxRateSession'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaxRateSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TaxRateSession'] = ResolversParentTypes['TaxRateSession']> = {
  appliesToShipping?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<ResolversTypes['CreatedBy'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isCompound?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  postcode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taxClassId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateAddressBookResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateAddressBookResponseOrError'] = ResolversParentTypes['UpdateAddressBookResponseOrError']> = {
  __resolveType: TypeResolveFn<'AddressResponseBook' | 'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type UpdateBrandResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateBrandResponseOrError'] = ResolversParentTypes['UpdateBrandResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'BrandResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type UpdateCategoryResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateCategoryResponseOrError'] = ResolversParentTypes['UpdateCategoryResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'CategoryResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type UpdateMediaResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateMediaResponseOrError'] = ResolversParentTypes['UpdateMediaResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'MediaResponse', ParentType, ContextType>;
};

export type UpdateProductResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateProductResponseOrError'] = ResolversParentTypes['UpdateProductResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse', ParentType, ContextType>;
};

export type UpdateProductReviewResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateProductReviewResponseOrError'] = ResolversParentTypes['UpdateProductReviewResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ProductReviewResponse', ParentType, ContextType>;
};

export type UpdateRoleResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateRoleResponseOrError'] = ResolversParentTypes['UpdateRoleResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'RoleResponse', ParentType, ContextType>;
};

export type UpdateShippingClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateShippingClassResponseOrError'] = ResolversParentTypes['UpdateShippingClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingClassResponse', ParentType, ContextType>;
};

export type UpdateShippingMethodResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateShippingMethodResponseOrError'] = ResolversParentTypes['UpdateShippingMethodResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'ShippingMethodResponse', ParentType, ContextType>;
};

export type UpdateTagResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTagResponseOrError'] = ResolversParentTypes['UpdateTagResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TagResponse', ParentType, ContextType>;
};

export type UpdateTaxClassResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTaxClassResponseOrError'] = ResolversParentTypes['UpdateTaxClassResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxClassResponse', ParentType, ContextType>;
};

export type UpdateTaxExemptionResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTaxExemptionResponseOrError'] = ResolversParentTypes['UpdateTaxExemptionResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxExemptionResponse', ParentType, ContextType>;
};

export type UpdateTaxRateResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UpdateTaxRateResponseOrError'] = ResolversParentTypes['UpdateTaxRateResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'TaxRateResponse', ParentType, ContextType>;
};

export type UploadMediaResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UploadMediaResponse'] = ResolversParentTypes['UploadMediaResponse']> = {
  medias?: Resolver<Array<ResolversTypes['Media']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadMediaResponseOrErrorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UploadMediaResponseOrError'] = ResolversParentTypes['UploadMediaResponseOrError']> = {
  __resolveType: TypeResolveFn<'BaseResponse' | 'ErrorResponse' | 'UploadMediaResponse', ParentType, ContextType>;
};

export type UpsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Ups'] = ResolversParentTypes['Ups']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  address?: Resolver<Maybe<ResolversTypes['UserAddress']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['Media']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canUpdatePermissions?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canUpdateRole?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['PermissionSession']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserRoleObject']>, ParentType, ContextType>;
  tempUpdatedEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserAddressResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserAddress'] = ResolversParentTypes['UserAddress']> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  street?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type UserRoleObjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserRoleObject'] = ResolversParentTypes['UserRoleObject']> = {
  defaultPermissions?: Resolver<Array<ResolversTypes['RolePermissionSession']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSession'] = ResolversParentTypes['UserSession']> = {
  avatar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gender?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAccountActivated?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserSessionRoleObject']>, ParentType, ContextType>;
  sessionId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionByEmailResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSessionByEmail'] = ResolversParentTypes['UserSessionByEmail']> = {
  address?: Resolver<Maybe<ResolversTypes['UserAddress']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  bio?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canUpdatePermissions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdateRole?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  company?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserRoleObject']>, ParentType, ContextType>;
  tempEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tempUpdatedEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  website?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionByIdResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSessionById'] = ResolversParentTypes['UserSessionById']> = {
  address?: Resolver<Maybe<ResolversTypes['UserAddress']>, ParentType, ContextType>;
  avatar?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  bio?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  canUpdatePermissions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canUpdateRole?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  company?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  phone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['UserRoleObject']>, ParentType, ContextType>;
  tempEmailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tempUpdatedEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  website?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserSessionRoleObjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserSessionRoleObject'] = ResolversParentTypes['UserSessionRoleObject']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  AddressBook?: AddressBookResolvers<ContextType>;
  AddressResponseBook?: AddressResponseBookResolvers<ContextType>;
  AddressesBookResponse?: AddressesBookResponseResolvers<ContextType>;
  BaseResponse?: BaseResponseResolvers<ContextType>;
  BaseResponseOrError?: BaseResponseOrErrorResolvers<ContextType>;
  Brand?: BrandResolvers<ContextType>;
  BrandPaginationDataSession?: BrandPaginationDataSessionResolvers<ContextType>;
  BrandPaginationResponse?: BrandPaginationResponseResolvers<ContextType>;
  BrandResponse?: BrandResponseResolvers<ContextType>;
  BrandResponseById?: BrandResponseByIdResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  CategoryPaginationDataSession?: CategoryPaginationDataSessionResolvers<ContextType>;
  CategoryPaginationResponse?: CategoryPaginationResponseResolvers<ContextType>;
  CategoryResponse?: CategoryResponseResolvers<ContextType>;
  CategoryResponseById?: CategoryResponseByIdResolvers<ContextType>;
  CreateAddressBookResponseOrError?: CreateAddressBookResponseOrErrorResolvers<ContextType>;
  CreateBrandResponseOrError?: CreateBrandResponseOrErrorResolvers<ContextType>;
  CreateCategoryResponseOrError?: CreateCategoryResponseOrErrorResolvers<ContextType>;
  CreateProductResponseOrError?: CreateProductResponseOrErrorResolvers<ContextType>;
  CreateProductReviewResponseOrError?: CreateProductReviewResponseOrErrorResolvers<ContextType>;
  CreateRoleResponseOrError?: CreateRoleResponseOrErrorResolvers<ContextType>;
  CreateShippingClassResponseOrError?: CreateShippingClassResponseOrErrorResolvers<ContextType>;
  CreateShippingMethodResponseOrError?: CreateShippingMethodResponseOrErrorResolvers<ContextType>;
  CreateTagResponseOrError?: CreateTagResponseOrErrorResolvers<ContextType>;
  CreateTaxClassResponseOrError?: CreateTaxClassResponseOrErrorResolvers<ContextType>;
  CreateTaxExemptionResponseOrError?: CreateTaxExemptionResponseOrErrorResolvers<ContextType>;
  CreateTaxRateResponseOrError?: CreateTaxRateResponseOrErrorResolvers<ContextType>;
  CreatedBy?: CreatedByResolvers<ContextType>;
  DeleteAddressResponseBook?: DeleteAddressResponseBookResolvers<ContextType>;
  DeleteAddressesBookResponseOrError?: DeleteAddressesBookResponseOrErrorResolvers<ContextType>;
  DeleteBrandResponseOrError?: DeleteBrandResponseOrErrorResolvers<ContextType>;
  DeleteCategoryResponseOrError?: DeleteCategoryResponseOrErrorResolvers<ContextType>;
  DeleteProductResponseOrError?: DeleteProductResponseOrErrorResolvers<ContextType>;
  DeleteProductReviewResponseOrError?: DeleteProductReviewResponseOrErrorResolvers<ContextType>;
  DeleteShippingClassResponseOrError?: DeleteShippingClassResponseOrErrorResolvers<ContextType>;
  DeleteShippingMethodResponseOrError?: DeleteShippingMethodResponseOrErrorResolvers<ContextType>;
  DeleteTagResponseOrError?: DeleteTagResponseOrErrorResolvers<ContextType>;
  DeleteTaxClassResponseOrError?: DeleteTaxClassResponseOrErrorResolvers<ContextType>;
  DeleteTaxExemptionResponse?: DeleteTaxExemptionResponseResolvers<ContextType>;
  DeleteTaxExemptionResponseOrError?: DeleteTaxExemptionResponseOrErrorResolvers<ContextType>;
  DeleteTaxRateResponseOrError?: DeleteTaxRateResponseOrErrorResolvers<ContextType>;
  EmailVerificationResponse?: EmailVerificationResponseResolvers<ContextType>;
  EmailVerificationResponseOrError?: EmailVerificationResponseOrErrorResolvers<ContextType>;
  ErrorResponse?: ErrorResponseResolvers<ContextType>;
  FieldError?: FieldErrorResolvers<ContextType>;
  FlatRate?: FlatRateResolvers<ContextType>;
  FreeShipping?: FreeShippingResolvers<ContextType>;
  GetAddressBookByIdResponseOrError?: GetAddressBookByIdResponseOrErrorResolvers<ContextType>;
  GetAddressesBookResponseOrError?: GetAddressesBookResponseOrErrorResolvers<ContextType>;
  GetBrandByIDResponseOrError?: GetBrandByIdResponseOrErrorResolvers<ContextType>;
  GetBrandsResponseOrError?: GetBrandsResponseOrErrorResolvers<ContextType>;
  GetCategoriesResponseOrError?: GetCategoriesResponseOrErrorResolvers<ContextType>;
  GetCategoryByIDResponseOrError?: GetCategoryByIdResponseOrErrorResolvers<ContextType>;
  GetMediaByIdResponseOrError?: GetMediaByIdResponseOrErrorResolvers<ContextType>;
  GetMediasResponseOrError?: GetMediasResponseOrErrorResolvers<ContextType>;
  GetPermissionsResponseOrError?: GetPermissionsResponseOrErrorResolvers<ContextType>;
  GetPersonalizedPermissionsResponseOrError?: GetPersonalizedPermissionsResponseOrErrorResolvers<ContextType>;
  GetProductByIdResponseOrError?: GetProductByIdResponseOrErrorResolvers<ContextType>;
  GetProductReviewByIdResponseOrError?: GetProductReviewByIdResponseOrErrorResolvers<ContextType>;
  GetProductReviewsResponseOrError?: GetProductReviewsResponseOrErrorResolvers<ContextType>;
  GetProductsResponseOrError?: GetProductsResponseOrErrorResolvers<ContextType>;
  GetProfileResponseOrError?: GetProfileResponseOrErrorResolvers<ContextType>;
  GetRoleByIDResponseOrError?: GetRoleByIdResponseOrErrorResolvers<ContextType>;
  GetRoleResponseOrError?: GetRoleResponseOrErrorResolvers<ContextType>;
  GetRolesResponseOrError?: GetRolesResponseOrErrorResolvers<ContextType>;
  GetShippingClassByIDResponseOrError?: GetShippingClassByIdResponseOrErrorResolvers<ContextType>;
  GetShippingClassesResponseOrError?: GetShippingClassesResponseOrErrorResolvers<ContextType>;
  GetShippingMethodByIDResponseOrError?: GetShippingMethodByIdResponseOrErrorResolvers<ContextType>;
  GetShippingMethodsResponseOrError?: GetShippingMethodsResponseOrErrorResolvers<ContextType>;
  GetTagByIDResponseOrError?: GetTagByIdResponseOrErrorResolvers<ContextType>;
  GetTagsResponseOrError?: GetTagsResponseOrErrorResolvers<ContextType>;
  GetTaxClassByIDResponseOrError?: GetTaxClassByIdResponseOrErrorResolvers<ContextType>;
  GetTaxClassesResponseOrError?: GetTaxClassesResponseOrErrorResolvers<ContextType>;
  GetTaxExemptionsResponseOrError?: GetTaxExemptionsResponseOrErrorResolvers<ContextType>;
  GetTaxRateByIDResponseOrError?: GetTaxRateByIdResponseOrErrorResolvers<ContextType>;
  GetTaxRatesResponseOrError?: GetTaxRatesResponseOrErrorResolvers<ContextType>;
  GetUserByIDResponseOrError?: GetUserByIdResponseOrErrorResolvers<ContextType>;
  GetUserLoginInfoResponseOrError?: GetUserLoginInfoResponseOrErrorResolvers<ContextType>;
  GetUsersResponseOrError?: GetUsersResponseOrErrorResolvers<ContextType>;
  ICategoryBase?: ICategoryBaseResolvers<ContextType>;
  LocalPickUp?: LocalPickUpResolvers<ContextType>;
  LoginMeta?: LoginMetaResolvers<ContextType>;
  Media?: MediaResolvers<ContextType>;
  MediaDimension?: MediaDimensionResolvers<ContextType>;
  MediaResponse?: MediaResponseResolvers<ContextType>;
  MediasResponse?: MediasResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PermissionSession?: PermissionSessionResolvers<ContextType>;
  Permissions?: PermissionsResolvers<ContextType>;
  PermissionsResponse?: PermissionsResponseResolvers<ContextType>;
  PersonalizedWithRolePermissionResponse?: PersonalizedWithRolePermissionResponseResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductAttribute?: ProductAttributeResolvers<ContextType>;
  ProductAttributeValue?: ProductAttributeValueResolvers<ContextType>;
  ProductPaginationResponse?: ProductPaginationResponseResolvers<ContextType>;
  ProductPrice?: ProductPriceResolvers<ContextType>;
  ProductResponse?: ProductResponseResolvers<ContextType>;
  ProductReview?: ProductReviewResolvers<ContextType>;
  ProductReviewPaginationResponse?: ProductReviewPaginationResponseResolvers<ContextType>;
  ProductReviewResponse?: ProductReviewResponseResolvers<ContextType>;
  ProductTieredPrice?: ProductTieredPriceResolvers<ContextType>;
  ProductVariation?: ProductVariationResolvers<ContextType>;
  ProductVariationAttribute?: ProductVariationAttributeResolvers<ContextType>;
  ProductVariationAttributeValue?: ProductVariationAttributeValueResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RestoreBrandResponseOrError?: RestoreBrandResponseOrErrorResolvers<ContextType>;
  RestoreCategoryResponseOrError?: RestoreCategoryResponseOrErrorResolvers<ContextType>;
  RestoreProductResponseOrError?: RestoreProductResponseOrErrorResolvers<ContextType>;
  RestoreProductReviewResponseOrError?: RestoreProductReviewResponseOrErrorResolvers<ContextType>;
  RestoreShippingClassResponseOrError?: RestoreShippingClassResponseOrErrorResolvers<ContextType>;
  RestoreShippingMethodResponseOrError?: RestoreShippingMethodResponseOrErrorResolvers<ContextType>;
  RestoreTagResponseOrError?: RestoreTagResponseOrErrorResolvers<ContextType>;
  RestoreTaxClassResponseOrError?: RestoreTaxClassResponseOrErrorResolvers<ContextType>;
  RestoreTaxRateResponseOrError?: RestoreTaxRateResponseOrErrorResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RolePermissionSession?: RolePermissionSessionResolvers<ContextType>;
  RoleResponse?: RoleResponseResolvers<ContextType>;
  RoleSession?: RoleSessionResolvers<ContextType>;
  RolesResponse?: RolesResponseResolvers<ContextType>;
  ShippingClass?: ShippingClassResolvers<ContextType>;
  ShippingClassPaginationDataSession?: ShippingClassPaginationDataSessionResolvers<ContextType>;
  ShippingClassPaginationResponse?: ShippingClassPaginationResponseResolvers<ContextType>;
  ShippingClassResponse?: ShippingClassResponseResolvers<ContextType>;
  ShippingMethod?: ShippingMethodResolvers<ContextType>;
  ShippingMethodPaginationResponse?: ShippingMethodPaginationResponseResolvers<ContextType>;
  ShippingMethodResponse?: ShippingMethodResponseResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagPaginationDataSession?: TagPaginationDataSessionResolvers<ContextType>;
  TagPaginationResponse?: TagPaginationResponseResolvers<ContextType>;
  TagResponse?: TagResponseResolvers<ContextType>;
  TaxClass?: TaxClassResolvers<ContextType>;
  TaxClassPaginationDataSession?: TaxClassPaginationDataSessionResolvers<ContextType>;
  TaxClassPaginationResponse?: TaxClassPaginationResponseResolvers<ContextType>;
  TaxClassResponse?: TaxClassResponseResolvers<ContextType>;
  TaxExemption?: TaxExemptionResolvers<ContextType>;
  TaxExemptionResponse?: TaxExemptionResponseResolvers<ContextType>;
  TaxRate?: TaxRateResolvers<ContextType>;
  TaxRatePaginationResponse?: TaxRatePaginationResponseResolvers<ContextType>;
  TaxRateResponse?: TaxRateResponseResolvers<ContextType>;
  TaxRateSession?: TaxRateSessionResolvers<ContextType>;
  UpdateAddressBookResponseOrError?: UpdateAddressBookResponseOrErrorResolvers<ContextType>;
  UpdateBrandResponseOrError?: UpdateBrandResponseOrErrorResolvers<ContextType>;
  UpdateCategoryResponseOrError?: UpdateCategoryResponseOrErrorResolvers<ContextType>;
  UpdateMediaResponseOrError?: UpdateMediaResponseOrErrorResolvers<ContextType>;
  UpdateProductResponseOrError?: UpdateProductResponseOrErrorResolvers<ContextType>;
  UpdateProductReviewResponseOrError?: UpdateProductReviewResponseOrErrorResolvers<ContextType>;
  UpdateRoleResponseOrError?: UpdateRoleResponseOrErrorResolvers<ContextType>;
  UpdateShippingClassResponseOrError?: UpdateShippingClassResponseOrErrorResolvers<ContextType>;
  UpdateShippingMethodResponseOrError?: UpdateShippingMethodResponseOrErrorResolvers<ContextType>;
  UpdateTagResponseOrError?: UpdateTagResponseOrErrorResolvers<ContextType>;
  UpdateTaxClassResponseOrError?: UpdateTaxClassResponseOrErrorResolvers<ContextType>;
  UpdateTaxExemptionResponseOrError?: UpdateTaxExemptionResponseOrErrorResolvers<ContextType>;
  UpdateTaxRateResponseOrError?: UpdateTaxRateResponseOrErrorResolvers<ContextType>;
  UploadMediaResponse?: UploadMediaResponseResolvers<ContextType>;
  UploadMediaResponseOrError?: UploadMediaResponseOrErrorResolvers<ContextType>;
  Ups?: UpsResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserAddress?: UserAddressResolvers<ContextType>;
  UserLoginInfoResponse?: UserLoginInfoResponseResolvers<ContextType>;
  UserLoginResponse?: UserLoginResponseResolvers<ContextType>;
  UserLoginResponseOrError?: UserLoginResponseOrErrorResolvers<ContextType>;
  UserProfileUpdateResponse?: UserProfileUpdateResponseResolvers<ContextType>;
  UserProfileUpdateResponseOrError?: UserProfileUpdateResponseOrErrorResolvers<ContextType>;
  UserResponse?: UserResponseResolvers<ContextType>;
  UserRoleObject?: UserRoleObjectResolvers<ContextType>;
  UserSession?: UserSessionResolvers<ContextType>;
  UserSessionByEmail?: UserSessionByEmailResolvers<ContextType>;
  UserSessionById?: UserSessionByIdResolvers<ContextType>;
  UserSessionRoleObject?: UserSessionRoleObjectResolvers<ContextType>;
  UsersResponse?: UsersResponseResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = Context> = {
  defer?: DeferDirectiveResolver<any, any, ContextType>;
};
