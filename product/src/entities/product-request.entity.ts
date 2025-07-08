import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ProductRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The name of the requested product
  @Column()
  productName: string;

  // A detailed description of the requested product
  @Column({ type: "text", nullable: false })
  description: string;

  // The status of the product request, which can either be "pending" or "fulfilled"
  @Column({
    type: "enum",
    enum: ["pending", "rejected", "fulfilled"],
    default: "pending",
  })
  status: string;

  // User ID who user who requested the product (string only for Apollo Federation compatibility)
  @Column({ nullable: true, default: null })
  requestedBy: string | null;

  // Email for guest orders (nullable)
  @Column({ nullable: true, default: null })
  guestEmail: string | null;

  // Name for guest orders (nullable)
  @Column({ nullable: true, default: null })
  guestName: string | null;

  // Phone number for guest orders (nullable)
  @Column({ nullable: true, default: null })
  guestPhone: string | null;

  // Timestamp when the product request was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true, default: null })
  deletedAt: Date | null;
}
