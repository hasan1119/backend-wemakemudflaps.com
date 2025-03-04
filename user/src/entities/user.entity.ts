import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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
  PopupBanner,
  PrivacyPolicy,
  Product,
  ProductRequest,
  ProductReview,
  ShippingClass,
  SubCategory,
  TaxClass,
  TaxStatus,
  TermAndCondition,
  Wishlist,
} from "../../../entities";

@Entity()
export class User {
  // Auto-incrementing primary key
  @PrimaryGeneratedColumn()
  id: number;

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
    enum: ["male", "female", "others", "rather not to say"],
    nullable: true,
    default: null,
  })
  gender: string | null;

  // Role of the user (customer/admin)
  @Column({
    type: "enum",
    enum: ["customer", "admin"],
    default: "customer",
  })
  role: string;

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
