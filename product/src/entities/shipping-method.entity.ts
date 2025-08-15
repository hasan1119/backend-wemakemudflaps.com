import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FlatRate } from "./flat-rate.entity";
import { FreeShipping } from "./free-shipping.entity";
import { LocalPickUp } from "./local-pick-up.entity";
import { ShippingZone } from "./shipping-zone.entity";
import { Ups } from "./ups.entity";

@Entity()
export class ShippingMethod {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The title of the shipping method (e.g., "Standard Shipping", "Express Shipping")
  @Column()
  title: string;

  // Indicates whether the shipping method is active or not
  @Column({ default: false })
  status: boolean;

  // Description of the shipping method, explaining its details or usage
  @Column({ type: "text", nullable: true, default: null })
  description: string | null;

  // The shipping zone this method belongs to
  @ManyToOne(() => ShippingZone, (zone) => zone.shippingMethods, {
    onDelete: "CASCADE", // Automatically delete this method if the shipping zone is deleted
    nullable: true,
  })
  shippingZone: ShippingZone | null;

  // Only one of these relations should be set at a time
  // Flat Rate shipping method
  @OneToOne(() => FlatRate, {
    nullable: true,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  flatRate: FlatRate | null;

  // Free Shipping method
  @OneToOne(() => FreeShipping, {
    nullable: true,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  freeShipping: FreeShipping | null;

  // Local Pick Up method
  @OneToOne(() => LocalPickUp, {
    nullable: true,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  localPickUp: LocalPickUp | null;

  // UPS shipping method
  @OneToOne(() => Ups, { nullable: true, cascade: true, onDelete: "CASCADE" })
  @JoinColumn()
  ups: Ups | null;

  // User ID who created the shipping method (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the shipping method was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
