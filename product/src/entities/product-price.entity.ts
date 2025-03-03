import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product, VariantValue } from "../../../entities/index";

@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  minQuantity: number; // Minimum quantity for this price tier

  @Column({ nullable: true })
  maxQuantity: number | null; // Maximum quantity (nullable for open-ended tiers like 40+)

  @Column("decimal", { precision: 10, scale: 2 })
  price: number; // Price for this tier

  @ManyToOne(() => Product, (product) => product.prices, {
    nullable: true,
    onDelete: "CASCADE",
  })
  product: Product | null;

  @ManyToOne(() => VariantValue, (variant) => variant.prices, {
    nullable: true,
    onDelete: "CASCADE",
  })
  variant: VariantValue | null;
}
