import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LocalPickUp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // The title of the local pick-up option
  @Column()
  title: string;

  // Indicates whether the local pick-up is active or not
  @Column({ default: false })
  taxStatus: boolean;

  // The cost associated with the local pick-up
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  cost: number;

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
