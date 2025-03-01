import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product, User } from "../../../entities/index";

@Entity()
export class ProductReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: false })
  comment: string;

  @Column({ type: "int", nullable: false })
  rating: number; // Rating out of 5

  @Column({ type: "boolean", default: false })
  isApproved: boolean; // Admin can approve or reject reviews

  @ManyToOne(() => User, (user) => user.productReviews, { nullable: true })
  reviewedBy: User | null; // Nullable for guest reviews

  @Column({ nullable: true })
  guestName: string | null; // Name of the guest user

  @Column({ nullable: true })
  guestEmail: string | null; // Email of the guest user

  @ManyToOne(() => Product, (product) => product.reviews, { nullable: false })
  product: Product; // Product being reviewed

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  updatedAt: Date | null; // Timestamp for when the review is updated

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
