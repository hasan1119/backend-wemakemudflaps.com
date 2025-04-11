import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  Brand,
  Cart,
  Category,
  Coupon,
  FAQ,
  Media,
  Newsletter,
  Notification,
  Order,
  Permission,
  PopupBanner,
  PrivacyPolicy,
  Product,
  ProductRequest,
  ProductReview,
  Role,
  ShippingClass,
  SubCategory,
  TaxClass,
  TaxStatus,
  TermAndCondition,
  Wishlist,
} from "../../../entities";
@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // First name of the user
  @Column()
  firstName: string;

  // Last name of the user
  @Column()
  lastName: string;

  // User's unique email address
  @Column({ unique: true })
  email: string;

  // Hashed password of the user
  @Column()
  password: string;

  // Gender of the user (optional)
  @Column({
    type: "enum",
    enum: ["Male", "Female", "Others", "Rather not to say"],
    nullable: true,
    default: null,
  })
  gender: string | null;

  // Each user has only one role
  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: "roleId" })
  role: Role;

  // forget password token
  @Column({ nullable: true })
  resetPasswordToken: string | null;

  // Roles created by this user
  @OneToMany(() => Role, (role) => role.createdBy)
  roles: Role[];

  // Permissions specific to each user
  @OneToMany(() => Permission, (permission) => permission.user)
  permissions: Permission[];

  // Orders placed by the user
  @OneToMany(() => Order, (order) => order.orderedBy)
  orders: Order[];

  // Items added to the cart by the user
  @OneToMany(() => Cart, (cart) => cart.createdBy)
  cartItems: Cart[];

  // Wishlist items saved by the user
  @OneToMany(() => Wishlist, (wishlist) => wishlist.createdBy)
  wishlistItems: Wishlist[];

  // Notifications associated with the user
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Media files uploaded by the user
  @OneToMany(() => Media, (media) => media.createdBy)
  media: Media[];

  /* ======================== Start: Product ======================== */

  // Brands created by the user (for admins)
  @OneToMany(() => Brand, (brand) => brand.createdBy)
  brands: Brand[];

  // Categories created by the user
  @OneToMany(() => Category, (category) => category.createdBy)
  categories: Category[];

  // Coupons created by the user (for admins)
  @OneToMany(() => Coupon, (coupon) => coupon.createdBy)
  coupons: Coupon[];

  // Product requests made by the user
  @OneToMany(() => ProductRequest, (request) => request.requestedBy)
  productRequests: ProductRequest[];

  // Product reviews written by the user
  @OneToMany(() => ProductReview, (review) => review.reviewedBy)
  productReviews: ProductReview[];

  // Products created by the user
  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  // Shipping class created by the user
  @OneToMany(() => ShippingClass, (shippingClass) => shippingClass.createdBy)
  shippingClass: ShippingClass[];

  // Subcategories created by the user
  @OneToMany(() => SubCategory, (subCategory) => subCategory.createdBy)
  subCategories: SubCategory[];

  // Tax class created by the user
  @OneToMany(() => TaxClass, (taxClass) => taxClass.createdBy)
  taxClass: TaxClass[];

  // Tax status created by the user
  @OneToMany(() => TaxStatus, (taxStatus) => taxStatus.createdBy)
  taxStatus: TaxStatus[];

  /* ======================== End: Product ======================== */

  /* ======================== Start: Site Settings ======================== */

  // FAQs created by the user (for admins)
  @OneToMany(() => FAQ, (faq) => faq.createdBy)
  faq: FAQ[];

  // Newsletters created by the user (for admins)
  @OneToMany(() => Newsletter, (newsLetter) => newsLetter.createdBy)
  newsLetters: Newsletter[];

  // Popup banners created by the user (for admins)
  @OneToMany(() => PopupBanner, (popupBanner) => popupBanner.createdBy)
  popupBanners: PopupBanner[];

  // Privacy policies created by the user (for admins)
  @OneToMany(() => PrivacyPolicy, (privacyPolicy) => privacyPolicy.createdBy)
  privacyPolicies: PrivacyPolicy[];

  // Terms & Conditions created by the user (for admins)
  @OneToMany(
    () => TermAndCondition,
    (termsAndCondition) => termsAndCondition.createdBy
  )
  termsAndConditions: TermAndCondition[];

  /* ======================== End: Site Settings ======================== */

  // Timestamp when the user was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
