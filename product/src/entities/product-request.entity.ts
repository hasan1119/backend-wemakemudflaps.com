import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities";

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
    enum: ["pending", "fulfilled"],
    default: "pending",
  })
  status: string;

  // This field stores the user who requested the product, can be null for guest orders
  @ManyToOne(() => User, (user) => user.productRequests, { nullable: true })
  requestedBy: User | null;

  // Email for guest orders (nullable)
  @Column({ nullable: true })
  guestEmail: string | null;

  // Name for guest orders (nullable)
  @Column({ nullable: true })
  guestName: string | null;

  // Phone number for guest orders (nullable)
  @Column({ nullable: true })
  guestPhone: string | null;

  // Timestamp when the product request was created (auto-generated)
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  // Timestamp for soft deletion (null if not deleted)
  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
