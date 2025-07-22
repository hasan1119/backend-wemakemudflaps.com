import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";
import { ProductVariation } from "./product-variation.entity";
import { Product } from "./product.entity";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  // Optional relation to Product (if this cart item is a specific product)
  @ManyToOne(() => Product, { nullable: true })
  product: Product | null;

  // Product variation ID associated with the cart (string only for Apollo Federation compatibility))
  @ManyToOne(() => ProductVariation, { nullable: true })
  productVariation: ProductVariation | null;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Promise<Cart>;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
