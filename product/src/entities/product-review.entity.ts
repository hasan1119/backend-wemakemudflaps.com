import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductReview {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The comment left by the user or guest about the product
  @Column({ type: "text", nullable: false })
  comment: string;

  // The rating given to the product (out of 5)
  @Column({ type: "int", nullable: false })
  rating: number;

  // Indicates if the review is approved or rejected by an admin
  @Column({ type: "boolean", default: false })
  isApproved: boolean;

  // User ID who left the review (string only for Apollo Federation compatibility)
  @Column()
  reviewedBy: string;

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
