import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ShippingMethod } from "./shipping-method.entity";

@Entity()
export class ShippingZone {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Name of the shipping zone
  @Column()
  name: string;

  // Region or geographical area of the shipping zone
  @Column({ type: "text", array: true })
  regions: string[];

  // Zip codes applicable to the shipping zone
  @Column({ type: "text", array: true, nullable: true, default: null })
  zipCodes: string[] | null;

  // If the shipping zone is deleted then delete the shipping methods associated with it
  @ManyToOne(() => ShippingMethod, (shippingMethod) => shippingMethod, {
    onDelete: "CASCADE",
    nullable: true,
  })
  shippingMethods: ShippingMethod[] | null;

  // User ID who created the tag (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the tag was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
