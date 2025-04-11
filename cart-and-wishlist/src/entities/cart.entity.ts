import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, User, VariantValue } from "../../../entities";

@Entity()
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Product, (product) => product.cartItems)
  product: Product;

  @ManyToOne(() => VariantValue, (variantValue) => variantValue.cartItems, {
    nullable: true,
  })
  variant: VariantValue | null;

  @ManyToOne(() => User, (user) => user.cartItems, { nullable: true })
  createdBy: User | null; // Nullable for guest carts

  @Column({ nullable: true })
  guestSessionId: string | null; // For guest carts

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null; // For soft deletion
}
