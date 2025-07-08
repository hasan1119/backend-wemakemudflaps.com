import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Product Id associated with the cart (string only for Apollo Federation compatibility))
  @Column()
  productId: string;

  // TODO: Handle product variations (store variation ID or manage variations separately)
  // If product variations exist, consider whether each cart item should store a variation ID
  // You could add a column like `variationId: string` or use another entity to link variations

  // User Id associated with the cart (string only for Apollo Federation compatibility))
  @Column()
  createdBy: string;

  @Column({ nullable: true, default: null })
  guestSessionId: string | null; // For guest carts

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
