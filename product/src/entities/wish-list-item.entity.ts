import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductVariation } from "./product-variation.entity";
import { Product } from "./product.entity";
import { Wishlist } from "./wish-list.entity";

@Entity()
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Relationship to Product
  @ManyToOne(() => Product, { nullable: false, onDelete: "CASCADE" })
  product: Product;

  // Optional relation to Product Variation (if this wishlist item is a specific product variation)
  @ManyToOne(() => ProductVariation, { nullable: true })
  productVariation: ProductVariation | null;

  // Relationship to Wishlist
  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: "CASCADE",
  })
  wishlist: Promise<Wishlist>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
