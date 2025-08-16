import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum FreeShippingConditions {
  NA = "NA",
  COUPON = "COUPON",
  MINIMUM_ORDER_AMOUNT = "MINIMUM_ORDER_AMOUNT",
  MINIMUM_ORDER_AMOUNT_OR_COUPON = "MINIMUM_ORDER_AMOUNT_OR_COUPON",
  MINIMUM_ORDER_AMOUNT_AND_COUPON = "MINIMUM_ORDER_AMOUNT_AND_COUPON",
}

@Entity()
export class FreeShipping {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The title of the free shipping option
  @Column()
  title: string;

  @Column({
    type: "text",
    enum: FreeShippingConditions,
    default: FreeShippingConditions.NA,
  })
  conditions: FreeShippingConditions;

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
