import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Media, Product, VariantAttribute } from "../../../entities/index";

@Entity()
export class VariantValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  sku: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  additionalInfo: string | null;

  @Column({ nullable: true })
  warranty: number | null;

  @Column({
    type: "enum",
    enum: [
      "day",
      "days",
      "week",
      "weeks",
      "month",
      "months",
      "year",
      "years",
      "life-time",
    ],
    nullable: true,
  })
  warrantyPeriod:
    | "day"
    | "days"
    | "week"
    | "weeks"
    | "month"
    | "months"
    | "year"
    | "years"
    | "life-time"
    | null;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  product: Product;

  @ManyToMany(() => VariantAttribute)
  @JoinTable()
  attributes: VariantAttribute[];

  @OneToMany(() => Media, (media) => media.variantValue, { cascade: true })
  photos: Media[];
}
