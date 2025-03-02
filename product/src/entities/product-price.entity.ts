import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  minQuantity: number; // Minimum quantity for this price tier

  @Column({ nullable: true })
  maxQuantity: number; // Maximum quantity (nullable for open-ended tiers like 40+)

  @Column("decimal", { precision: 10, scale: 2 })
  price: number; // Price for this tier

  @ManyToOne(() => Product, (product) => product.prices, {
    onDelete: "CASCADE",
  })
  product: Product;
}
