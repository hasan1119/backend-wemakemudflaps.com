import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, User } from "../../../entities";

@Entity()
export class ProductReview {
  // Auto-incrementing primary key for the product review
  @PrimaryGeneratedColumn()
  id: number;

  // The comment left by the user or guest about the product
  @Column({ type: "text", nullable: false })
  comment: string;

  // The rating given to the product (out of 5)
  @Column({ type: "int", nullable: false })
  rating: number;

  // Indicates if the review is approved or rejected by an admin
  @Column({ type: "boolean", default: false })
  isApproved: boolean;

  // This field stores the user who left the review, can be null for guest reviews
  @ManyToOne(() => User, (user) => user.productReviews, { nullable: true })
  reviewedBy: User | null;

  // Name of the guest user leaving the review (nullable)
  @Column({ nullable: true })
  guestName: string | null;

  // Email of the guest user leaving the review (nullable)
  @Column({ nullable: true })
  guestEmail: string | null;

  // This field stores the product being reviewed
  @ManyToOne(() => Product, (product) => product.reviews, { nullable: false })
  product: Product;

  // Timestamp when the product review was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
