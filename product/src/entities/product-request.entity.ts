import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../../entities/index";

@Entity()
export class ProductRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productName: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({
    type: "enum",
    enum: ["pending", "fulfilled"],
    default: "pending",
  })
  status: string;

  @ManyToOne(() => User, (user) => user.productRequests, { nullable: true })
  requestedBy: User | null; // Nullable for guest orders

  @Column({ nullable: true })
  guestEmail: string | null; // For guest orders

  @Column({ nullable: true })
  guestName: string | null; // For guest orders

  @Column({ nullable: true })
  guestPhone: string | null; // For guest orders

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date; // For soft deletion
}
