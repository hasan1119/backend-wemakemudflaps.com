import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FreeShipping {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The title of the free shipping option
  @Column()
  title: string;

  @Column({
    type: "text",
    enum: [
      "N/A",
      "Coupon",
      "Minimum Order Amount",
      "Minimum Order Amount or Coupon",
      "Minimum Order Amount & Coupon",
    ],
    default: "N/A",
  })
  conditions: string;

  // The minimum order amount required for free shipping, if applicable
  @Column({ type: "decimal", nullable: true, default: null })
  minimumOrderAmount: number | null;

  // Apply minimum order rule before coupon discount
  @Column({ default: false })
  applyMinimumOrderRuleBeforeCoupon: boolean;

  // User ID who created the flat rate (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the flat rate was created
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
