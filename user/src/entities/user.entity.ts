import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {
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
  SubCategory,
  TermAndCondition,
  Variant,
  Wishlist,
} from "../../../entities/index"; // Adjust imports as needed

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: ["male", "female", "others", "rather not to say"],
    nullable: true,
    default: null
  })
  gender: string | null;

  @Column({
    type: "enum",
    enum: ["customer", "admin"],
    default: "customer",
  })
  role: string;

  @OneToMany(() => Category, (category) => category.createdBy)
  categories: Category[];

  @OneToMany(() => SubCategory, (subCategory) => subCategory.createdBy)
  subCategories: SubCategory[];

  @OneToMany(() => Product, (product) => product.createdBy)
  products: Product[];

  @OneToMany(() => Variant, (variation) => variation.createdBy)
  variations: Variant[];

  @OneToMany(() => Order, (order) => order.orderedBy)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.createdBy)
  cartItems: Cart[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.createdBy)
  wishlistItems: Wishlist[];

  @OneToMany(() => ProductReview, (review) => review.reviewdBy)
  productReviews: ProductReview[];

  @OneToMany(() => ProductRequest, (request) => request.requestedBy)
  productRequests: ProductRequest[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Media, (media) => media.createdBy)
  media: Media[];

  @OneToMany(() => Coupon, (coupon) => coupon.createdBy)
  coupons: Coupon[];

  @OneToMany(() => FAQ, (faq) => faq.createdBy)
  faq: FAQ[];

  @OneToMany(() => PrivacyPolicy, (privacyPolicy) => privacyPolicy.createdBy)
  privacyPolicies: PrivacyPolicy[];

  @OneToMany(
    () => TermAndCondition,
    (termsAndCondition) => termsAndCondition.createdBy
  )
  termsAndConditions: TermAndCondition[];

  @OneToMany(() => PopupBanner, (popupBanner) => popupBanner.createdBy)
  popupBanners: PopupBanner[];

  @OneToMany(() => Newsletter, (newsLetter) => newsLetter.createdBy)
  newsLetters: Newsletter[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
