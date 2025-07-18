import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ShippingClass } from "./shipping-class.entity";

@Entity("tax_options")
export class TaxOptions {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ default: false })
  pricesEnteredWithTax: boolean; // true = inclusive, false = exclusive

  @Column({
    enum: ["Shipping Address", "Billing Address", "Store Address"],
    default: "Shipping Address",
  })
  calculateTaxBasedOn: string;

  @ManyToOne(() => ShippingClass, { nullable: true })
  @JoinColumn()
  shippingTaxClass: ShippingClass | null;

  // The tax class applied to products by default
  @Column({ type: "boolean", default: false })
  displayPricesInShop: boolean;

  // The tax class applied to products during cart and checkout
  @Column({ type: "boolean", default: false })
  displayPricesDuringCartAndCheckout: boolean;

  // The tax class applied to products in the admin area
  @Column()
  priceDisplaySuffix: string;

  // Whether to round tax at the total level
  @Column({
    enum: ["As A Single Item", "Itemized"],
    default: "As A Single Item",
  })
  displayTaxTotals: string;

  // Whether to round tax at the subtotal level
  @Column({ type: "boolean", default: false })
  roundTaxAtSubtotalLevel: boolean;

  // User ID who created the tax options (string only for Apollo Federation compatibility)
  @Column()
  createdBy: string;

  // Timestamp when the record was created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp when the record was last updated
  @UpdateDateColumn()
  updatedAt: Date;
}
