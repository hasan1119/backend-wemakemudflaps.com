import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FlatRate } from "./flat-rate.entity";
import { ShippingClass } from "./shipping-class.entity";

@Entity()
export class FlatRateCost {
  // Unique identifier for the flat rate cost entry
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The flat rate associated with this cost entry
  @ManyToOne(() => FlatRate, (flatRate) => flatRate.costs, {
    onDelete: "CASCADE",
  })
  flatRate: Promise<FlatRate>;

  // The shipping class associated with this flat rate cost
  @ManyToOne(() => ShippingClass, { eager: true, onDelete: "CASCADE" })
  shippingClass: ShippingClass;

  // The title of the flat rate cost (e.g., "Standard Cost", "Express Cost")
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  cost: number;
}
