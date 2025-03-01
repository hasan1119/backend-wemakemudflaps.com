import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, User, VariantValue } from "../../../entities/index";

@Entity()
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.wishlistItems, { nullable: true })
  createdBy: User | null; // Nullable for guest carts

  @Column({ nullable: true })
  guestSessionId: string | null; // For guest carts

  @ManyToOne(() => Product, (product) => product.wishlistItems)
  product: Product;

  @ManyToOne(() => VariantValue, (variantValue) => variantValue.wishlistItems, {
    nullable: true,
  })
  variant: VariantValue | null;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
