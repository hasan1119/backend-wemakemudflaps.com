import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  // Array of product ID in the cart (string only for Apollo Federation compatibility))
  @Column({ type: "text", nullable: true })
  product: string | null; // Array of product IDs in the cart

  // Product variation ID associated with the cart (string only for Apollo Federation compatibility))
  @Column({ type: "text", nullable: true })
  productVariation: string | null; // Product variation ID associated with the cart

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  cart: Cart;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
