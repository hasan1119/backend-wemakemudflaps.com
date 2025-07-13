import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FlatRateCost } from "./flat-rate-cost.entity";

@Entity()
export class FlatRate {
  // Unique identifier for the flat rate
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The title of the flat rate (e.g., "Standard Flat Rate", "Express Flat Rate")
  @Column()
  title: string;

  // Indicates whether the flat rate is active or not
  @Column({ default: false })
  taxStatus: boolean;

  // The cost associated with the flat rate
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  cost: number;

  // Description of the flat rate, explaining its details or usage
  @OneToMany(() => FlatRateCost, (cost) => cost.flatRate, {
    cascade: true,
    eager: true,
  })
  costs: FlatRateCost[];

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
