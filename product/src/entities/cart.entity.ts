import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CartItem } from "./cart-item.entity";
import { Coupon } from "./coupon.entity";

@Entity()
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  // Many-to-many relationship with Coupon
  @ManyToMany(() => Coupon, {
    nullable: true,
    onDelete: "SET NULL", // Set to null if the coupon is deleted
  })
  @JoinTable()
  coupons: Coupon[] | null;

  // User Id associated with the cart (string only for Apollo Federation compatibility))
  @Column()
  createdBy: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
